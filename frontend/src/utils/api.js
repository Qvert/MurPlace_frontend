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

export async function fetchProductsByCategory(category, page = 1, subcategory = '') {
  // Используем URLSearchParams для удобного формирования строки запроса
  const params = new URLSearchParams();

  if (category) {
    params.append('category', category);
  }
  if (subcategory) {
    params.append('subcategory', subcategory);
  }
  params.append('page', page); // Добавляем номер страницы

  // Итоговый URL будет выглядеть как: /api/products/?category=cats&page=1
  const res = await fetch(`/api/products/?${params.toString()}`)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('Failed fetching products: ' + res.status + ' ' + text)
  }

  const data = await res.json()

  /**
   * ВАЖНО:
   * Если Django настроен на пагинацию, он вернет объект типа:
   * { count: 100, next: "...", results: [...] }
   * Нам нужно вернуть весь этот объект, чтобы в компоненте достать 'count'.
   */
  return data;
}

export async function fetchProductsBySearch(query, offset = 0, limit = 20) {
  const url = `/api/products/search/?q=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Search failed: ' + text);
  }

  return await res.json();
}

export async function fetchPopularItems() {
  // Dedicated endpoint for home popular items.
  // Keep compatibility with older backends by falling back to /api/products/.
  let res
  try {
    res = await fetch('/api/products/popular/')
  } catch (err) {
    // ignore and fallback below
  }

  if (!res || !res.ok) {
    res = await fetch('/api/products/')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('Failed fetching popular items: ' + res.status + ' ' + text)
  }

  const data = await res.json()

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.products)) return data.products
  if (Array.isArray(data?.results)) return data.results
  return []
}
