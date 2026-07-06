import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllProfiles, changeUserRole } from '../lib/adminApi'

const ROLE_OPTIONS = ['admin', 'manager', 'user']

export default function AdminPanel() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  // rowErrors: { [profileId]: string }
  const [rowErrors, setRowErrors] = useState({})
  // pendingIds: profielen waarvan de rolwijziging nog onderweg is
  const [pendingIds, setPendingIds] = useState({})

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await fetchAllProfiles()
      setProfiles(data)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(profileId, newRole) {
    const previousProfile = profiles.find((p) => p.id === profileId)
    const previousRole = previousProfile?.role

    // Optimistisch bijwerken zodat de dropdown meteen reageert.
    setProfiles((current) =>
      current.map((p) => (p.id === profileId ? { ...p, role: newRole } : p)),
    )
    setRowErrors((current) => ({ ...current, [profileId]: null }))
    setPendingIds((current) => ({ ...current, [profileId]: true }))

    try {
      await changeUserRole(profileId, newRole)
      // Succes: lokale state is al bijgewerkt. Voor de zekerheid opnieuw
      // ophalen zodat ook eventuele server-side neveneffecten zichtbaar zijn.
      await loadProfiles()
    } catch (err) {
      // Terugdraaien naar de vorige waarde en foutmelding tonen bij deze rij.
      setProfiles((current) =>
        current.map((p) => (p.id === profileId ? { ...p, role: previousRole } : p)),
      )
      setRowErrors((current) => ({ ...current, [profileId]: err.message }))
    } finally {
      setPendingIds((current) => ({ ...current, [profileId]: false }))
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Adminpaneel</h1>
          <p className="topbar-user">Gebruikersbeheer</p>
        </div>
        <div className="topbar-actions">
          <Link to="/" className="btn btn-secondary">
            Terug naar dashboard
          </Link>
        </div>
      </header>

      <main className="page-content">
        {loading && <p>Gebruikers laden…</p>}

        {loadError && (
          <p className="form-error" role="alert">
            Kon gebruikers niet laden: {loadError}
          </p>
        )}

        {!loading && !loadError && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>E-mail</th>
                  <th>Rol</th>
                  <th>Actief</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td data-label="Naam">{profile.naam}</td>
                    <td data-label="E-mail">{profile.email}</td>
                    <td data-label="Rol">
                      <select
                        value={profile.role}
                        disabled={pendingIds[profile.id]}
                        onChange={(event) => handleRoleChange(profile.id, event.target.value)}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {rowErrors[profile.id] && (
                        <p className="form-error form-error-inline" role="alert">
                          {rowErrors[profile.id]}
                        </p>
                      )}
                    </td>
                    <td data-label="Actief">
                      <span className={profile.actief ? 'badge badge-active' : 'badge badge-inactive'}>
                        {profile.actief ? 'Actief' : 'Inactief'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
