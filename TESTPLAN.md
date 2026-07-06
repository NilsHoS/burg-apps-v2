# Testplan — Rollen-systeem BURG Apps v2

Dit testplan test het 3-rollensysteem (`admin` > `manager` > `user`) zoals
geïmplementeerd in `supabase/schema.sql`, `src/lib/toolRegistry.js`,
`src/lib/AuthProvider.jsx`, `src/lib/adminApi.js`, `src/components/RoleGate.jsx`,
`src/components/RequireAuth.jsx` en de pagina's onder `src/pages/`.

**Status: dit plan kan pas uitgevoerd worden zodra er een echt Supabase-project
bestaat met het schema uit `supabase/schema.sql` toegepast en de 3 testaccounts
uit stap 1 zijn aangemaakt.** Er bestaat op dit moment nog geen live project.

Test niet de daadwerkelijke functionaliteit van Fee Checker, Verdeling
Plaatsing, Jobpull Overdracht, App Counter of Promotie Tracker — dit zijn
placeholders (`ToolPlaceholder.jsx`). Test alleen de toegang ertoe.

---

## 0. Vereisten voor te beginnen

- [ ] Supabase-project bestaat en `supabase/schema.sql` is volledig uitgevoerd
      in de SQL editor (enum, tabellen, triggers, RLS policies, RPC).
- [ ] Frontend draait tegen dit project (juiste `.env`/Supabase-URL en anon key).
- [ ] Je hebt toegang tot de Supabase dashboard (Table Editor + SQL Editor) om
      bootstrap-stappen en verificaties te kunnen uitvoeren.
- [ ] Browser met developer console beschikbaar (voor stap 5, de bypass-test).

---

## 1. Setup: 3 testaccounts aanmaken

`handle_new_user()` kent bij signup altijd de rol `'user'` toe. Er is bij een
vers project nog geen enkele admin, en `change_user_role()` mag alleen door
een admin aangeroepen worden — dus de eerste admin moet je one-time via een
directe SQL-update in de Supabase dashboard bootstrappen (dit is de enige
plek in dit hele testplan waar een directe UPDATE op `profiles.role`
toegestaan/nodig is, omdat er letterlijk nog geen RPC-pad bestaat).

1. [ ] Maak in de app (of via Supabase Auth dashboard → "Add user") 3 nieuwe
       gebruikers aan:
       - `qa-admin@burg.test`
       - `qa-manager@burg.test`
       - `qa-user@burg.test`
       (wachtwoord naar keuze, bijv. `Testpass123!`)
2. [ ] Verifieer in Table Editor → `profiles` dat er voor alle 3 automatisch
       een rij is aangemaakt door `handle_new_user()`, elk met `role = 'user'`.
3. [ ] Open de Supabase SQL Editor en voer uit (one-time bootstrap, NIET via de
       app/RPC — dit mag alleen omdat er nog geen admin bestaat):
       ```sql
       update profiles set role = 'admin' where email = 'qa-admin@burg.test';
       update profiles set role = 'manager' where email = 'qa-manager@burg.test';
       ```
       `qa-user@burg.test` blijft op de default `'user'` staan — geen actie nodig.
4. [ ] Verifieer in Table Editor dat de 3 rijen nu respectievelijk
       `admin` / `manager` / `user` als rol hebben.
5. [ ] Log met alle 3 de accounts één keer in via `/login` om te bevestigen dat
       inloggen werkt en dat `profile.role` in de UI (topbar: "naam · rol")
       overeenkomt met wat je in stap 4 hebt gezet.
6. [ ] Noteer de `id` (uuid) van elk van de 3 profielen — nodig in latere
       stappen voor directe RPC/`.update()`-calls via de console.

**Let op:** vanaf dit punt in het testplan gaat elke rolwijziging via de UI
(AdminPanel) of expliciet via `supabase.rpc('change_user_role', ...)` — nooit
meer via directe SQL, behalve waar een stap dat expliciet als
bootstrap/reset-actie aangeeft.

