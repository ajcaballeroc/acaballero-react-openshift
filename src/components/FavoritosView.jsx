import { useState, useEffect } from 'react'
import { getFavoritos } from '../api'

function FavoritosView() {
  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getFavoritos()
      .then(setFavoritos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando favoritos...</p>
  if (error) return <p className="fav-status fav-error">{error}</p>
  if (favoritos.length === 0) return <p>Todavía no hay favoritos guardados.</p>

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Referencia</th>
          <th>Descripción</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {favoritos.map((favorito) => (
          <tr key={favorito.id}>
            <td>{favorito.type}</td>
            <td>{favorito.referenceId}</td>
            <td>{favorito.description}</td>
            <td>{favorito.registrationDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default FavoritosView
