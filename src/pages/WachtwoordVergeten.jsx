import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider'

/**
 * Vraagt bij Supabase een reset-mail aan. Toont bij succes altijd dezelfde
 * bevestiging, ongeacht of het e-mailadres bestaat — Supabase geeft zelf ook
 * geen foutmelding bij een onbekend e-mailadres, om te voorkomen dat deze
 * pagina gebruikt kan worden om te achterhalen welke adressen geregistreerd
 * staan.
 */
export default function WachtwoordVergeten() {
  const { resetPasswordForEmail } = useAuth()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [verzonden, setVerzonden] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: resetError } = await resetPasswordForEmail(email)

    setSubmitting(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setVerzonden(true)
  }

  if (verzonden) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>BURG Apps</h1>
          <p className="auth-subtitle">Wachtwoord vergeten</p>
          <p className="form-success">
            Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een e-mail met een link om een
            nieuw wachtwoord in te stellen.
          </p>
          <Link to="/login" className="btn btn-secondary">
            Terug naar inloggen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>BURG Apps</h1>
        <p className="auth-subtitle">Wachtwoord vergeten</p>
        <p>Vul je e-mailadres in. Je ontvangt dan een link om een nieuw wachtwoord in te stellen.</p>

        <label className="field">
          <span>E-mailadres</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {submitting ? 'Bezig met versturen…' : 'Verstuur reset-link'}
        </button>

        <p className="auth-links">
          <Link to="/login">Terug naar inloggen</Link>
        </p>
      </form>
    </div>
  )
}
