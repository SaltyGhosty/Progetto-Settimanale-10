// Componente FIGLIO: la fascia oraria in basso.
// La linea ondulata è un grafico vero: passa per le temperature delle
// prossime ore. /forecast dà 40 voci (ogni 3 ore per 5 giorni):
// ne mostriamo 8 alla volta, le frecce cambiano "pagina".

import { useState } from 'react'

const PER_PAGE = 8

// Dimensioni "virtuali" del disegno SVG (il viewBox)
const VIEW_W = 800
const VIEW_H = 64

// Curva morbida che passa per i punti: Bézier cubica con i punti di
// controllo a metà strada tra un punto e l'altro
function buildPath(points) {
  const first = points[0]
  const last = points[points.length - 1]

  let d = `M 0 ${first.y.toFixed(1)} L ${first.x.toFixed(1)} ${first.y.toFixed(1)}`

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const xMid = ((prev.x + curr.x) / 2).toFixed(1)
    d += ` C ${xMid} ${prev.y.toFixed(1)}, ${xMid} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
  }

  d += ` L ${VIEW_W} ${last.y.toFixed(1)}`
  return d
}

function HourlyForecast({ forecast, selectedDate }) {
  // Stato LOCALE: quale pagina di orari stiamo guardando
  const [page, setPage] = useState(0)

  // Con un giorno selezionato si mostrano solo le sue ore
  const list = selectedDate
    ? forecast.list.filter((i) => i.dt_txt.slice(0, 10) === selectedDate)
    : forecast.list

  const totalPages = Math.ceil(list.length / PER_PAGE)
  const hours = list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  // Ogni temperatura diventa un punto: x al centro della sua colonna,
  // y in proporzione tra minima (basso) e massima (alto) della pagina
  const temps = hours.map((h) => h.main.temp)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const range = max - min || 1 // evita la divisione per zero

  const points = temps.map((temp, i) => ({
    x: (i + 0.5) * (VIEW_W / hours.length),
    // y minimo 24 → il numero (24px sopra il punto) non esce mai dal riquadro
    y: 54 - ((temp - min) / range) * 30,
  }))

  return (
    <section className="hourly">
      {/* key={page}: cambiando pagina React ricrea il blocco e
          l'animazione CSS di entrata riparte */}
      <div className="hourly-strip" key={page}>
        <svg
          className="hourly-wave"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={buildPath(points)} stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>

        {hours.map((hour, index) => {
          // La voce attiva (la più vicina ad ADESSO) ha senso solo senza
          // giorno selezionato: un giorno futuro non contiene "adesso"
          const isNow = !selectedDate && page === 0 && index === 0
          const y = points[index].y

          // Il giorno ("ven", "sab"...) si mostra solo quando cambia
          // rispetto alla colonna precedente
          const day = new Date(hour.dt * 1000).toLocaleDateString('it-IT', {
            weekday: 'short',
          })
          const prevDay =
            index > 0 &&
            new Date(hours[index - 1].dt * 1000).toLocaleDateString('it-IT', {
              weekday: 'short',
            })
          const showDay = index === 0 || day !== prevDay

          return (
            <div className="hourly-col" key={hour.dt}>
              <div className="hourly-point">
                {/* Il numero è appoggiato sopra il suo punto della curva */}
                <span className="hourly-temp" style={{ top: `${y - 24}px` }}>
                  {Math.round(hour.main.temp)}
                  <span className="deg">°</span>
                </span>
                {isNow && (
                  <span className="hourly-dot" style={{ top: `${y - 3.5}px` }} aria-hidden="true" />
                )}
              </div>

              {/* &nbsp; quando non va mostrato: occupa comunque la riga */}
              <span className="hourly-day">{showDay ? day : ' '}</span>

              {/* dt è in secondi; Date vuole millisecondi → * 1000 */}
              <span className={`hourly-time ${isNow ? 'hourly-time-active' : ''}`}>
                {new Date(hour.dt * 1000).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )
        })}
      </div>

      {/* Frecce disabilitate ai bordi della lista */}
      <div className="hourly-nav">
        <button
          type="button"
          className="hourly-arrow"
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 0}
          aria-label="Ore precedenti"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="hourly-arrow"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Ore successive"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default HourlyForecast