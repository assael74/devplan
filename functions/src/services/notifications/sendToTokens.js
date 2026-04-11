// functions\src\services\notifications\sendToTokens.js

const { admin, db } = require('../../config/admin')
const { getAllUsers } = require('../../repositories/users/users.repo')

async function sendToTokens(tokens, title, body, data = {}) {
  if (!tokens.length) return { sent: 0 }

  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
  })

  const bad = []
  res.responses.forEach((r, i) => {
    const code = String(r.error?.code || '')
    if (code.includes('registration-token-not-registered')) {
      bad.push(tokens[i])
    }
  })

  if (bad.length) {
    const all = await getAllUsers()
    const batch = db.batch()

    all.forEach((docSnap) => {
      const arr = docSnap.data()?.fcmTokens || []
      const filtered = arr.filter((t) => !bad.includes(t))
      if (filtered.length !== arr.length) {
        batch.update(docSnap.ref, { fcmTokens: filtered })
      }
    })

    await batch.commit()
  }

  return { sent: res.successCount }
}

module.exports = { sendToTokens }
