// C:\projects\devplan\functions\src\repositories\abilities\abilitiesInvites.repo.js

const { db } = require('../../config/admin')

async function getInviteById(inviteId) {
  return db.collection('abilitiesInvites').doc(inviteId).get()
}

async function getAbilitiesInviteByTokenAdmin(token) {
  const snap = await db
    .collection('abilitiesInvites')
    .where('token', '==', token)
    .where('active', '==', true)
    .limit(1)
    .get()

  if (snap.empty) return null

  const row = snap.docs[0]
  return {
    id: row.id,
    ...row.data(),
  }
}

module.exports = {
  getInviteById,
  getAbilitiesInviteByTokenAdmin,
}
