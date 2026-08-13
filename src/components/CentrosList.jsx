import { useState, useEffect } from 'react'
import { getCentros } from '../api'
import FavoriteButton from './FavoriteButton'

function CentrosList() {
  const [centros, setCentros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCentros()
      .then(setCentros)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando centros...</p>
  if (error) return <p className="fav-status fav-error">{error}</p>

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Ciudad</th>
          <th>Dirección</th>
          <th>Tipo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {centros.map((centro) => (
          <tr key={`${centro.nombre}-${centro.direccion}`}>
            <td>{centro.nombre}</td>
            <td>{centro.ciudad}</td>
            <td>{centro.direccion}</td>
            <td>{centro.tipo}</td>
            <td>
              <FavoriteButton
                type="CENTRO"
                referenceId={centro.nombre}
                description={`${centro.nombre} - ${centro.direccion}, ${centro.ciudad}`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CentrosList
