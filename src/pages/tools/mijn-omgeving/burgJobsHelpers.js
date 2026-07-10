import { burgJobsSupabase } from '../../../lib/burgJobsClient'
import { GO_WEBHOOK_URL } from './constants'

/**
 * Aantal eigen Go-vacatures zonder sales_status ("nieuw", nog geen actie
 * ondernomen) — zelfde telling als de "Nieuwe vacatures"-teller in Mijn
 * Vacatures (NIEUW_FILTER in MijnVacaturesTab.jsx). Gebruikt voor het
 * reminder-bolletje op de Kansen Swiper dashboardtegel, zie Dashboard.jsx.
 */
export async function fetchNieuweVacaturesCount(email) {
  if (!email) return 0

  const { count, error } = await burgJobsSupabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('review_status', 'go')
    .eq('assigned_to', email)
    .is('sales_status', null)

  if (error) {
    console.error('[Dashboard] Kon nieuwe-vacatures-teller niet ophalen:', error.message)
    return 0
  }

  return count || 0
}

/**
 * Go-toewijzing: verdeelt goedgekeurde vacatures evenredig (round-robin,
 * naar wie er vandaag de minste heeft gekregen) over de AANWEZIGE
 * medewerkers van die dag — dus 15 Go's over 3 aanwezigen geeft 5 per
 * persoon. Bewust GEEN senioriteitsfilter meer (die stub gaf toch altijd
 * 'medior' terug; wordt in een later stadium opnieuw gebouwd) en bewust
 * GEEN weging op historische workload/fte_hours: dat zou iemand met een
 * grote (al dan niet netjes bijgehouden) bestaande stapel structureel
 * bevoordelen of benadelen bij nieuwe toewijzingen. Alleen de telling van
 * VANDAAG telt mee. Is niemand aanwezig, dan valt het terug op de swiper
 * zelf. Schrijft de toewijzing in één update, en vuurt daarna
 * (fire-and-forget, nooit blokkerend) de Apollo-enrichment webhook af.
 */
export async function assignGoVacature(jobId, employees, currentUserEmail) {
  const now = new Date().toISOString()

  const present = employees.filter((e) => e.is_present)
  let chosenEmail = currentUserEmail

  if (present.length > 0) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: goVandaag } = await burgJobsSupabase
      .from('jobs')
      .select('assigned_to')
      .eq('review_status', 'go')
      .gte('reviewed_at', todayStart.toISOString())
      .in(
        'assigned_to',
        present.map((e) => e.email),
      )

    const counts = {}
    present.forEach((e) => {
      counts[e.email] = 0
    })
    ;(goVandaag || []).forEach((j) => {
      if (j.assigned_to in counts) counts[j.assigned_to] += 1
    })

    chosenEmail = present.reduce((minst, emp) => (counts[emp.email] < counts[minst.email] ? emp : minst)).email
  }

  const { error } = await burgJobsSupabase
    .from('jobs')
    .update({
      review_status: 'go',
      assigned_to: chosenEmail,
      reviewed_at: now,
    })
    .eq('id', jobId)

  if (error) {
    console.error('[MijnOmgeving] assignGoVacature: opslaan mislukt:', error)
    return { error }
  }

  try {
    await fetch(GO_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })
  } catch (e) {
    // Exact zoals de bron: een mislukte webhook mag de UI nooit blokkeren.
    console.warn('[MijnOmgeving] Webhook mislukt:', e)
  }

  return { error: null }
}
