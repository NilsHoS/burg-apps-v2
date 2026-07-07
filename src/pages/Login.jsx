import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider'

/**
 * Inlogscherm. Stuurt na een geslaagde login door naar de pagina waar de
 * gebruiker oorspronkelijk naartoe wilde (via RequireAuth's redirect
 * state), of anders naar het dashboard.
 */
export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Al ingelogd? Dan hoeft dit scherm niet getoond te worden.
  if (user) {
    const redirectTo = location.state?.from?.pathname ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await signIn(email, password)

    setSubmitting(false)

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'E-mailadres of wachtwoord is onjuist.'
          : signInError.message,
      )
      return
    }

    const redirectTo = location.state?.from?.pathname ?? '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>BURG Apps</h1>
        <p className="auth-subtitle">Log in om verder te gaan</p>

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

        <label className="field">
          <span>Wachtwoord</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          {submitting ? 'Bezig met inloggen…' : 'Inloggen'}
        </button>

        <p className="auth-links">
          <Link to="/wachtwoord-vergeten">Wachtwoord vergeten?</Link>
        </p>
      </form>
    </div>
  )
}
