// Icone Meteocons (MIT), già rinominate con i codici OpenWeatherMap (01d, 11n...):
// 'fill' = colorate 3D (illustrazione grande) | 'line' = linea sottile (pannello giorni).
// import.meta.glob è di VITE: importa in blocco i file del pattern e li mette
// nel bundle → niente richieste a siti esterni.
const fillIcons = import.meta.glob(
  '/node_modules/@bybas/weather-icons/production/fill/openweathermap/*.svg',
  { eager: true, query: '?url', import: 'default' }
)

const lineIcons = import.meta.glob(
  '/node_modules/@bybas/weather-icons/production/line/openweathermap/*.svg',
  { eager: true, query: '?url', import: 'default' }
)

// Render 3D Microsoft Fluent Emoji (MIT) per l'illustrazione grande al centro
const heroIcons = import.meta.glob('/src/assets/weather3d/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

// URL dell'SVG per un codice OpenWeatherMap; "04d" (nuvoloso) è il ripiego
export function iconUrl(owmCode, style = 'fill') {
  const icons = style === 'line' ? lineIcons : fillIcons
  const base = `/node_modules/@bybas/weather-icons/production/${style}/openweathermap`
  return icons[`${base}/${owmCode}.svg`] || icons[`${base}/04d.svg`]
}

// Mappa il codice icona in un tipo di scena per lo sfondo animato:
// il numero dice il fenomeno, la lettera d/n dice giorno o notte
export function sceneFor(icon) {
  const code = icon.slice(0, 2)
  const night = icon.endsWith('n')
  if (code === '11') return 'storm'
  if (code === '09' || code === '10') return 'rain'
  if (code === '13') return 'snow'
  if (code === '50') return 'mist'
  if (code === '01') return night ? 'stars' : 'sun'
  return 'clouds' // 02, 03, 04
}

export function heroIconUrl(owmCode) {
  return (
    heroIcons[`/src/assets/weather3d/${owmCode}.png`] ||
    heroIcons['/src/assets/weather3d/03d.png']
  )
}