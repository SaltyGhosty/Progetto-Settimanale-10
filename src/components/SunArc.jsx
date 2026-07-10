// Componente FIGLIO: arco alba → tramonto.
// Il pallino del sole è posizionato sull'arco in base all'ora ATTUALE.
// Gli orari arrivano da /weather (sys.sunrise/sunset, in secondi UTC);
// timezone è lo scostamento della città: sommandolo e formattando in UTC
// si ottiene l'ora LOCALE della città (il classico trucco con OWM).

// Punti di controllo della Bézier quadratica che disegna l'arco
const P0 = { x: 12, y: 58 }
const P1 = { x: 110, y: -14 }
const P2 = { x: 208, y: 58 }

function SunArc({ sunrise, sunset, timezone }) {
  const fmt = (unix) =>
    new Date((unix + timezone) * 1000).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })

  const now = Date.now() / 1000
  // Frazione di giornata trascorsa (0 = alba, 1 = tramonto), bloccata ai bordi
  const t = Math.max(0, Math.min(1, (now - sunrise) / (sunset - sunrise)))
  const isDay = now >= sunrise && now <= sunset

  // Punto sulla curva: formula della Bézier quadratica
  const x = (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x
  const y = (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y

  return (
    <div className="sunarc">
      <svg width="220" height="64" viewBox="0 0 220 64" aria-hidden="true">
        <path
          d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        {/* Di notte il sole resta al bordo, spento */}
        <circle cx={x} cy={y} r="5" className="sunarc-sun" opacity={isDay ? 1 : 0.35} />
      </svg>
      <div className="sunarc-times">
        <span>Alba {fmt(sunrise)}</span>
        <span>Tramonto {fmt(sunset)}</span>
      </div>
    </div>
  )
}

export default SunArc