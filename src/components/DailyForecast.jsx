// Componente FIGLIO: selettore del giorno (pannello di destra).
// Mostra UN SOLO giorno alla volta: le frecce ◀ ▶ scorrono i giorni della
// settimana e la selezione aggiorna hero e fascia oraria.
// /forecast non dà un riassunto giornaliero: dà 40 voci ogni 3 ore,
// qui le raggruppiamo per giorno con minima, massima e icona di metà giornata.

import { iconUrl } from '../weatherIcons'

// [{ date: '2026-07-10', min: 18, max: 31, icon: '01d', description: '...' }, ...]
function groupByDay(list) {
  const days = {}

  for (const item of list) {
    // dt_txt è tipo "2026-07-10 15:00:00" → i primi 10 caratteri sono la data
    const date = item.dt_txt.slice(0, 10)
    if (!days[date]) days[date] = []
    days[date].push(item)
  }

  return Object.entries(days).map(([date, items]) => {
    const temps = items.map((i) => i.main.temp)
    // La voce di metà giornata è la più rappresentativa per icona/descrizione
    const midday = items[Math.floor(items.length / 2)]

    return {
      date,
      min: Math.round(Math.min(...temps)),
      max: Math.round(Math.max(...temps)),
      icon: midday.weather[0].icon,
      description: midday.weather[0].description,
    }
  })
}

// "2026-07-10" → "venerdì". T12:00 evita che il fuso orario sposti la data
function dayLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('it-IT', { weekday: 'long' })
}

function DailyForecast({ forecast, selectedDate, onDaySelect, slideDir }) {
  const days = groupByDay(forecast.list)

  // Estremi della settimana: la barretta min/max è sempre sulla stessa scala
  const weekMin = Math.min(...days.map((d) => d.min))
  const weekMax = Math.max(...days.map((d) => d.max))
  const weekRange = weekMax - weekMin || 1

  // Nessuna selezione = oggi (indice 0)
  const index = selectedDate ? days.findIndex((d) => d.date === selectedDate) : 0
  const day = days[index] || days[0]

  // Le frecce spostano la selezione di un giorno; oggi torna a null
  function go(delta) {
    const next = index + delta
    if (next < 0 || next >= days.length) return
    onDaySelect(next === 0 ? null : days[next].date)
  }

  return (
    <aside className="daily">
      <div className="daily-nav">
        <button
          type="button"
          className="daily-arrow"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Giorno precedente"
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

        <span className="daily-name">{index === 0 ? 'Oggi' : dayLabel(day.date)}</span>

        <button
          type="button"
          className="daily-arrow"
          onClick={() => go(1)}
          disabled={index === days.length - 1}
          aria-label="Giorno successivo"
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

      {/* key: cambiando giorno il corpo si ricrea → lo scivolamento riparte */}
      <div className={`daily-body slide-${slideDir || 'fwd'}`} key={day.date}>
        <img className="daily-icon" src={iconUrl(day.icon, 'line')} alt={day.description} />

        <span className="daily-desc">{day.description}</span>

        {/* min | barretta del range sulla scala della settimana | max */}
        <span className="daily-temps">
          <span className="daily-min">{day.min}°</span>
          <span className="daily-bar">
            <span
              className="daily-bar-fill"
              style={{
                left: `${((day.min - weekMin) / weekRange) * 100}%`,
                width: `${Math.max(((day.max - day.min) / weekRange) * 100, 8)}%`,
              }}
            />
          </span>
          <span className="daily-max">{day.max}°</span>
        </span>
      </div>
    </aside>
  )
}

export default DailyForecast