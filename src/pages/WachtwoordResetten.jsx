import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider'

/**
 * Landingspagina van de reset-link uit de e-mail. Supabase herkent de
 * recovery-tokens in de URL zelf (detectSessionInUrl, standaard aan) en zet
 * daarmee een sessie op via AuthProvider's onAuthStateChange-listener — hier
 * hoeft dus niets handmatig geparsed te worden. Is er na het laden geen
 * sessie, dan is de link ongeldig of verlopen.
 */
export default function WachtwoordResetten() {
  const { session, loading, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordHerhaald, setPasswordHerhaald] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [gelukt, setGelukt] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn.')
      return
    }
    if (password !== passwordHerhaald) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await updatePassword(password)
    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setGelukt(true)
  }

  if (loading) {
    return (
      <div className="center-page">
        <p>Laden…</p>
      </div>
    )
  }

  if (gelukt) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>BURG Apps</h1>
          <p className="form-success">Je wachtwoord is aangepast. Je kunt nu inloggen met je nieuwe wachtwoord.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              await signOut()
              navigate('/login', { replace: true })
            }}
          >
            Naar inloggen
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="center-page">
        <div className="empty-state">
          <h1>Link ongeldig of verlopen</h1>
          <p>Vraag een nieuwe reset-link aan via de inlogpagina.</p>
          <Link to="/wachtwoord-vergeten" className="btn btn-primary">
            Nieuwe link aanvragen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>BURG Apps</h1>
        <p className="auth-subtitle">Nieuw wachtwoord instellen</p>

        <label className="field">
          <span>Nieuw wachtwoord</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <label className="field">
          <span>Herhaal wachtwoord</span>
          <input
            type="password"
            autoComplete="new-password"
            value={passwordHerhaald}
            onChange={(event) => setPasswordHerhaald(event.target.value)}
            required
            disabled={submitting}
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Bezig met opslaan…' : 'Wachtwoord instellen'}
        </button>
      </form>
    </div>
  )
}
