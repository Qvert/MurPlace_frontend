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
