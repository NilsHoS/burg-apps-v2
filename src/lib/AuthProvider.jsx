import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(undefined)

/**
 * Haalt de profiles-rij op die hoort bij een auth user id.
 * Geeft `null` terug (i.p.v. te gooien) als er geen rij is, zodat de
 * UI-laag simpel kan checken op "wel/geen profiel" zonder try/catch.
 */
async function fetchProfile(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[AuthProvider] Kon profiel niet ophalen:', error.message)
    return null
  }

  return data
}

/**
 * AuthProvider bewaakt de Supabase auth-sessie en het bijbehorende
 * profiles-record (met daarin de rol: 'admin' | 'manager' | 'user').
 *
 * Consumers gebruiken de useAuth() hook, die het volgende teruggeeft:
 * {
 *   session,     // Supabase Session | null
 *   user,        // Supabase User | null (kortere weg naar session.user)
 *   profile,     // rij uit `profiles` (incl. `role`, `naam`, `actief`, ...) | null
 *   loading,     // boolean — true tot de eerste sessie-check + profiel-fetch klaar is
 *   signIn,      // (email, password) => Promise<{ data, error }>
 *   signOut,     // () => Promise<{ error }>
 *   resetPasswordForEmail, // (email) => Promise<{ data, error }> — stuurt reset-mail
 *   updatePassword,        // (newPassword) => Promise<{ data, error }> — vereist actieve sessie
 * }
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Eerste keer: huidige sessie ophalen (bv. na page refresh).
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return

      setSession(initialSession)
      const initialProfile = await fetchProfile(initialSession?.user?.id)
      if (!isMounted) return

      setProfile(initialProfile)
      setLoading(false)
    })

    // Daarna: reageren op login/logout/token-refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return

      setSession(newSession)
      setLoading(true)
      const newProfile = await fetchProfile(newSession?.user?.id)
      if (!isMounted) return

      setProfile(newProfile)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback((email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(() => {
    return supabase.auth.signOut()
  }, [])

  const resetPasswordForEmail = useCallback((email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/wachtwoord-resetten`,
    })
  }, [])

  const updatePassword = useCallback((newPassword) => {
    return supabase.auth.updateUser({ password: newPassword })
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth() moet binnen een <AuthProvider> gebruikt worden')
  }
  return context
}
