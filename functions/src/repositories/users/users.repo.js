// C:\projects\devplan\functions\src\repositories\users\users.repo.js

const { db } = require('../../config/admin')

async function getUsersByIds(userIds = []) {
  const snaps = await Promise.all(userIds.map((id) => db.doc(`users/${id}`).get()))
  return snaps.filter((snap) => snap.exists)
}

async function getAllUsers() {
  const snap = await db.collection('users').get()
  return snap.docs
}

module.exports = {
  getUsersByIds,
  getAllUsers,
}
