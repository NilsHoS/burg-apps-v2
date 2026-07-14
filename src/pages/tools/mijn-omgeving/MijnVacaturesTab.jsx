import { useCallback, useEffect, useRef, useState } from 'react'
import { burgJobsSupabase } from '../../../lib/burgJobsClient'
import { SALES_STATUSES } from './constants'
import DoorsturenModal from './DoorsturenModal'

// Kolommen exact zoals `loadMijnVacaturesBackground`/`loadMijnVacatures` in
// de bron (regel 1095-1126).
const SELECT_COLUMNS =
  'id, job_title, company_name, job_location, job_url, data_source, date_scraped, reviewed_at, enriched_at, company_website, company_phone, company_industry, company_linkedin, recruiter_name, recruiter_linkedin, recruiter_headline, company_address, salary, employment_type, industry, posted_at, contact_email, contact_phone, sales_status, sales_notes'

// Filterwaarde voor vacatures zonder sales_status (nog geen keuze gemaakt).
// Geen echte SALES_STATUSES-waarde, dus apart gehouden van getStatus().
const NIEUW_FILTER = 'nieuw'

// sessionStorage-cache (jobs + filter + scrollpositie) per e-mailadres —
// zie het component-docblok hieronder voor de reden: browsers discarden
// een achtergrondtab en herladen 'm vanaf nul zodra je terugkomt, waardoor
// React-state (en dus ook alles hier) gewoon weg is. sessionStorage
// overleeft die herlaad wel.
function cacheKey(email) {
  return `mo-mijn-vacatures-${email}`
}
function filterKey(email) {
  return `mo-mijn-vacatures-filter-${email}`
}
function scrollKey(email) {
  return `mo-mijn-vacatures-scroll-${email}`
}

function leesJsonUitStorage(key) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getStatus(job) {
  return job.sales_status || null
}

function formatDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('nl-NL')
}

/**
 * "Mijn Vacatures"-tab — poort van `loadMijnVacatures`/`renderMijnVacatures`/
 * `buildMvCard` uit de bron (regel 1095 e.v.). Blijft altijd gemount
 * (zichtbaarheid via `visible`-prop + CSS), zodat het geselecteerde filter
 * niet verloren gaat bij het wisselen naar Swipen en terug.
 *
 * Cacht jobs/filter/scrollpositie in sessionStorage: mobiele (en drukke
 * desktop-)browsers discarden een achtergrondtab om geheugen vrij te maken
 * en herladen die volledig zodra je terugkomt — React-state is dan gewoon
 * weg, ook al is dit component "permanent gemount" binnen de SPA. Met de
 * cache toont dit component meteen de vorige lijst (geen laadspinner, geen
 * lege pagina) en herstelt de scrollpositie, terwijl er op de achtergrond
 * stil geverifieerd wordt of de data nog actueel is.
 */
