export async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`/api/products${q}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('Failed fetching products: ' + res.status + ' ' + text)
  }
  const data = await res.json()
  return data.products || []
}

export async function fetchProductsBySearch(query, offset = 0, limit = 20) {
  // Fallback to JSON only for search (no protobuf support yet)
  const params = new URLSearchParams({
    q: query,
    offset: offset.toString(),
    limit: limit.toString()
  })
  
  const res = await fetch(`/api/products/search/?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('Failed fetching search results: ' + res.status + ' ' + text)
  }
  const data = await res.json()
  return {
    products: data.products || [],
    total: data.total || 0
  }
}
