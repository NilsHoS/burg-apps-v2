import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'burg-apps-theme'

/**
 * Bepaalt het thema bij eerste bezoek: eerder gekozen thema uit
 * localStorage heeft voorrang, anders volgen we prefers-color-scheme.
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

/**
 * Beheert light/dark thema voor de app. Zet data-theme op <html> zodat
 * de CSS-tokens in index.css kunnen wisselen, en onthoudt de keuze van
 * de gebruiker in localStorage. Respecteert prefers-color-scheme alleen
 * als er nog geen expliciete keuze is opgeslagen.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