---

## 2. Zelf-degradatie geblokkeerd

Doel: een admin mag zichzelf niet degraderen, ook al biedt de UI daar geen
expliciete blokkade voor (de dropdown in `AdminPanel.jsx` toont gewoon alle
opties, inclusief voor je eigen rij).

1. [ ] Log in als `qa-admin@burg.test`.
2. [ ] Navigeer naar `/admin` (via de "Adminpaneel"-knop op het dashboard).
3. [ ] Zoek de eigen rij (`qa-admin@burg.test`) in de tabel.
4. [ ] Wijzig de dropdown in die rij van `admin` naar `manager`.
   - **Verwacht:** de dropdown springt eerst optimistisch naar `manager`
     (UI-gedrag uit `handleRoleChange`), maar veert daarna terug naar `admin`
     zodra de RPC-call faalt.
   - **Verwacht:** onder de dropdown van deze rij verschijnt een rode
     inline foutmelding (`role="alert"`) met de Postgres-foutmelding. Dit is
     geen "Kan de laatste admin niet degraderen" (want er zijn op dit moment
     3 profielen maar mogelijk nog maar 1 admin — zie hieronder), maar mogelijk
     wél die melding als `qa-admin` de enige admin is. Controleer eerst hoeveel
     admins er zijn:
     - Als er precies 1 admin is (waarschijnlijk in deze setup): verwachte
       foutmelding is **"Kan de laatste admin niet degraderen"**.
   - **Verwacht:** geen crash, geen witte pagina, geen silent revert zonder
     foutmelding.
5. [ ] Herhaal dezelfde actie voor `manager` → `user` op de eigen rij (indien
       van toepassing) — zelfde verwacht resultaat.
6. [ ] Refresh de pagina (`F5`) en verifieer dat `qa-admin@burg.test` nog
       steeds rol `admin` heeft in zowel de tabel als de topbar — de mislukte
       poging heeft dus geen deel-effect gehad.

**Bugrapport-sjabloon als dit faalt:**
- Stappen: zoals hierboven, met exacte accountnaam en tijdstip.
- Verwacht: RPC/RLS wijst de wijziging af, foutmelding zichtbaar inline.
- Werkelijk: (bijv. "rol wisselde daadwerkelijk naar manager" — **dit is een
  kritieke bug**, escaleer direct: dit is een privilege-de-escalatie-fout die
  ertoe kan leiden dat een organisatie zonder admin komt te zitten).

---

## 3. Laatste-admin-degradatie geblokkeerd

Voor deze test heb je tijdelijk een **2e admin** nodig naast `qa-admin`.

### 3a. Voorbereiding: tijdelijke 2e admin

1. [ ] Log in als `qa-admin@burg.test`, ga naar `/admin`.
2. [ ] Zet de rol van `qa-manager@burg.test` via de dropdown op `admin`.
   - **Verwacht:** dit lukt zonder foutmelding (promotie is nooit geblokkeerd,
     alleen degradatie van de laatste admin). Tabel toont nu 2 admins:
     `qa-admin` en `qa-manager`.

### 3b. Degradatie met 2 admins aanwezig — moet slagen

3. [ ] Nog steeds ingelogd als `qa-admin`, zet de rol van `qa-manager` terug
       van `admin` naar `manager` via de dropdown.
   - **Verwacht:** dit lukt. Geen foutmelding. Rij toont `manager`. Na
     `loadProfiles()` refresh in de tabel blijft dit ook zo staan (niet alleen
     optimistisch UI-effect, maar bevestigd door de server).
4. [ ] Verifieer in Table Editor → `role_audit_log` dat er een nieuwe rij is
       toegevoegd: `target_user_id` = `qa-manager`'s id, `old_role = 'admin'`,
       `new_role = 'manager'`, `changed_by` = `qa-admin`'s id.

