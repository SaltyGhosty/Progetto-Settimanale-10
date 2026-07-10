// Componente FIGLIO: indicatore di caricamento.
// App decide QUANDO mostrarlo con {loading && <Loading />}.

function Loading() {
  return (
    <div className="status status-loading">
      <span className="spinner"></span>
      <p>Caricamento...</p>
    </div>
  )
}

export default Loading