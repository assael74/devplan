const { onRequest } = require('firebase-functions/v2/https')
const { admin } = require('../../config/admin')
const { readFirestoreUsageMetrics } = require('../../services/firestoreUsage/readFirestoreUsageMetrics')

const REGION = 'europe-west1'
const DEFAULT_ADMIN_EMAILS = ['assael74@gmail.com']

function getAllowedEmails() {
  const configured = String(process.env.FIRESTORE_USAGE_ADMIN_EMAILS || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)

  return new Set(configured.length ? configured : DEFAULT_ADMIN_EMAILS)
}

async function requireAdmin(req) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) throw Object.assign(new Error('unauthorized'), { status: 401 })

  const decoded = await admin.auth().verifyIdToken(token)
  const email = String(decoded.email || '').trim().toLowerCase()
  if (!email || !getAllowedEmails().has(email)) {
    throw Object.assign(new Error('forbidden'), { status: 403 })
  }

  return decoded
}

const firestoreOfficialUsage = onRequest({ region: REGION, cors: true }, async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'method not allowed' })
    }

    await requireAdmin(req)

    const projectId = process.env.GCLOUD_PROJECT || admin.app().options.projectId
    if (!projectId) {
      return res.status(500).json({ ok: false, error: 'project id unavailable' })
    }

    const usage = await readFirestoreUsageMetrics({ projectId })
    res.set('Cache-Control', 'private, max-age=60')
    return res.status(200).json(usage)
  } catch (error) {
    console.error('firestoreOfficialUsage error', error)
    return res.status(error?.status || 500).json({
      ok: false,
      error: error?.message || 'internal error',
    })
  }
})

module.exports = {
  firestoreOfficialUsage,
}