### 3c. Degradatie met nog maar 1 admin — moet geblokkeerd worden

5. [ ] Situatie nu: alleen `qa-admin` is nog admin (uit stap 3b). Blijf
       ingelogd als `qa-admin` op `/admin`.
6. [ ] Probeer de eigen rij (`qa-admin`) te degraderen naar `manager`.
   - **Verwacht:** geblokkeerd met foutmelding **"Kan de laatste admin niet
     degraderen"**, inline zichtbaar onder de rij. Rol blijft `admin` na
     terugveren van de dropdown.
7. [ ] Promoot `qa-manager@burg.test` opnieuw naar `admin` (herhaal 3a stap 2),
       zodat er weer 2 admins zijn.
8. [ ] Log nu in als `qa-manager` (die nu admin is) en probeer via `/admin` de
       rij van `qa-admin` te degraderen naar `manager`, terwijl je *zelf* de
       enige overblijvende admin zou worden.
   - Let op: dit is toegestaan qua "zelf-degradatie"-regel (je degradeert een
     ander, niet jezelf), en er blijven na deze actie nog steeds `qa-manager`
     als enige admin over — dus dit is **niet** de laatste-admin-case.
   - **Verwacht:** dit **lukt** (er blijft 1 admin over: `qa-manager`). Dit is
     correct gedrag — de regel is "nooit 0 admins", niet "nooit minder dan 2".
9. [ ] Opruimen: log in als `qa-manager` (nu enige admin) en zet `qa-admin`
       weer terug op `admin` zodat de testaccounts weer in de oorspronkelijke
       staat staan voor volgende testruns (promotie is nooit geblokkeerd).
   Eindstand: `qa-admin` = admin, `qa-manager` = manager, `qa-user` = user.

---

## 4. Race condition regressietest (gelijktijdige `change_user_role()`-calls)

Doel: verifiëren dat de `for update`-lock op alle admin-rijen in
`change_user_role()` een check-then-act race daadwerkelijk voorkomt, ook als
twee aanroepen nagenoeg gelijktijdig binnenkomen.

### Voorbereiding

1. [ ] Zorg dat er precies 2 admins zijn: `qa-admin` en `qa-manager` (zet
       `qa-manager` tijdelijk op `admin` zoals in 3a, als dat nog niet zo is).
2. [ ] Noteer de uuid's van beide admin-profielen (`admin_a_id`, `admin_b_id`).

### Uitvoering — optie A: twee browsertabbladen

3. [ ] Open twee tabbladen, beide ingelogd als `qa-admin` (of één als
       `qa-admin`, één als `qa-manager` — beide zijn admin dus beide mogen de
       RPC aanroepen), beide op `/admin`.
4. [ ] In tabblad 1: zet de dropdown van `admin_a` (bijv. `qa-admin`) op
       `manager`, maar klik nog niet definitief door als dat een aparte stap
       is — bij deze UI is de `onChange` direct de trigger, dus bereid gewoon
       voor dat je in tabblad 2 direct erna handelt.
5. [ ] In tabblad 2: zet zo snel mogelijk na stap 4 de dropdown van `admin_b`
       (de andere admin) ook op `manager`.
   - **Verwacht:** precies één van de twee calls slaagt, de andere faalt met
     "Kan de laatste admin niet degraderen". Nooit allebei slagen (dat zou
     0 admins opleveren).

### Uitvoering — optie B: rechtstreeks via console (preciezer, aanbevolen)

Deze optie geeft echt gelijktijdige requests i.p.v. handmatig snel klikken,
en is daarom betrouwbaarder om de race te forceren.

6. [ ] Open de browserconsole terwijl je ingelogd bent als `qa-admin` (die
       zelf ook een van de twee admins mag zijn, of een 3e admin — voor de
       zuiverheid van de test kun je ook tijdelijk een 3e account promoten
       zodat de aanroeper zelf niet een van de twee gedegradeerde admins is;
       optioneel, niet strikt noodzakelijk).
