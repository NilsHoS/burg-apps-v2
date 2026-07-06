import { supabase } from './supabaseClient'

/**
 * Haalt alle profielen op. RLS zorgt er automatisch voor dat dit alleen
 * daadwerkelijk rijen oplevert voor gebruikers met rol 'admin' of 'manager'
 * (zie policies "admin leest alle profielen" / "manager leest alle
 * profielen" in supabase/schema.sql). Voor een gewone 'user' komt hier dus
 * hooguit het eigen profiel uit terug.
 *
 * @returns {Promise<Array<object>>} rijen uit de `profiles` tabel
 */
export async function fetchAllProfiles() {
  const { data, error } = await supabase.from('profiles').select('*')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Wijzigt de rol van een gebruiker. Dit is de ENIGE manier waarop de rol
 * van een profiel gewijzigd mag worden vanuit de client: het gaat via de
 * `change_user_role` Postgres-functie (security definer), die:
 *  - controleert dat de aanroeper zelf admin is,
 *  - voorkomt dat de laatste admin gedegradeerd wordt,
 *  - een audit-log regel wegschrijft in `role_audit_log`.
 *
 * Er is bewust GEEN directe `.update()` op `profiles.role` toegevoegd —
 * dat zou de RLS/audit-beveiliging van dit schema omzeilen.
 *
 * @param {string} targetId - uuid van het profiel dat gewijzigd wordt
 * @param {'admin'|'manager'|'user'} newRole - de nieuwe rol
 * @throws {Error} met de Postgres-foutmelding, bv.
 *   "Kan de laatste admin niet degraderen" of
 *   "Alleen admins mogen rollen wijzigen"
 */
export async function changeUserRole(targetId, newRole) {
  const { error } = await supabase.rpc('change_user_role', {
    target_id: targetId,
    new_role_value: newRole,
  })

  if (error) {
    throw new Error(error.message)
  }
}
