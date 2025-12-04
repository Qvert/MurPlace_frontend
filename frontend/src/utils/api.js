function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

async function ensureCsrf(){
  const token = getCookie('csrftoken')
  if (!token) {
    // hit the csrf endpoint to set cookie
    await fetch('/api/csrf/', { credentials: 'same-origin' })
  }
}

export async function postJSON(url, data) {
  await ensureCsrf()
  const csrftoken = getCookie('csrftoken')

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    // Try to parse json error body if available
    let text = ''
    try { text = await res.text() } catch (e) {}
    throw new Error('Network response was not ok: ' + res.status + ' ' + text)
  }
  return res.json()
}

export async function fetchProductsByCategory(category) {
  // Try protobuf endpoint first, then fallback to JSON endpoint
  const q = category ? `?category=${encodeURIComponent(category)}` : ''
  try {
    const pbRes = await fetch(`/api/products.pb${q}`)
    if (pbRes.ok) {
      const buffer = await pbRes.arrayBuffer()
      const { decodeProductsBuffer } = await import('./proto.js')
      const prods = await decodeProductsBuffer(buffer)
      return prods
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback to JSON
  const res = await fetch(`/api/products/${q}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('Failed fetching products: ' + res.status + ' ' + text)
  }
  const data = await res.json()
  return data.products || []
}
