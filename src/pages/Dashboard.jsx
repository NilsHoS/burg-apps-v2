import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider'
import { useTheme } from '../lib/useTheme'
import { TOOLS, TOOL_CATEGORIES, hasAccess } from '../lib/toolRegistry'

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  user: 'Gebruiker',
}

function roleLabel(role) {
  return ROLE_LABELS[role] ?? role
}

function ToolCard({ tool, unlocked }) {
  if (!unlocked) {
    return (
      <div className="tool-card tool-card-locked" aria-disabled="true">
        <span className="tool-card-lock" aria-hidden="true">
          🔒
        </span>
        <span className="tool-card-name">{tool.naam}</span>
        <span className="tool-card-hint">
          Vereist rol: {roleLabel(tool.minimumRole)}
        </span>
      </div>
    )
  }

  return (
    <Link to={tool.path} className="tool-card">
      <span className="tool-card-name">{tool.naam}</span>
      <span className="tool-card-hint">Openen →</span>
    </Link>
  )
}

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>BURG Apps</h1>
          {profile && (
            <p className="topbar-user">
              {profile.naam} · {roleLabel(profile.role)}
            </p>
          )}
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
            title={theme === 'dark' ? 'Lichte modus' : 'Donkere modus'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="btn btn-secondary">
              Adminpaneel
            </Link>
          )}
          <Link to="/account" className="btn btn-secondary">
            Mijn account
          </Link>
          <button type="button" className="btn btn-secondary" onClick={() => signOut()}>
            Uitloggen
          </button>
        </div>
      </header>

      <main className="page-content">
        {TOOL_CATEGORIES.map((category) => {
          const toolsInCategory = TOOLS.filter((tool) => tool.category === category.id)

          if (toolsInCategory.length === 0) return null

          return (
            <section key={category.id} className="tool-section">
              <p className="section-label">{category.label}</p>
              <div className="tool-grid">
                {toolsInCategory.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    unlocked={hasAccess(profile?.role, tool.minimumRole)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
