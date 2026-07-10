import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import SearchBar from './components/Searchbar'
import WeatherCard from './components/WeatherCard'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import Loading from './components/Loading'
import Footer from './components/Footer'
import WeatherBackground from './components/WeatherBackground'
import { heroIconUrl } from './weatherIcons'
import './App.css'

// La API key si legge dal .env (Vite espone solo le variabili con prefisso VITE_)
const API_KEY = import.meta.env.VITE_WEATHER_KEY

const DEFAULT_CITY = 'Buenos Aires'

// Rotte SPA: la URL è la "fonte di verità" della città mostrata.
// /city/Tokyo si può condividere e ricaricare senza perdere nulla.
function App() {
  return (
    <Routes>
      <Route path="/" element={<WeatherPage />} />
      <Route path="/city/:cityName" element={<WeatherPage />} />
      {/* Qualsiasi altra URL torna alla home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Componente PADRE della pagina: qui vivono tutti gli stati e la logica.
// I figli ricevono dati e funzioni via props ("lifting state up").
function WeatherPage() {
  // La città arriva dalla URL; senza parametro si usa quella di default
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

  // Lazy init: localStorage si legge solo al primo render,
  // così la lista sopravvive alla chiusura della pagina
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
    setSelectedDay(null) // nuova città → si riparte dal meteo di oggi

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

  // Ogni volta che cambia la città nella URL (ricerca, link condiviso,
  // frecce avanti/indietro del browser) si scarica il meteo corrispondente
  useEffect(() => {
    fetchWeather(cityName || DEFAULT_CITY)
  }, [cityName])

  // Autocomplete con debounce: 350ms di pausa prima di chiamare la Geocoding API;
  // la cleanup cancella il timer se l'utente digita ancora
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

  // Cercare = navigare: cambia la rotta e l'useEffect qui sopra fa il resto
  function goToCity(searchName) {
    navigate(`/city/${encodeURIComponent(searchName)}`)
  }

  function handleCityChange(value) {
    setCity(value)
    setShowSuggestions(true)
  }

  // Passiamo anche il codice paese (es. "Roma,IT") per evitare ambiguità
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

  // Rimuove una città dalle recenti (stato + localStorage)
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

  // --- DETTAGLIO del giorno selezionato ---
  // Le voci /forecast hanno la stessa forma di /weather (main, wind, weather[0]):
  // la voce di metà giornata fa da "meteo del giorno" per WeatherCard e icona
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

  return (
    <>
      {/* Scena animata sullo sfondo DELLA PAGINA (dietro la card).
          Segue il meteo mostrato, anche il giorno selezionato */}
      {heroWeather && !loading && (
        <WeatherBackground icon={heroWeather.weather[0].icon} />
      )}

      <div className="app-card">
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
        />

        {/* Rendering condizionale: spinner, errore o i pannelli con i dati */}
        {loading && <Loading />}

        {error && !loading && <p className="status-error">{error}</p>}

        {weather && !loading && (
          <div className="hero">
            <WeatherCard weather={heroWeather} dayLabel={dayLabel} minMax={minMax} />

            <div className="hero-figure">
              <img
                className="hero-icon"
                src={heroIconUrl(heroWeather.weather[0].icon)}
                alt={heroWeather.weather[0].description}
              />
            </div>

            {forecast && (
              <DailyForecast
                forecast={forecast}
                selectedDate={selectedDay}
                onDaySelect={setSelectedDay}
              />
            )}
          </div>
        )}

        {/* key: cambiando giorno il componente si ricrea e riparte da pagina 0 */}
        {forecast && !loading && (
          <HourlyForecast
            forecast={forecast}
            selectedDate={selectedDay}
            key={selectedDay || 'all'}
          />
        )}
      </div>

      <Footer />
    </>
  )
}

export default App