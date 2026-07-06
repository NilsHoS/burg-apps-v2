import { hasAccess } from '../lib/toolRegistry'

/**
 * Rendert `children` alleen als `userRole` voldoende rechten heeft voor
 * `minimumRole`. Anders wordt `fallback` gerenderd (standaard: niets).
 *
 * Bewust geen "Geen toegang"-UI hier ingebakken — dat is aan de UI-laag,
 * die dit component met een eigen `fallback` kan aanroepen, bv.:
 *   <RoleGate minimumRole="admin" userRole={profile?.role} fallback={<GeenToegang />}>
 *     ...
 *   </RoleGate>
 */
export function RoleGate({ minimumRole, userRole, children, fallback = null }) {
  if (!hasAccess(userRole, minimumRole)) {
    return fallback
  }

  return children
}

export default RoleGate
