const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data.detail) detail = data.detail
    } catch {
      /* ignore body parse errors */
    }
    throw new Error(detail)
  }

  return res.json()
}

export function checkHealth() {
  return request('/health')
}

export function startResearch(question) {
  return request('/api/research', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
}

export function fetchHistory() {
  return request('/api/research/history')
}

export function fetchResearch(id) {
  return request(`/api/research/${id}`)
}

export function deleteResearch(id) {
  return request(`/api/research/${id}`, {
    method: 'DELETE',
  })
}

export function clearHistory() {
  return request('/api/research/history', {
    method: 'DELETE',
  })
}
