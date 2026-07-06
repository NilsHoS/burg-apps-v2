import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider'

/**
 * Beschermt routes die een ingelogde gebruiker vereisen.
 * - Toont een laadindicator zolang de sessie/profiel-check nog loopt,
 *   zodat het loginscherm niet even flitst voor een reeds ingelogde
 *   gebruiker (bv. na een page refresh).
 * - Stuurt niet-ingelogde gebruikers naar /login, en bewaart de
 *   oorspronkelijke locatie zodat Login daarna kan terugsturen.
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="center-page">
        <p>Laden…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
