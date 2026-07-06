import { Link } from 'react-router-dom'

/**
 * Placeholder-pagina voor tools uit TOOLS die nog niet daadwerkelijk
 * gebouwd zijn. Toont welke tool het is (voor duidelijkheid tijdens
 * ontwikkeling/QA) en biedt een weg terug naar het dashboard.
 */
export default function ToolPlaceholder({ naam }) {
  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>{naam}</h1>
        </div>
        <div className="topbar-actions">
          <Link to="/" className="btn btn-secondary">
            Terug naar dashboard
          </Link>
        </div>
      </header>

      <main className="page-content">
        <div className="empty-state">
          <p>{naam} — nog te bouwen.</p>
        </div>
      </main>
    </div>
  )
}
