// C:\projects\devplan\functions\src\http\narrative\playerNarrative.http.js

const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { requireAuth } = require('../../shared/auth/requireAuth')
const { generate } = require('../../services/narrative/generate')
const { refine } = require('../../services/narrative/refine')

const REGION = 'europe-west1'
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

function clean(value) {
  return String(value || '').trim()
}

async function runAction(body = {}) {
  const action = clean(body.action)
  const playerId = clean(body.playerId)

  if (!playerId) {
    throw Object.assign(new Error('playerId is required'), { status: 400 })
  }

  if (action === 'generate') {
    return generate({ playerId })
  }

  if (action === 'refine') {
    return refine({
      playerId,
      currentDraft: body.currentDraft || {},
      instruction: body.instruction,
    })
  }

  throw Object.assign(new Error('unsupported action'), { status: 400 })
}

const playerNarrative = onRequest({
  region: REGION,
  cors: true,
  secrets: [OPENAI_API_KEY],
  timeoutSeconds: 120,
}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'method not allowed' })
    }

    await requireAuth(req)
    const result = await runAction(req.body || {})

    return res.status(200).json({
      ok: true,
      ...result,
    })
  } catch (error) {
    console.error('playerNarrative error', error)

    return res.status(error.status || 500).json({
      ok: false,
      error: error.message || 'internal error',
      details: error.details || null,
    })
  }
})

module.exports = { playerNarrative }
