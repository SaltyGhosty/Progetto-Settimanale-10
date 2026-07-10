import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import SearchBar from './components/Searchbar'
import WeatherCard from './components/WeatherCard'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import Loading from './components/Loading'
import Footer from './components/Footer'
import WeatherBackground from './components/WeatherBackground'
import { heroIconUrl, sceneFor } from './weatherIcons'
import './App.css'

// La API key si legge dal .env (Vite espone solo le variabili con prefisso VITE_)
const API_KEY = import.meta.env.VITE_WEATHER_KEY

const DEFAULT_CITY = 'Buenos Aires'

// Colore d'accento per ogni scena: entra nella card come variabile CSS --accent
const ACCENTS = {
  sun: '#ffb02e',
  clouds: '#ffb02e',
  rain: '#6ea8ff',
  storm: '#8fb1ff',
  snow: '#a5d8ff',
  stars: '#b7a6ff',
  mist: '#c9c9c9',
}

// Rotte SPA: la URL è la fonte di verità della città mostrata (condivisibile)
function App() {
  return (
    <Routes>
      <Route path="/" element={<WeatherPage />} />
      <Route path="/city/:cityName" element={<WeatherPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Componente PADRE: qui vivono stati e logica, i figli ricevono props ("lifting state up")
function WeatherPage() {
  const { cityName } = useParams()
  const navigate = useNavigate()

  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Giorno selezionato nel pannello di destra (null = oggi / meteo attuale)
  const [selectedDay, setSelectedDay] = useState(null)

  // Direzione dell'animazione: avanti = entra da destra, indietro = da sinistra
  const [slideDir, setSlideDir] = useState('fwd')

  function handleDaySelect(date) {
    // Le date ISO si confrontano come stringhe; '' (oggi) è la più piccola
    setSlideDir((date || '') > (selectedDay || '') ? 'fwd' : 'back')
    setSelectedDay(date)
  }

  // Lazy init: localStorage si legge solo al primo render
  const [recentCities, setRecentCities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentCities')) || []
    } catch {
      return []
    }
  })

  // Due chiamate in parallelo: /weather (adesso) e /forecast (5 giorni, ogni 3 ore)
  async function fetchWeather(searchName) {
    if (searchName.trim() === '') {
      setError('Scrivi il nome di una città')
      return
    }

    setLoading(true)
    setError(null)
    setWeather(null)
    setForecast(null)
    setSelectedDay(null)

    try {
      // units=metric → gradi Celsius | lang=it → descrizione in italiano
      const base = 'https://api.openweathermap.org/data/2.5'
      const params = `q=${encodeURIComponent(searchName)}&appid=${API_KEY}&units=metric&lang=it`

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${base}/weather?${params}`),
        fetch(`${base}/forecast?${params}`),
      ])

      // fetch NON va nel catch con un 404: response.ok si controlla a mano
      if (!weatherRes.ok) {
        if (weatherRes.status === 404) {
          throw new Error('Città non trovata. Controlla il nome e riprova.')
        }
        if (weatherRes.status === 401) {
          throw new Error('API key non valida o non ancora attivata. Aspetta un po\' e riprova.')
        }
        throw new Error("C'è stato un problema con l'API. Riprova più tardi.")
      }

      const weatherData = await weatherRes.json()
      setWeather(weatherData)

      // Recenti: la nuova in cima, senza duplicati, massimo 8
      setRecentCities((prev) => {
        const updated = [
          weatherData.name,
          ...prev.filter((c) => c !== weatherData.name),
        ].slice(0, 8)
        localStorage.setItem('recentCities', JSON.stringify(updated))
        return updated
      })

      // Se le previsioni falliscono mostriamo comunque il meteo attuale
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json()
        setForecast(forecastData)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cambia la città nella URL (ricerca, link, frecce del browser) → nuovo fetch
  useEffect(() => {
    fetchWeather(cityName || DEFAULT_CITY)
  }, [cityName])

  // Autocomplete con debounce: 350ms di pausa prima di chiamare la Geocoding API
  useEffect(() => {
    if (!showSuggestions || city.trim().length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`
        )
        if (res.ok) {
          setSuggestions(await res.json())
        }
      } catch {
        setSuggestions([])
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [city, showSuggestions])

  // Cercare = navigare: cambia la rotta e l'useEffect [cityName] fa il resto
  function goToCity(searchName) {
    navigate(`/city/${encodeURIComponent(searchName)}`)
  }

  function handleCityChange(value) {
    setCity(value)
    setShowSuggestions(true)
  }

  // Col codice paese (es. "Roma,IT") si evitano le città omonime
  function handleSuggestionClick(sugg) {
    setShowSuggestions(false)
    setSuggestions([])
    setCity('')
    goToCity(`${sugg.name},${sugg.country}`)
  }

  function handleRecentSelect(selectedName) {
    setCity('')
    goToCity(selectedName)
  }

  function handleRecentRemove(selectedName) {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c !== selectedName)
      localStorage.setItem('recentCities', JSON.stringify(updated))
      return updated
    })
  }

  function handleSearch(event) {
    event.preventDefault() // evita che il form ricarichi la pagina
    setShowSuggestions(false)
    setSuggestions([])
    if (city.trim() === '') {
      setError('Scrivi il nome di una città')
      return
    }
    goToCity(city.trim())
    setCity('')
  }

  // Dettaglio del giorno selezionato: le voci /forecast hanno la stessa forma
  // di /weather, quindi quella di metà giornata fa da "meteo del giorno"
  const dayItems =
    selectedDay && forecast
      ? forecast.list.filter((i) => i.dt_txt.slice(0, 10) === selectedDay)
      : []
  const midday = dayItems.length
    ? dayItems[Math.floor(dayItems.length / 2)]
    : null

  const heroWeather = midday || weather
  const dayTemps = dayItems.map((i) => i.main.temp)
  const minMax = midday
    ? {
        min: Math.round(Math.min(...dayTemps)),
        max: Math.round(Math.max(...dayTemps)),
      }
    : null
  const dayLabel = midday
    ? new Date(`${selectedDay}T12:00:00`).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null

  // Scena e accento seguono il meteo mostrato (anche il giorno selezionato)
  const scene = heroWeather ? sceneFor(heroWeather.weather[0].icon) : null
  const accent = ACCENTS[scene] || '#ffb02e'

  return (
    <>
      {/* Scena meteo sullo sfondo della pagina, dietro la card */}
      {heroWeather && !loading && (
        <WeatherBackground icon={heroWeather.weather[0].icon} />
      )}

      <div className="app-card" style={{ '--accent': accent }}>
        {/* La stessa scena anche dentro la card (variante ritagliata) */}
        {heroWeather && !loading && (
          <WeatherBackground icon={heroWeather.weather[0].icon} variant="card" />
        )}

        <SearchBar
          city={city}
          onCityChange={handleCityChange}
          onSearch={handleSearch}
          suggestions={showSuggestions ? suggestions : []}
          onSuggestionClick={handleSuggestionClick}
          recentCities={recentCities}
          onRecentSelect={handleRecentSelect}
          onRecentRemove={handleRecentRemove}
          location={weather ? `${weather.name}, ${weather.sys.country}` : '—'}
          countryCode={weather ? weather.sys.country : null}
          timezone={weather ? weather.timezone : null}
        />

        {/* Rendering condizionale: skeleton, errore o i pannelli con i dati */}
        {loading && <Loading />}

        {error && !loading && <p className="status-error">{error}</p>}

        {weather && !loading && (
          <div className="hero">
            {/* key (con prefisso: dev'essere unica tra fratelli!): cambiando
                giorno il blocco si ricrea e l'animazione slide riparte */}
            <div className={`slide-${slideDir}`} key={`card-${selectedDay || 'now'}`}>
              <WeatherCard
                weather={heroWeather}
                dayLabel={dayLabel}
                minMax={minMax}
                sun={{
                  sunrise: weather.sys.sunrise,
                  sunset: weather.sys.sunset,
                  timezone: weather.timezone,
                }}
              />
            </div>

            <div className="hero-figure pop" key={`fig-${selectedDay || 'now'}`}>
              {/* hero-icon-{scena}: l'animazione dell'icona segue il meteo */}
              <img
                className={`hero-icon hero-icon-${scene}`}
                src={heroIconUrl(heroWeather.weather[0].icon)}
                alt={heroWeather.weather[0].description}
              />
            </div>

            {forecast && (
              <DailyForecast
                forecast={forecast}
                selectedDate={selectedDay}
                onDaySelect={handleDaySelect}
                slideDir={slideDir}
              />
            )}
          </div>
        )}

        {forecast && !loading && (
          <HourlyForecast
            forecast={forecast}
            selectedDate={selectedDay}
            slideDir={slideDir}
            key={`hours-${selectedDay || 'all'}`}
          />
        )}
      </div>

      <Footer />
    </>
  )
}

export default App