7. [ ] Voer in de console uit (met de echte uuid's ingevuld), zodat beide
       calls zo goed als gelijktijdig vuren:
       ```js
       const [r1, r2] = await Promise.all([
         window.supabase.rpc('change_user_role', { target_id: '<admin_a_id>', new_role_value: 'manager' }),
         window.supabase.rpc('change_user_role', { target_id: '<admin_b_id>', new_role_value: 'manager' }),
       ])
       console.log('r1', r1.error?.message ?? 'OK')
       console.log('r2', r2.error?.message ?? 'OK')
       ```
       (Als `supabase` niet als `window.supabase` beschikbaar is in deze
       build, importeer/expose 'm tijdelijk voor deze test, of voer de 2
       calls uit als losse snippets in 2 tabs zo snel mogelijk na elkaar.)
   - **Verwacht:** exact één van `r1`/`r2` heeft `error === null` (geslaagd),
     de andere heeft `error.message === 'Kan de laatste admin niet degraderen'`.
8. [ ] Verifieer in Table Editor → `profiles` dat er na deze actie nog steeds
       **minimaal 1 admin** is (nooit 0).
9. [ ] Verifieer in `role_audit_log` dat er precies 1 nieuwe rij is
       toegevoegd voor deze actie (niet 2) — bevestigt dat de mislukte call
       geen audit-trail achterliet (die staat immers ná de exception-check in
       de functie).
10. [ ] Opruimen: herstel de oorspronkelijke rollen (`qa-admin` = admin,
        `qa-manager` = manager) via de RPC/UI.

**Bugrapport als dit faalt:** als beide calls slagen (0 admins na afloop) is
dit een **kritieke productie-bug** — escaleer direct. Dit betekent dat de
`for update`-lock niet werkt zoals bedoeld (bijv. omdat de twee calls niet in
dezelfde transactie/lock-scope vallen, of omdat de lock niet alle relevante
rijen pakt).

---

## 5. Direct-update bypass regressietest

Doel: bevestigen dat het verwijderen van de UPDATE-policy op `profiles` de
bypass daadwerkelijk dichtzet die de security review vond (een admin die via
een kale `.update()` de laatste-admin-check omzeilt).

1. [ ] Log in als `qa-admin` (moet écht admin zijn op dit moment).
2. [ ] Open de browserconsole op de ingelogde app.
3. [ ] Voer uit (vul de echte uuid van `qa-manager`'s profiel in, ongeacht
       diens huidige rol — het punt is dat dit sowieso niet via een kale
       update mag lukken):
       ```js
       const { data, error, count } = await window.supabase
         .from('profiles')
         .update({ role: 'user' })
         .eq('id', '<qa-manager-of-andere-admin-id>')
         .select()
       console.log({ data, error, count })
       ```
   - **Verwacht:** `data` is een lege array (`[]`) — RLS laat de UPDATE
     stilzwijgend 0 rijen raken omdat er geen UPDATE-policy is die dit
     toestaat (Postgres/PostgREST geeft hier typisch geen expliciete "access
     denied"-error, maar 0 affected rows, omdat er domweg geen policy is die
     matcht). `error` kan `null` zijn — dat is oké, de assertie is op
     "0 rijen gewijzigd", niet per se op een error-object.
4. [ ] Verifieer in Table Editor dat de rol van het doelwit-profiel
       **ongewijzigd** is gebleven.
5. [ ] Herhaal dezelfde test met het eigen profiel van `qa-admin` als target
       (zelf-update via kale `.update()`):
       ```js
       const { data } = await window.supabase
         .from('profiles')
         .update({ role: 'user' })
         .eq('id', '<qa-admin-eigen-id>')
         .select()
       console.log(data)
       ```
   - **Verwacht:** zelfde resultaat, `data` is `[]`, rol blijft `admin`.
6. [ ] Herhaal optioneel als `qa-user` (laagste rol) om te bevestigen dat ook
       zij geen enkele rol-wijziging via kale `.update()` kunnen forceren,
       zelfs niet op hun eigen rij.
   - **Verwacht:** zelfde resultaat, `data` is `[]`.

**Bugrapport als dit faalt:** als `data` een niet-lege array teruggeeft (de
update is doorgevoerd), is de bypass niet gedicht — **kritieke bug**,
escaleer direct. Dit betekent dat er ergens alsnog een UPDATE-policy actief is
op `profiles` (bijv. per ongeluk opnieuw toegevoegd, of een te ruime policy
van een andere naam die dit ook toestaat).

---

## 6. Per-rol tool-zichtbaarheid op het Dashboard

Op basis van `src/lib/toolRegistry.js` is de exacte matrix:

| Tool | minimumRole | admin | manager | user |
|---|---|---|---|---|
| App Counter | admin | **unlocked** | locked ("Vereist rol: Admin") | locked ("Vereist rol: Admin") |
| Promotie Tracker | manager | **unlocked** | **unlocked** | locked ("Vereist rol: Manager") |
| Fee Checker | user | **unlocked** | **unlocked** | **unlocked** |
| Verdeling Plaatsing | user | **unlocked** | **unlocked** | **unlocked** |
| Jobpull Overdracht | user | **unlocked** | **unlocked** | **unlocked** |

Belangrijk: locked tools moeten **zichtbaar maar uitgeschakeld** zijn (dit is
bewuste UX, geen bug) — test dus expliciet op "aanwezig in de tool-grid met
het hangslotje en de tekst 'Vereist rol: X'", niet op afwezigheid in de DOM.

### 6a. Als admin (`qa-admin`)

1. [ ] Log in, ga naar het dashboard (`/`).
2. [ ] Verifieer dat alle 5 tool-kaarten zichtbaar zijn.
3. [ ] Verifieer dat alle 5 kaarten **unlocked** zijn (klikbare `<Link>`,
       tekst "Openen →", geen hangslot-icoon, geen "Vereist rol"-tekst).
4. [ ] Klik op elke van de 5 tools en verifieer dat je op de bijbehorende
       `ToolPlaceholder`-pagina landt (titel = toolnaam, tekst "{naam} — nog
       te bouwen.").
5. [ ] Verifieer dat de knop "Adminpaneel" zichtbaar is in de topbar.

### 6b. Als manager (`qa-manager`)

6. [ ] Log in, ga naar het dashboard.
7. [ ] Verifieer: App Counter is **locked** (hangslot 🔒, tekst "Vereist rol:
       Admin", `aria-disabled="true"`, geen klikbare link).
8. [ ] Verifieer: Promotie Tracker, Fee Checker, Verdeling Plaatsing, Jobpull
       Overdracht zijn alle 4 **unlocked**.
9. [ ] Klik door op de 4 unlocked tools, verifieer dat elk de juiste
       `ToolPlaceholder` toont.
10. [ ] Verifieer dat de knop "Adminpaneel" **niet** zichtbaar is in de topbar
        (die conditie is `profile?.role === 'admin'`).

### 6c. Als user (`qa-user`)

11. [ ] Log in, ga naar het dashboard.
12. [ ] Verifieer: App Counter **locked** ("Vereist rol: Admin"), Promotie
        Tracker **locked** ("Vereist rol: Manager").
13. [ ] Verifieer: Fee Checker, Verdeling Plaatsing, Jobpull Overdracht alle 3
        **unlocked**.
14. [ ] Klik door op de 3 unlocked tools, verifieer juiste placeholder-pagina.
15. [ ] Verifieer dat de knop "Adminpaneel" niet zichtbaar is.
16. [ ] Klik (of probeer te klikken) op een locked tool-kaart (bijv. App
        Counter) — **verwacht:** geen navigatie, want dit is geen `<Link>`
        maar een `<div>` zonder `href`/`onClick`.

---

## 7. Directe URL-navigatie langs de UI om

Doel: verifiëren dat routebescherming en RLS ook standhouden als een
`user`-gebruiker de UI omzeilt en direct een URL intypt.

1. [ ] Log in als `qa-user`.
2. [ ] Typ handmatig `/admin` in de adresbalk en navigeer daarheen.
   - **Verwacht:** de `GeenToegang`-pagina wordt getoond ("Geen toegang" /
     "Je hebt niet de juiste rechten om deze pagina te bekijken." / knop
     "Terug naar dashboard"). **Niet** de echte `AdminPanel`-tabel, ook niet
     heel even (geen flits van gebruikersdata).
3. [ ] Typ handmatig `/tools/app-counter` in de adresbalk.
   - **Verwacht:** ook hier `GeenToegang`, niet de `ToolPlaceholder` van App
     Counter (die vereist `minimumRole: 'admin'`).
4. [ ] Typ handmatig een niet-bestaande route, bijv. `/dit-bestaat-niet`.
   - **Verwacht:** `GeenToegang` (catch-all route `*` in `App.jsx`, ook achter
     `RequireAuth`).

### Defense-in-depth: RLS als vangnet ook al zou de UI lekken

5. [ ] Blijf ingelogd als `qa-user`. Open de console en roep de onderliggende
       data-fetch rechtstreeks aan, ook al toont de UI 'm niet:
       ```js
       const { data, error } = await window.supabase.from('profiles').select('*')
       console.log(data, error)
       ```
   - **Verwacht:** `data` bevat **precies 1 rij**: het eigen profiel van
     `qa-user`. Geen rijen van `qa-admin` of `qa-manager` — dit bevestigt dat
     zelfs als `AdminPanel` per ongeluk zonder `RoleGate` gerenderd zou
     worden, `fetchAllProfiles()` alsnog niet de volledige gebruikerslijst zou
     lekken naar een `user`-rol account.
6. [ ] Herhaal stap 5 als `qa-manager` en als `qa-admin` ter vergelijking.
   - **Verwacht:** beide krijgen **alle** profielrijen terug (policies "admin
     leest alle profielen" / "manager leest alle profielen" zijn beide
     read-only `select`-policies zonder verdere restrictie).

---

## 8. Auth edge cases

1. [ ] **Uitgelogd → protected route:** zorg dat je uitgelogd bent (klik
       "Uitloggen" of wis de sessie). Navigeer direct naar `/`, `/admin`, of
       `/tools/fee-checker`.
   - **Verwacht:** in alle gevallen redirect naar `/login` (via
     `RequireAuth`'s `<Navigate to="/login" state={{ from: location }} />`).
2. [ ] **Verkeerd wachtwoord:** vul op `/login` een geldig e-mailadres
       (bijv. `qa-user@burg.test`) in met een fout wachtwoord.
   - **Verwacht:** inline foutmelding **"E-mailadres of wachtwoord is
     onjuist."** (specifieke mapping van Supabase's "Invalid login
     credentials" in `Login.jsx`). Geen redirect, formulier blijft staan,
     velden behouden hun ingevulde waarde (behalve evt. wachtwoordveld, dat
     is acceptabel), geen crash.
3. [ ] **Onbekend e-mailadres:** login met een niet-bestaand e-mailadres.
   - **Verwacht:** zelfde foutmelding als stap 2 (Supabase differentieert hier
     bewust niet, om account-enumeratie te voorkomen) — als de melding
     afwijkt, is dat geen bug maar wel het noteren waard.
4. [ ] **Redirect na login naar oorspronkelijke bestemming:** log uit, navigeer
       (uitgelogd) naar `/tools/verdeling-plaatsing`, wordt naar `/login`
       gestuurd, log in met geldige `qa-user`-credentials.
   - **Verwacht:** na succesvolle login land je direct op
     `/tools/verdeling-plaatsing` (niet op `/`), via de `location.state.from`
     mechaniek in zowel `Login.jsx` als `RequireAuth.jsx`.
5. [ ] **Al ingelogd + `/login` bezoeken:** terwijl je ingelogd bent, navigeer
       handmatig naar `/login`.
   - **Verwacht:** je wordt meteen doorgestuurd naar `/` (of naar
     `location.state.from` indien aanwezig) — het loginformulier wordt niet
     getoond aan een reeds ingelogde gebruiker (`if (user) return <Navigate ...>`
     in `Login.jsx`).
6. [ ] **Refresh terwijl ingelogd — geen flits van loginscherm:** log in,
       navigeer naar `/` of een andere protected route, doe een harde refresh
       (`Cmd+R` / `F5`).
   - **Verwacht:** kort een "Laden…" state (`RequireAuth`'s loading-branch),
     daarna weer de authenticated pagina waar je was. **Niet**: een korte
     flits van het loginscherm voordat de sessie hersteld is.
7. [ ] **Refresh op een tool-pagina met specifieke rol:** log in als
       `qa-manager`, navigeer naar `/tools/promotie-tracker`, ververs de
       pagina.
   - **Verwacht:** na de laad-state land je weer op dezelfde
     `ToolPlaceholder`-pagina (Promotie Tracker), niet op het dashboard en
     niet op `GeenToegang` (rol blijft immers hetzelfde na refresh, dus
     `hasAccess` blijft `true`).
8. [ ] **Uitloggen vanaf een tool-pagina:** navigeer naar een willekeurige
       tool, klik (indien aanwezig) uitloggen, of navigeer terug naar `/` en
       log daar uit.
   - **Verwacht:** je komt op `/login` terecht; een daaropvolgende poging om
     handmatig terug te navigeren naar de tool-URL (browser back-button of
     opnieuw intypen) stuurt je terug naar `/login` (sessie is echt weg, geen
     stale client-side state die toegang blijft geven).

---

## Regressietest-checklist voor releases (rollensysteem)

Bij elke wijziging aan `schema.sql`, `toolRegistry.js`, `AuthProvider.jsx`,
`adminApi.js`, `RoleGate.jsx`, `RequireAuth.jsx`, of de pagina's onder
`src/pages/`, minimaal opnieuw doorlopen:

- [ ] Sectie 2 — zelf-degradatie geblokkeerd
- [ ] Sectie 3c — laatste-admin-degradatie geblokkeerd
- [ ] Sectie 4 — race condition (minstens optie B, console-variant)
- [ ] Sectie 5 — direct-update bypass (alle 3 sub-stappen: ander-profiel,
      eigen-profiel, als laagste rol)
- [ ] Sectie 6 — volledige matrix voor alle 3 rollen opnieuw
- [ ] Sectie 7 — `/admin` en een `admin`-only tool-route als `user`
- [ ] Sectie 8, stappen 1, 2, 6 — basis auth-flow (redirect, fout wachtwoord,
      geen flits bij refresh)

## Go/No-go advies

- **No-go** als: sectie 2, 3c, 4 of 5 ook maar één keer een privilege-
  escalatie of 0-admins-scenario toelaat. Dit is financieel/organisatorisch
  kritiek (niemand kan dan nog rollen beheren) en moet vóór release opgelost
  worden.
- **No-go** als: sectie 7 een `user`-rol account de echte `AdminPanel`-data
  laat zien, zelfs kortstondig.
- **Go, met bugticket** als: alleen cosmetische afwijkingen in sectie 6/8
  gevonden worden (bijv. verkeerde label-tekst, ontbrekend hangslot-icoon)
  zonder dat dit daadwerkelijk ongeautoriseerde toegang geeft.
