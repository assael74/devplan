// functions\src\services\notifications\getTokensByUserIds.js

const { getUsersByIds } = require('../../repositories/users/users.repo')

async function getTokensByUserIds(userIds = []) {
  const snaps = await getUsersByIds(userIds)
  return snaps.flatMap((snap) => snap.data()?.fcmTokens || [])
}

module.exports = { getTokensByUserIds }
