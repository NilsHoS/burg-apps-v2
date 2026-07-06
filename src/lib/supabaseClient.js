import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Geen harde throw: zo blijft de app (en met name de build) werken
  // zolang er nog geen live Supabase-project is. Supabase-calls falen
  // dan pas op het moment dat ze daadwerkelijk worden uitgevoerd.
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL en/of VITE_SUPABASE_ANON_KEY ontbreken. ' +
      'Kopieer .env.example naar .env en vul de waarden in.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
