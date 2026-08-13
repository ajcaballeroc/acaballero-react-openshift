import { useState, useEffect } from 'react'
import { getSipap } from '../api'
import FavoriteButton from './FavoriteButton'

function SipapList() {
  const [motivos, setMotivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSipap()
      .then(setMotivos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando SIPAP...</p>
  if (error) return <p className="fav-status fav-error">{error}</p>

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Motivo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {motivos.map((motivo) => (
          <tr key={motivo.code}>
            <td>{motivo.code}</td>
            <td>{motivo.motive}</td>
            <td>
              <FavoriteButton
                type="SIPAP"
                referenceId={motivo.code}
                description={motivo.motive}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default SipapList
