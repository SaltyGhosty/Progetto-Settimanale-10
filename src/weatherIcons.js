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

export function heroIconUrl(owmCode) {
  return (
    heroIcons[`/src/assets/weather3d/${owmCode}.png`] ||
    heroIcons['/src/assets/weather3d/03d.png']
  )
}