export default function MijnVacaturesTab({
  visible,
  employees,
  currentUserEmail,
  refreshToken,
  onToast,
  onNieuwCountChange,
}) {
  const [jobs, setJobs] = useState(() => leesJsonUitStorage(cacheKey(currentUserEmail)) ?? [])
  const [loading, setLoading] = useState(() => jobs.length === 0)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState(() => {
    try {
      return sessionStorage.getItem(filterKey(currentUserEmail)) || NIEUW_FILTER
    } catch {
      return NIEUW_FILTER
    }
  })
  const [doorsturenJob, setDoorsturenJob] = useState(null)

  const load = useCallback(
    async (silent) => {
      if (!currentUserEmail) return
      if (!silent) setLoading(true)

      const { data, error: loadError } = await burgJobsSupabase
        .from('jobs')
        .select(SELECT_COLUMNS)
        .eq('review_status', 'go')
        .eq('assigned_to', currentUserEmail)
        .order('reviewed_at', { ascending: false })

      if (loadError) {
        if (!silent) {
          setError(loadError.message)
          setLoading(false)
        }
        return
      }

      setJobs(data || [])
      setError('')
      if (!silent) setLoading(false)
    },
    [currentUserEmail],
  )

  // Initiële lading: als er al een cache is, telt dat als "stil" verversen
  // (geen spinner/lege-pagina-flits) — anders de normale eerste lading.
  const initialLoadWasSilent = useRef(jobs.length > 0)
  useEffect(() => {
    load(initialLoadWasSilent.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  // Cache bijwerken zodra de joblijst wijzigt (na elke load of lokale
  // mutatie), zodat een volgende (herladen) mount meteen kan tonen.
  useEffect(() => {
    if (!currentUserEmail) return
    try {
      sessionStorage.setItem(cacheKey(currentUserEmail), JSON.stringify(jobs))
    } catch {
      // Niet kritiek — dan is er gewoon geen cache voor de volgende keer.
    }
  }, [jobs, currentUserEmail])

  useEffect(() => {
    if (!currentUserEmail) return
    try {
      sessionStorage.setItem(filterKey(currentUserEmail), filter)
    } catch {
      // Niet kritiek.
    }
  }, [filter, currentUserEmail])

  // Scrollpositie: alleen bijhouden terwijl dit tabblad zichtbaar is (alle
  // tabbladen delen dezelfde window-scroll, dus anders zou dit de
  // scrollpositie van Swipen/Overzicht overschrijven). Bij elke overgang
  // naar zichtbaar wordt de eigen laatst bekende positie hersteld.
  useEffect(() => {
    if (!visible || !currentUserEmail) return undefined

    let raf = null
    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        try {
          sessionStorage.setItem(scrollKey(currentUserEmail), String(window.scrollY))
        } catch {
          // Niet kritiek.
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [visible, currentUserEmail])

  useEffect(() => {
    if (!visible || !currentUserEmail || jobs.length === 0) return
    try {
      const saved = sessionStorage.getItem(scrollKey(currentUserEmail))
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, Number(saved)))
      }
    } catch {
      // Niet kritiek — dan begint de gebruiker gewoon bovenaan.
    }
    // Alleen bij het zichtbaar worden herstellen, niet bij elke jobs-update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  // Stille herlading na een Go-beslissing op de Swipen-tab — matcht
  // `loadMijnVacaturesBackground()` in de bron. De eerste effect-run (bij
  // mount) wordt overgeslagen: die dekt `load(false)` hierboven al af.
  const skippedFirstRefresh = useRef(false)
  useEffect(() => {
    if (!skippedFirstRefresh.current) {
      skippedFirstRefresh.current = true
      return
    }
    load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  const filtered =
    filter === NIEUW_FILTER ? jobs.filter((j) => !getStatus(j)) : jobs.filter((j) => getStatus(j) === filter)

  const counts = {}
  let nieuwCount = 0
  jobs.forEach((j) => {
    const s = getStatus(j)
    if (!s) {
      nieuwCount += 1
    } else {
      counts[s] = (counts[s] || 0) + 1
    }
  })

  useEffect(() => {
    onNieuwCountChange?.(nieuwCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nieuwCount])

  async function updateStatus(jobId, status) {
    const now = new Date().toISOString()
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, sales_status: status, sales_status_at: now } : j)))
    await burgJobsSupabase.from('jobs').update({ sales_status: status, sales_status_at: now }).eq('id', jobId)
    onToast?.('Status opgeslagen.')
  }

  function updateNotesLocal(jobId, value) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, sales_notes: value } : j)))
  }

  async function saveNotes(jobId, value) {
    await burgJobsSupabase.from('jobs').update({ sales_notes: value }).eq('id', jobId)
  }

  async function confirmDoorsturen(job, toEmail) {
    await burgJobsSupabase.from('jobs').update({ assigned_to: toEmail }).eq('id', job.id)
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
    setDoorsturenJob(null)
    onToast?.('Vacature doorgestuurd.')
  }

  return (
    <div className={visible ? 'mo-tab-panel' : 'mo-tab-panel mo-tab-panel-hidden'}>
      {loading && <div className="idle-state">Vacatures laden…</div>}

      {!loading && error && (
        <p className="form-error" role="alert">
          Kon vacatures niet laden: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="btn-toggle-group mo-mv-summary">
            <button
              type="button"
              className={filter === NIEUW_FILTER ? 'btn-toggle active' : 'btn-toggle'}
              onClick={() => setFilter(NIEUW_FILTER)}
            >
              Nieuwe vacatures <span className="mo-count-pill">{nieuwCount}</span>
            </button>
            {SALES_STATUSES.filter((s) => counts[s]).map((s) => (
              <button
                type="button"
                key={s}
                className={filter === s ? 'btn-toggle active' : 'btn-toggle'}
                onClick={() => setFilter(s)}
              >
                {s} <span className="mo-count-pill">{counts[s]}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 && <div className="idle-state">Geen vacatures in dit filter.</div>}

          <div className="mo-vac-list">
            {filtered.map((job) => (
              <VacatureCard
                key={job.id}
                job={job}
                onUpdateStatus={updateStatus}
                onNotesChange={updateNotesLocal}
                onNotesSave={saveNotes}
                onDoorsturen={() => setDoorsturenJob(job)}
              />
            ))}
          </div>
        </>
      )}

      <DoorsturenModal
        open={!!doorsturenJob}
        job={doorsturenJob}
        employees={employees}
        currentUserEmail={currentUserEmail}
        onCancel={() => setDoorsturenJob(null)}
        onConfirm={confirmDoorsturen}
      />
    </div>
  )
}

function VacatureCard({ job, onUpdateStatus, onNotesChange, onNotesSave, onDoorsturen }) {
  const [notesStatus, setNotesStatus] = useState('idle') // idle | saving | saved
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleNotesInput(e) {
    const value = e.target.value
    onNotesChange(job.id, value)
    setNotesStatus('saving')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      await onNotesSave(job.id, value)
      setNotesStatus('saved')
      setTimeout(() => setNotesStatus('idle'), 2000)
    }, 1000)
  }

  const posted = formatDate(job.posted_at)
  const scraped = formatDate(job.date_scraped) || formatDate(job.reviewed_at)
  const status = getStatus(job)

  let enrichBadge
  if (job.enriched_at) {
    enrichBadge = <span className="badge badge-mos">Verrijkt</span>
  } else if (job.recruiter_linkedin) {
    enrichBadge = <span className="badge badge-blauwgrijs">Wacht op verrijking</span>
  } else {
    enrichBadge = <span className="badge badge-inactive">Geen Apollo beschikbaar</span>
  }

  return (
    <div className="mo-vac-card">
      <div className="mo-vac-header">
        <div>
          <div className="mo-vac-title">{job.job_title || '—'}</div>
          <div className="mo-vac-company">
            {job.company_name || '—'}
            {job.company_linkedin && (
              <a className="mo-li-link" href={job.company_linkedin} target="_blank" rel="noopener noreferrer">
                {' '}
                in
              </a>
            )}
          </div>
        </div>
        <span className="badge badge-mos">Go</span>
      </div>

      <div className="mo-vac-meta">
        {job.job_location && <span className="mo-meta-chip">📍 {job.job_location}</span>}
        {job.data_source && <span className="mo-meta-chip">🔍 {job.data_source}</span>}
        {posted ? (
          <span className="mo-meta-chip">📅 Geplaatst op: {posted}</span>
        ) : scraped ? (
          <span className="mo-meta-chip">📅 {scraped}</span>
        ) : null}
        {job.job_url && (
          <a className="mo-meta-chip mo-meta-chip-cta" href={job.job_url} target="_blank" rel="noopener noreferrer">
            ↗ Bekijk vacature
          </a>
        )}
      </div>

      {(job.salary || job.employment_type || job.industry) && (
        <div className="mo-vac-badges">
          {job.salary && <span className="badge badge-mos">💶 {job.salary}</span>}
          {job.employment_type && <span className="badge badge-blauwgrijs">{job.employment_type}</span>}
          {job.industry && <span className="badge badge-inactive">{job.industry}</span>}
        </div>
      )}

      <div className="mo-contact-section">
        <p className="calc-section-label">Contactinformatie</p>
        <div className="mo-contact-grid">
          {job.recruiter_name && (
            <div className="mo-contact-block">
              <div className="mo-contact-label">Contactpersoon</div>
              <div className="mo-contact-name">
                {job.recruiter_name}
                {job.recruiter_linkedin && (
                  <a className="mo-li-link" href={job.recruiter_linkedin} target="_blank" rel="noopener noreferrer">
                    {' '}
                    in
                  </a>
                )}
              </div>
              {job.recruiter_headline && <div className="mo-contact-sub">{job.recruiter_headline}</div>}
            </div>
          )}

          {(job.company_website || job.company_address) && (
            <div className="mo-contact-block">
              <div className="mo-contact-label">Bedrijf</div>
              {job.company_website && (
                <a className="mo-contact-link" href={job.company_website} target="_blank" rel="noopener noreferrer">
                  🌐 {job.company_website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
              {job.company_address && <div className="mo-contact-sub">📍 {job.company_address}</div>}
            </div>
          )}

          <div className="mo-contact-block">
            <div className="mo-contact-label">Contact (Apollo)</div>
            {job.contact_email ? (
              <a className="mo-contact-link" href={`mailto:${job.contact_email}`}>
                ✉ {job.contact_email}
              </a>
            ) : (
              <span className="mo-contact-placeholder">✉ nog niet verrijkt</span>
            )}
            {job.contact_phone ? (
              <a className="mo-contact-link" href={`tel:${job.contact_phone}`}>
                ✆ {job.contact_phone}
              </a>
            ) : (
              <span className="mo-contact-placeholder">✆ nog niet verrijkt</span>
            )}
          </div>
        </div>
      </div>

      <div className="mo-enrich-row">
        {enrichBadge}
        {job.enriched_at && (job.company_industry || job.company_phone) && (
          <span className="mo-enrich-details">
            {job.company_industry ? `🏭 ${job.company_industry}` : ''}
            {job.company_industry && job.company_phone ? ' · ' : ''}
            {job.company_phone ? `✆ ${job.company_phone}` : ''}
          </span>
        )}
      </div>

      <div className="mo-sales-section">
        <p className="calc-section-label">Sales opvolging</p>
        <div className="control-row">
          <span className="control-label">Status</span>
          <div className="btn-group">
            {SALES_STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                className={status === s ? 'btn-group-btn active' : 'btn-group-btn'}
                onClick={() => onUpdateStatus(job.id, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="control-row">
          <span className="control-label">Notities</span>
          <textarea
            className="field-textarea"
            placeholder="Voeg notities toe…"
            value={job.sales_notes || ''}
            onChange={handleNotesInput}
          />
          <span
            className={
              notesStatus === 'idle' ? 'mo-save-indicator' : `mo-save-indicator mo-save-indicator-${notesStatus}`
            }
          >
            {notesStatus === 'saving' ? 'Opslaan…' : notesStatus === 'saved' ? 'Opgeslagen' : ''}
          </span>
        </div>
      </div>

      <div className="mo-vac-actions">
        <button type="button" className="btn btn-secondary" onClick={onDoorsturen}>
          Doorsturen →
        </button>
      </div>
    </div>
  )
}
