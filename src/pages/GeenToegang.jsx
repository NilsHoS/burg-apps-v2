import { Link } from 'react-router-dom'

/**
 * Getoond wanneer een ingelogde gebruiker naar een pagina navigeert
 * waarvoor zijn/haar rol niet volstaat. Geen dead-end: altijd een link
 * terug naar het dashboard.
 */
export default function GeenToegang() {
  return (
    <div className="center-page">
      <div className="empty-state">
        <h1>Geen toegang</h1>
        <p>Je hebt niet de juiste rechten om deze pagina te bekijken.</p>
        <Link to="/" className="btn btn-primary">
          Terug naar dashboard
        </Link>
      </div>
    </div>
  )
}
