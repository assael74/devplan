// src/features/playersDatabase/services/narrative/narrativeApi.js

import { auth } from '../../../../services/firebase/firebase.js'

export const NARRATIVE_API_ACTION = {
  GENERATE: 'generate',
  REFINE: 'refine',
}

const clean = value => String(value || '').trim()

const resolveEndpoint = () => {
  const configured = clean(process.env.REACT_APP_PLAYER_NARRATIVE_API_URL)
  if (configured) return configured

  const projectId = clean(auth.app?.options?.projectId)
  if (!projectId) return ''

  return `https://europe-west1-${projectId}.cloudfunctions.net/playerNarrative`
}

const readPayload = async response => {
  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error || `Narrative request failed (${response.status})`)
    error.details = payload?.details || null
    throw error
  }

  return payload
}

const requestNarrative = async body => {
  const endpoint = resolveEndpoint()
  if (!endpoint) throw new Error('Narrative backend is not configured')

  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('User authentication is required')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return readPayload(response)
}

const normalizeResult = payload => ({
  draft: payload?.draft || null,
  meta: payload?.meta || null,
  generatedAt: payload?.generatedAt || null,
  source: clean(payload?.source) || 'ai',
  generator: payload?.generator || {},
  refinementAvailable: payload?.refinementAvailable !== false,
})

export const generateNarrative = async ({ playerId } = {}) => {
  const payload = await requestNarrative({
    action: NARRATIVE_API_ACTION.GENERATE,
    playerId: clean(playerId),
  })

  return normalizeResult(payload)
}

export const refineNarrative = async ({ playerId, currentDraft, instruction } = {}) => {
  const payload = await requestNarrative({
    action: NARRATIVE_API_ACTION.REFINE,
    playerId: clean(playerId),
    currentDraft: currentDraft || {},
    instruction: clean(instruction),
  })

  return normalizeResult(payload)
}
