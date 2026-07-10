// Componente FIGLIO: scena animata DIETRO al contenuto della card.
// La scena si sceglie dal codice icona OWM (es. "10d"): il numero dice il
// fenomeno, la lettera d/n dice giorno o notte. Solo CSS, nessuna libreria.

import { useMemo } from 'react'

function sceneFor(icon) {
  const code = icon.slice(0, 2)
  const night = icon.endsWith('n')
  if (code === '11') return 'storm'
  if (code === '09' || code === '10') return 'rain'
  if (code === '13') return 'snow'
  if (code === '50') return 'mist'
  if (code === '01') return night ? 'stars' : 'sun'
  return 'clouds' // 02, 03, 04
}

// n particelle con posizioni/tempi casuali.
// useMemo le tiene stabili: si rigenerano solo quando cambia la scena
function makeParticles(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 8,
    size: 0.5 + Math.random(),
  }))
}

function WeatherBackground({ icon }) {
  const scene = icon ? sceneFor(icon) : null

  const particles = useMemo(() => {
    if (scene === 'rain' || scene === 'storm') return makeParticles(55)
    if (scene === 'snow') return makeParticles(35)
    if (scene === 'stars') return makeParticles(45)
    return []
  }, [scene])

  if (!scene) return null

  return (
    <div className={`weather-bg weather-bg-${scene}`} aria-hidden="true">
      {(scene === 'rain' || scene === 'storm') &&
        particles.map((p) => (
          <span
            key={p.id}
            className="bg-drop"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay * 0.25}s`,
              animationDuration: `${0.7 + p.size * 0.6}s`,
            }}
          />
        ))}

      {/* Il lampo: un velo chiaro che "sfarfalla" ogni tanto (vedi keyframes) */}
      {scene === 'storm' && <span className="bg-flash" />}

      {scene === 'snow' &&
        particles.map((p) => (
          <span
            key={p.id}
            className="bg-flake"
            style={{
              left: `${p.left}%`,
              // --sway: deriva orizzontale del fiocco, letta dai keyframes
              '--sway': `${(p.size - 0.75) * 160}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${5 + p.size * 5}s`,
              width: `${3 + p.size * 3}px`,
              height: `${3 + p.size * 3}px`,
            }}
          />
        ))}

      {scene === 'stars' &&
        particles.map((p) => (
          <span
            key={p.id}
            className="bg-star"
            style={{
              left: `${p.left}%`,
              top: `${p.top * 0.75}%`,
              animationDelay: `${p.delay * 0.5}s`,
              animationDuration: `${1.5 + p.size * 2.5}s`,
              width: `${1.5 + p.size * 1.5}px`,
              height: `${1.5 + p.size * 1.5}px`,
            }}
          />
        ))}

      {scene === 'clouds' && (
        <>
          <span className="bg-cloud" style={{ top: '6%', animationDuration: '70s' }} />
          <span
            className="bg-cloud"
            style={{ top: '32%', animationDuration: '95s', animationDelay: '-35s' }}
          />
          <span
            className="bg-cloud"
            style={{ top: '58%', animationDuration: '80s', animationDelay: '-60s' }}
          />
        </>
      )}

      {scene === 'mist' && (
        <>
          <span className="bg-fog" style={{ top: '14%' }} />
          <span className="bg-fog" style={{ top: '44%', animationDelay: '-7s' }} />
          <span className="bg-fog" style={{ top: '70%', animationDelay: '-13s' }} />
        </>
      )}

      {scene === 'sun' && <span className="bg-sun" />}
    </div>
  )
}

export default WeatherBackground