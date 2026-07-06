-- ============================================
-- BURG Apps v2 — Rollen-systeem
-- Schema + RLS policies + change_user_role()
-- Uitvoeren in de Supabase SQL editor van het nieuwe project.
-- ============================================

create extension if not exists pgcrypto;

-- ============================================
-- ENUM voor rollen
-- ============================================
create type user_role as enum ('admin', 'manager', 'user');

-- ============================================
-- PROFILES tabel (1-op-1 met auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  naam text,
  role user_role not null default 'user',
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- AUDIT LOG voor rolwijzigingen
-- ============================================
create table role_audit_log (
  id uuid default gen_random_uuid() primary key,
  target_user_id uuid references profiles(id) not null,
  changed_by uuid references profiles(id) not null,
  old_role user_role,
  new_role user_role,
  changed_at timestamptz not null default now()
);

-- ============================================
-- Trigger: automatisch profile aanmaken bij nieuwe auth user
-- ============================================
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- Trigger: updated_at automatisch bijwerken
-- ============================================
create function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on profiles
  for each row execute procedure handle_updated_at();

-- ============================================
-- RLS aanzetten
-- ============================================
alter table profiles enable row level security;
alter table role_audit_log enable row level security;

-- ============================================
-- Helper: eigen rol ophalen zonder RLS-recursie
-- Een policy op `profiles` die een subquery op `profiles` doet, triggert
-- opnieuw diezelfde policies (RLS-policies worden als OR gecombineerd, dus
-- die subquery wordt voor elke select op profiles geëvalueerd) — dat geeft
-- letterlijk "infinite recursion detected in policy for relation profiles".
-- SECURITY DEFINER laat deze functie draaien als tabel-eigenaar, die RLS op
-- profiles niet ondergaat, dus geen recursie meer.
-- ============================================
create or replace function my_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- ============================================
-- PROFILES: lezen
-- ============================================
-- Iedereen mag zijn eigen profiel lezen
create policy "eigen profiel lezen"
  on profiles for select
  using (auth.uid() = id);

-- Admins mogen alle profielen lezen
create policy "admin leest alle profielen"
  on profiles for select
  using (my_role() = 'admin');

-- Managers mogen alle profielen lezen (read-only overzicht, geen edit-rechten)
create policy "manager leest alle profielen"
  on profiles for select
  using (my_role() = 'manager');

-- ============================================
-- PROFILES: wijzigen
-- ============================================
-- Er is bewust GEEN UPDATE-policy op profiles. Een policy die enkel test
-- "is de aanroeper admin" (ongeacht welke rij hij target) staat toe dat een
-- admin via een kale .update() de rol van elke andere gebruiker wijzigt,
-- buiten change_user_role() om — zonder de laatste-admin-check en zonder
-- audit-log entry. Alle rolwijzigingen lopen daarom uitsluitend via
-- change_user_role(): die functie is SECURITY DEFINER en voert haar eigen
-- UPDATE uit als tabel-eigenaar, dus ze heeft geen client-UPDATE-policy
-- nodig om te kunnen schrijven.

-- ============================================
-- AUDIT LOG: alleen admins zien 'm, alleen systeem schrijft
-- ============================================
create policy "admin leest audit log"
  on role_audit_log for select
  using (my_role() = 'admin');

create policy "admin schrijft audit log"
  on role_audit_log for insert
  with check (my_role() = 'admin');

-- ============================================
-- "Laatste admin"-bescherming
-- RLS alleen voorkomt zelf-degradatie, maar niet dat de laatste admin
-- door een andere admin wordt gedegradeerd. Daarom loopt elke rolwijziging
-- via deze functie i.p.v. een directe UPDATE op profiles.
-- ============================================
create or replace function change_user_role(
  target_id uuid,
  new_role_value user_role
)
returns void as $$
declare
  admin_count int;
  old_role_value user_role;
begin
  -- check: ben ik zelf admin?
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Alleen admins mogen rollen wijzigen';
  end if;

  -- check: een admin mag zichzelf niet degraderen, ook niet als er nog
  -- andere admins over zijn. Dit stond origineel alleen in de RLS UPDATE-
  -- policy (WITH CHECK), maar die policy is verwijderd omdat hij een
  -- bypass van deze functie mogelijk maakte. Zonder deze check hier zou
  -- zelf-degradatie alsnog lukken zolang er >1 admin is.
  if auth.uid() = target_id and new_role_value <> 'admin' then
    raise exception 'Een admin mag zichzelf niet degraderen';
  end if;

  -- Lock alle admin-rijen voor de duur van deze transactie. Zonder deze lock
  -- kunnen twee gelijktijdige aanroepen elk een stale admin_count lezen en
  -- de laatste twee admins tegelijk degraderen (check-then-act race).
  perform 1 from profiles where role = 'admin' for update;

  select role into old_role_value from profiles where id = target_id;

  -- check: is dit de laatste admin?
  if old_role_value = 'admin' and new_role_value <> 'admin' then
    select count(*) into admin_count from profiles where role = 'admin';
    if admin_count <= 1 then
      raise exception 'Kan de laatste admin niet degraderen';
    end if;
  end if;

  update profiles set role = new_role_value where id = target_id;

  insert into role_audit_log (target_user_id, changed_by, old_role, new_role)
  values (target_id, auth.uid(), old_role_value, new_role_value);
end;
$$ language plpgsql security definer;
