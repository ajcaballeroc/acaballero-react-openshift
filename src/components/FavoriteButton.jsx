import { useState } from 'react'
import { addFavorito } from '../api'

function FavoriteButton({ type, referenceId, description }) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleClick = async () => {
    setSaving(true)
    setError('')
    try {
      await addFavorito({ type, referenceId, description })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return <span className="fav-status fav-saved">Guardado ✓</span>
  }

  return (
    <div className="fav-action">
      <button type="button" onClick={handleClick} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar en Favoritos'}
      </button>
      {error && <span className="fav-status fav-error">{error}</span>}
    </div>
  )
}

export default FavoriteButton
