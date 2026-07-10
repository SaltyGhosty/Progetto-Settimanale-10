// Componente FIGLIO: skeleton di caricamento.
// Invece dello spinner, la "sagoma" grigia del layout con effetto shimmer:
// niente salto di impaginazione quando arrivano i dati veri.
// App decide QUANDO mostrarlo con {loading && <Loading />}.

function Loading() {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="skeleton-hero">
        <div className="skeleton-left">
          <span className="sk sk-temp"></span>
          <span className="sk sk-line"></span>
          <span className="sk sk-line sk-short"></span>
        </div>

        <span className="sk sk-blob"></span>

        <div className="skeleton-days">
          {Array.from({ length: 6 }).map((_, i) => (
            <span className="sk sk-row" key={i}></span>
          ))}
        </div>
      </div>

      <span className="sk sk-strip"></span>
    </div>
  )
}

export default Loading