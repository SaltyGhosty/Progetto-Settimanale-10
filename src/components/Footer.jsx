// Componente FIGLIO: piè di pagina.
// getFullYear() → il copyright non va mai aggiornato a mano.

function Footer() {
  return (
    <footer className="footer">
      <p>
        Dati meteo di{' '}
        <a href="https://openweathermap.org" target="_blank" rel="noreferrer">
          OpenWeatherMap
        </a>{' '}
        · © {new Date().getFullYear()} Weather App — Pratica React
      </p>
    </footer>
  )
}

export default Footer