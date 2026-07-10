// Componente FIGLIO: la fascia oraria in basso.
// Mostra SOLO le ore del giorno scelto nel pannello di destra;
// senza selezione, le prossime 24 ore. La linea ondulata è un grafico
// vero: passa per le temperature e ogni numero è seduto sul suo punto.

import { iconUrl } from '../weatherIcons'

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

function HourlyForecast({ forecast, selectedDate, slideDir }) {
  // Giorno selezionato → le sue fasce orarie; altrimenti le prossime 24 ore
  const hours = selectedDate
    ? forecast.list.filter((i) => i.dt_txt.slice(0, 10) === selectedDate)
    : forecast.list.slice(0, 8)

  // Ogni temperatura diventa un punto: x al centro della sua colonna,
  // y in proporzione tra minima (basso) e massima (alto)
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
      <div className={`hourly-strip slide-${slideDir || 'fwd'}`}>
        <svg
          className="hourly-wave"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Sfumatura verticale sotto la curva: colore d'accento → trasparente */}
            <linearGradient id="hourly-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="hourly-fill-top" />
              <stop offset="100%" className="hourly-fill-bottom" />
            </linearGradient>
          </defs>
          {/* Area riempita: la stessa curva chiusa fino al bordo inferiore */}
          <path
            d={`${buildPath(points)} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`}
            fill="url(#hourly-fill)"
            stroke="none"
          />
          <path d={buildPath(points)} stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>

        {hours.map((hour, index) => {
          // La voce attiva (la più vicina ad ADESSO) ha senso solo senza
          // giorno selezionato: un giorno futuro non contiene "adesso"
          const isNow = !selectedDate && index === 0
          const y = points[index].y

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

              {/* Iconcina del meteo di quella fascia oraria */}
              <img
                className="hourly-icon"
                src={iconUrl(hour.weather[0].icon, 'line')}
                alt={hour.weather[0].description}
              />

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
    </section>
  )
}

export default HourlyForecast