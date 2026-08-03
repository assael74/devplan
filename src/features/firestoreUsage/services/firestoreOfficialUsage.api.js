import { auth } from '../../../services/firebase/firebase.js'

const resolveEndpoint = () => {
  const configured = String(process.env.REACT_APP_FIRESTORE_USAGE_API_URL || '').trim()
  if (configured) return configured

  const projectId = String(auth.app?.options?.projectId || '').trim()
  if (!projectId) return ''

  return `https://europe-west1-${projectId}.cloudfunctions.net/firestoreOfficialUsage`
}

export async function readOfficialFirestoreUsage() {
  const endpoint = resolveEndpoint()

  if (!endpoint) {
    return {
      status: 'not-configured',
      data: null,
    }
  }

  const token = await auth.currentUser?.getIdToken()

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || `Official Firestore usage request failed (${response.status})`)
  }

  const payload = await response.json()

  return {
    status: 'connected',
    data: payload,
  }
}
