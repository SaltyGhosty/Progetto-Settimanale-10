// Componente FIGLIO di presentazione: temperatura, descrizione, vento e umidità.
// Non chiede dati, riceve tutto via props.

// Mini-componente per le due statistiche: etichetta sopra, valore sotto
function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">
        {icon}
        {label}
      </span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

const windIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 8h9.5a2.5 2.5 0 1 0-2.5-2.5M3 13h13.5a2.5 2.5 0 1 1-2.5 2.5M3 18h7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
)

const humidityIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3c3.5 4.2 6 7.4 6 10.4a6 6 0 1 1-12 0C6 10.4 8.5 7.2 12 3Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
)

const thermoIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10 4a2 2 0 1 1 4 0v9.3a4.5 4.5 0 1 1-4 0V4Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
)

// dayLabel e minMax arrivano solo quando è selezionato un giorno futuro
function WeatherCard({ weather, dayLabel, minMax }) {
  return (
    <div className="current">
      {dayLabel && <p className="current-day">{dayLabel}</p>}

      <p className="current-temp">
        {Math.round(weather.main.temp)}
        <span className="current-unit">°c</span>
      </p>

      <h2 className="current-desc">{weather.weather[0].description}</h2>

      <div className="current-stats">
        {/* L'API dà il vento in m/s; ×3.6 per avere km/h */}
        <Stat
          icon={windIcon}
          label="Vento"
          value={`${(weather.wind.speed * 3.6).toFixed(1)}km/h`}
        />
        <Stat icon={humidityIcon} label="Umidità" value={`${weather.main.humidity}%`} />
        {minMax && (
          <Stat icon={thermoIcon} label="Min / Max" value={`${minMax.min}° / ${minMax.max}°`} />
        )}
      </div>
    </div>
  )
}

export default WeatherCard