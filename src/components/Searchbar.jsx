// Componente FIGLIO: la barra superiore della card.
// Tre zone: marchio | pillola della località + data | barra di ricerca.
// Lo stato della ricerca vive in App: qui arrivano solo props.

import { useState, useEffect } from 'react'

// Bandiera del paese da flagcdn.com a partire dal codice ISO (es. "IT" → it.png)
function flagUrl(countryCode, width = 40) {
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`
}

// Data e ora LOCALI della città, aggiornate ogni secondo.
// timezone è lo scostamento in secondi da UTC (da /weather): sommandolo
// al tempo attuale e formattando in UTC si ottiene l'ora della città
function CityDateTime({ timezone }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer) // cleanup: niente timer fantasma
  }, [])

  const hasTz = timezone !== null && timezone !== undefined
  const date = new Date(hasTz ? now + timezone * 1000 : now)
  const opts = hasTz ? { timeZone: 'UTC' } : {}

  const dayText = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...opts,
  })
  const timeText = date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  })

  return (
    <span className="topbar-date">
      {dayText} · <span className="topbar-clock">{timeText}</span>
    </span>
  )
}

function SearchBar({
  city,
  onCityChange,
  onSearch,
  suggestions,
  onSuggestionClick,
  recentCities,
  onRecentSelect,
  onRecentRemove,
  location,
  countryCode,
  timezone,
}) {
  // Unico stato LOCALE: è solo un dettaglio di interfaccia, può vivere qui
  const [showRecent, setShowRecent] = useState(false)

  return (
    <header className="topbar">
      <span className="brand">⛅ Meteo</span>

      <div className="location-wrap">
        <div className="location-pill">
          <span className="location-pin" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>

          {/* La bandiera del paese della città caricata */}
          {countryCode && (
            <img
              className="location-flag"
              src={flagUrl(countryCode)}
              alt={countryCode}
            />
          )}

          <span className="location-name">{location}</span>

          {/* La freccetta ⌄ apre/chiude il menu delle città recenti */}
          <button
            type="button"
            className="location-chevron"
            onClick={() => setShowRecent((open) => !open)}
            aria-label="Città recenti"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showRecent && (
            <ul className="dropdown">
              {recentCities.length === 0 ? (
                <li className="dropdown-empty">Nessuna ricerca recente</li>
              ) : (
                recentCities.map((name) => (
                  // Due bottoni separati: il nome cerca, la × elimina.
                  // Il menu resta aperto → si possono eliminare più città di fila
                  <li className="dropdown-row" key={name}>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setShowRecent(false)
                        onRecentSelect(name)
                      }}
                    >
                      <span>{name}</span>
                    </button>
                    <button
                      type="button"
                      className="dropdown-remove"
                      onClick={() => onRecentRemove(name)}
                      aria-label={`Rimuovi ${name} dalle recenti`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <CityDateTime timezone={timezone} />
      </div>

      <form className="search-form" onSubmit={onSearch}>
        <span className="search-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <line
              x1="16.5"
              y1="16.5"
              x2="21"
              y2="21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          type="text"
          className="search-input"
          placeholder="Cerca città o paese..."
          value={city}
          // Il figlio non modifica lo stato: passa il valore al padre
          onChange={(event) => onCityChange(event.target.value)}
          autoComplete="off"
        />

        {/* Suggerimenti della Geocoding API mentre si digita */}
        {suggestions.length > 0 && (
          <ul className="dropdown">
            {suggestions.map((sugg, index) => (
              // Nessun id univoco nella risposta: key = nome+coordinate
              <li key={`${sugg.name}-${sugg.lat}-${sugg.lon}-${index}`}>
                {/* type="button" per NON inviare il form al click */}
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => onSuggestionClick(sugg)}
                >
                  <span className="dropdown-city">
                    <img
                      className="dropdown-flag"
                      src={flagUrl(sugg.country, 20)}
                      alt=""
                    />
                    {sugg.name}
                  </span>
                  <span className="dropdown-detail">
                    {sugg.state ? `${sugg.state}, ` : ''}
                    {sugg.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>
    </header>
  )
}

export default SearchBar