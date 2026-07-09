import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthProvider'
import { fetchMijnGpb, fetchDoelen, submitGpbMedewerker, submitGpbLeidinggevende } from '../../lib/gpbApi'
import GpbInvulForm from './gpb/GpbInvulForm'
import GpbRapport from './gpb/GpbRapport'
import GpbBeheerOverzicht from './gpb/GpbBeheerOverzicht'

/**
 * GPB Beoordelingstool — zie GPB-Principes.md voor de volledige functionele
 * omschrijving. Bewust GEEN invite-links/tokens: iedereen heeft al een
 * burg-apps-v2-account, dus medewerker/leidinggevende loggen gewoon in en
 * zien hun openstaande beoordeling hier — geen externe e-mail nodig.
 *
 * Rollen binnen déze tool zijn los van de algemene ROLE_HIERARCHY-ladder
 * (net als mijn_omgeving_uitgebreid bij Kansen Swiper): een manager ziet
 * hier alleen zijn eigen team als leidinggevende, HR/admin ziet alles —
 * dat zijn drie aparte populaties, geen oplopende trap. Alle schrijfacties
 * lopen via RPC's (zie supabase/schema.sql), nooit via directe updates.
 */
export default function GpbBeoordelingstool() {
  const { user, profile } = useAuth()

  const [beoordelingen, setBeoordelingen] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState('mijn')
  const [toast, setToast] = useState('')

  const isHrOfAdmin = profile?.role === 'hr' || profile?.role === 'admin'

  const load = useCallback(async () => {
    try {
      const data = await fetchMijnGpb()
      setBeoordelingen(data)
      setLoadError('')
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  if (loading) {
    return (
      <div className="page">
        <header className="topbar">
          <h1>GPB Beoordelingstool</h1>
        </header>
        <main className="page-content">
          <p>Beoordelingen laden…</p>
        </main>
      </div>
    )
  }

  const eigenBeoordeling = beoordelingen.find((b) => b.medewerker_id === user?.id)
  const teamBeoordelingen = beoordelingen.filter((b) => b.leidinggevende_id === user?.id)

  const tabs = []
  if (profile?.role === 'user' || profile?.role === 'manager' || isHrOfAdmin) tabs.push('mijn')
  if (profile?.role === 'manager' || isHrOfAdmin) tabs.push('team')
  if (isHrOfAdmin) tabs.push('beheer')

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>GPB Beoordelingstool</h1>
        </div>
        <div className="topbar-actions">
          <Link to="/" className="btn btn-secondary">
            Terug naar dashboard
          </Link>
        </div>
      </header>

      <main className="page-content">
        {loadError && (
          <p className="form-error" role="alert">
            Kon beoordelingen niet laden: {loadError}
          </p>
        )}

        {tabs.length > 1 && (
          <div className="mo-tab-bar">
            {tabs.includes('mijn') && (
              <button type="button" className={tab === 'mijn' ? 'mo-tab-btn active' : 'mo-tab-btn'} onClick={() => setTab('mijn')}>
                Mijn beoordeling
              </button>
            )}
            {tabs.includes('team') && (
              <button type="button" className={tab === 'team' ? 'mo-tab-btn active' : 'mo-tab-btn'} onClick={() => setTab('team')}>
                Team
                <span className="mo-count-pill">
                  {teamBeoordelingen.filter((b) => !b.leidinggevende_ingevuld_at).length}
                </span>
              </button>
            )}
            {tabs.includes('beheer') && (
              <button type="button" className={tab === 'beheer' ? 'mo-tab-btn active' : 'mo-tab-btn'} onClick={() => setTab('beheer')}>
                Beheer
              </button>
            )}
          </div>
        )}

        {tab === 'mijn' && (
          <MijnBeoordelingBlok beoordeling={eigenBeoordeling} onIngediend={load} showToast={setToast} />
        )}

        {tab === 'team' && (
          <TeamBlok beoordelingen={teamBeoordelingen} onIngediend={load} showToast={setToast} />
        )}

        {tab === 'beheer' && isHrOfAdmin && (
          <GpbBeheerOverzicht beoordelingen={beoordelingen} onVerversen={load} showToast={setToast} />
        )}
      </main>

      {toast && <div className="mo-toast">{toast}</div>}
    </div>
  )
}

function MijnBeoordelingBlok({ beoordeling, onIngediend, showToast }) {
  const [doelen, setDoelen] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [fout, setFout] = useState('')

  useEffect(() => {
    if (beoordeling?.medewerker_ingevuld_at) {
      fetchDoelen(beoordeling.id).then(setDoelen).catch(() => {})
    }
  }, [beoordeling])

  if (!beoordeling) {
    return <div className="idle-state">Er staat nog geen beoordeling voor je klaar.</div>
  }

  if (!beoordeling.medewerker_ingevuld_at) {
    return (
      <>
        {fout && (
          <p className="form-error" role="alert">
            {fout}
          </p>
        )}
        <GpbInvulForm
          titel="Zelfevaluatie"
          afdeling={beoordeling.afdeling}
          functieniveau={beoordeling.functieniveau}
          toontDoelen
          submitLabel="Zelfevaluatie indienen"
          submitting={submitting}
          onSubmit={async (antwoorden, doelenInvoer) => {
            setSubmitting(true)
            setFout('')
            try {
              await submitGpbMedewerker(beoordeling.id, antwoorden, doelenInvoer)
              showToast?.('Zelfevaluatie ingediend.')
              await onIngediend()
            } catch (err) {
              setFout(err.message)
            } finally {
              setSubmitting(false)
            }
          }}
        />
      </>
    )
  }

  return <GpbRapport beoordeling={beoordeling} doelen={doelen} acties={null} />
}

function TeamBlok({ beoordelingen, onIngediend, showToast }) {
  const [geselecteerdId, setGeselecteerdId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [fout, setFout] = useState('')

  const geselecteerd = beoordelingen.find((b) => b.id === geselecteerdId)

  if (beoordelingen.length === 0) {
    return <div className="idle-state">Er zijn nog geen beoordelingen aan je toegewezen als leidinggevende.</div>
  }

  if (geselecteerd) {
    return (
      <div>
        <button type="button" className="btn btn-secondary" onClick={() => setGeselecteerdId(null)}>
          ← Terug naar team-overzicht
        </button>

        {fout && (
          <p className="form-error" role="alert">
            {fout}
          </p>
        )}

        {!geselecteerd.medewerker_ingevuld_at && !geselecteerd.leidinggevende_ingevuld_at && (
          <div className="idle-state">
            {geselecteerd.medewerker_naam} heeft zijn/haar zelfevaluatie nog niet ingediend — je kunt je eigen
            beoordeling hieronder alvast onafhankelijk invullen.
          </div>
        )}

        {!geselecteerd.leidinggevende_ingevuld_at && (
          <GpbInvulForm
            titel={`Beoordeling voor ${geselecteerd.medewerker_naam}`}
            afdeling={geselecteerd.afdeling}
            functieniveau={geselecteerd.functieniveau}
            toontDoelen={false}
            submitLabel="Beoordeling indienen"
            submitting={submitting}
            onSubmit={async (antwoorden) => {
              setSubmitting(true)
              setFout('')
              try {
                await submitGpbLeidinggevende(geselecteerd.id, antwoorden)
                showToast?.('Beoordeling ingediend.')
                await onIngediend()
                setGeselecteerdId(null)
              } catch (err) {
                setFout(err.message)
              } finally {
                setSubmitting(false)
              }
            }}
          />
        )}

        {geselecteerd.leidinggevende_ingevuld_at && (
          <GpbRapportMetDoelen beoordeling={geselecteerd} />
        )}
      </div>
    )
  }

  return (
    <div className="proeftijd-grid">
      {beoordelingen.map((b) => (
        <button type="button" key={b.id} className="section-card gpb-team-kaart" onClick={() => setGeselecteerdId(b.id)}>
          <span className="proeftijd-naam">{b.medewerker_naam}</span>
          <span className="tool-card-hint">
            {b.afdeling} · niveau {b.functieniveau} · {b.periode}
          </span>
          <span className="tool-card-hint">
            {b.leidinggevende_ingevuld_at
              ? 'Al ingediend'
              : b.medewerker_ingevuld_at
                ? 'Klaar om te beoordelen'
                : 'Klaar om te beoordelen (zelfevaluatie loopt nog)'}
          </span>
        </button>
      ))}
    </div>
  )
}

function GpbRapportMetDoelen({ beoordeling }) {
  const [doelen, setDoelen] = useState([])

  useEffect(() => {
    fetchDoelen(beoordeling.id).then(setDoelen).catch(() => {})
  }, [beoordeling])

  return <GpbRapport beoordeling={beoordeling} doelen={doelen} acties={null} />
}
