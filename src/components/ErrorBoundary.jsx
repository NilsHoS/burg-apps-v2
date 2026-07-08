import { Component } from 'react'

/**
 * Vangt onverwachte render-crashes op (bv. door onvoorspelbare data van een
 * externe bron zoals Doorgroei Tracker's Google Sheet-koppeling) zodat één
 * kapotte pagina niet de hele app wit laat wegvallen. Herstel gaat via een
 * gewone <a>-navigatie (volledige page reload), dus geen aparte reset-logica
 * nodig bij het wisselen van route.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Onverwachte fout tijdens renderen:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="center-page">
          <div className="empty-state">
            <h1>Er ging iets mis</h1>
            <p>Deze pagina kon niet worden weergegeven, mogelijk door onverwachte gegevens.</p>
            <a className="btn btn-primary" href="/">
              Terug naar dashboard
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
