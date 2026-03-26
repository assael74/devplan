import { ABILITIES_PUBLIC_INVITES_CONFIG } from './abilitiesInvites.config.js'

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('הבקשה נמשכה יותר מדי זמן'))
    }, ms)

    promise
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch (error) {
    return null
  }
}

async function request(url, options = {}) {
  const response = await withTimeout(
    fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
    ABILITIES_PUBLIC_INVITES_CONFIG.requestTimeoutMs
  )

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `בקשה נכשלה (${response.status})`

    throw new Error(message)
  }

  return data
}

export async function getJson(url, params = {}) {
  const qp = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return
    qp.set(key, String(value))
  })

  const fullUrl = qp.toString() ? `${url}?${qp.toString()}` : url
  return request(fullUrl, { method: 'GET' })
}

export async function postJson(url, body = {}) {
  return request(url, {
    method: 'POST',
    body,
  })
}
