// functions/src/http/firestoreUsage/firestoreOfficialUsage.http.js
const { onRequest } = require('firebase-functions/v2/https')
const { admin } = require('../../config/admin')
const { getUsageAdminEmails } = require('../../config/usageAdminEmails')
const { readFirestoreUsageMetrics } = require('../../services/firestoreUsage/readFirestoreUsageMetrics')

const REGION = 'europe-west1'

async function requireAdmin(req) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) throw Object.assign(new Error('unauthorized'), { status: 401 })

  const decoded = await admin.auth().verifyIdToken(token)
  const allowedEmails = getUsageAdminEmails()
  if (!allowedEmails.size) {
    throw Object.assign(
      new Error('firestore usage admin emails are not configured'),
      { status: 500 }
    )
  }

  const email = String(decoded.email || '').trim().toLowerCase()
  if (!email || !allowedEmails.has(email)) {
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
