const API_URL = window.APP_CONFIG.API_URL

export async function getCentros() {
  const res = await fetch(`${API_URL}/api/sucursales`)
  if (!res.ok) throw new Error('No se pudieron cargar los centros')
  return res.json()
}

export async function getSipap() {
  const res = await fetch(`${API_URL}/api/sipap`)
  if (!res.ok) throw new Error('No se pudo cargar el listado SIPAP')
  return res.json()
}

export async function getFavoritos() {
  const res = await fetch(`${API_URL}/favoritos`)
  if (!res.ok) throw new Error('No se pudieron cargar los favoritos')
  return res.json()
}

export async function addFavorito(favorito) {
  const res = await fetch(`${API_URL}/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(favorito),
  })

  if (res.status === 409) {
    throw new Error('Ese elemento ya está guardado en favoritos')
  }
  if (!res.ok) {
    throw new Error('No se pudo guardar el favorito')
  }
  return res.json()
}
