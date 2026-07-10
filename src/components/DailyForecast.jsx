// Componente FIGLIO: il pannello dei prossimi giorni.
// /forecast non dà un riassunto giornaliero: dà 40 voci ogni 3 ore.
// Qui le raggruppiamo per giorno con minima, massima e icona di metà giornata.

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

function DailyForecast({ forecast, selectedDate, onDaySelect }) {
  const days = groupByDay(forecast.list)

  return (
    <aside className="daily">
      <ul className="daily-list">
        {days.map((day, index) => {
          // Riga attiva: il giorno selezionato, oppure oggi se non c'è selezione
          const isActive = selectedDate ? day.date === selectedDate : index === 0

          return (
            <li key={day.date}>
              {/* Cliccare un giorno mostra il suo dettaglio; "Oggi" (null)
                  riporta al meteo attuale */}
              <button
                type="button"
                className={`daily-row ${isActive ? 'daily-row-active' : ''}`}
                onClick={() => onDaySelect(index === 0 ? null : day.date)}
              >
                <img
                  className="daily-icon"
                  src={iconUrl(day.icon, 'line')}
                  alt={day.description}
                />

                <span className="daily-info">
                  <span className="daily-name">{index === 0 ? 'Oggi' : dayLabel(day.date)}</span>
                  <span className="daily-desc">{day.description}</span>
                </span>

                <span className="daily-temp">
                  {day.max}
                  <span className="deg">°</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default DailyForecast