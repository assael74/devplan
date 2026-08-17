// C:\projects\devplan\functions\src\shared\auth\requireAuth.js

const { admin } = require('../../config/admin')

async function requireAuth(req) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    throw Object.assign(new Error('unauthorized'), { status: 401 })
  }

  try {
    return await admin.auth().verifyIdToken(token)
  } catch (error) {
    throw Object.assign(new Error('unauthorized'), { status: 401 })
  }
}

module.exports = { requireAuth }
