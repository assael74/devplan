// C:\projects\devplan\functions\src\repositories\narrative\player.repo.js

const { db } = require('../../config/admin')

const PLAYERS_COLLECTION = 'dbPlayers'

function clean(value) {
  return String(value || '').trim()
}

function buildCandidates(playerId) {
  const safeId = clean(playerId)
  const candidates = [safeId]
  const legacyMatch = safeId.match(/^player__(?:19|20)\d{2}__(\d+)$/)

  if (legacyMatch) {
    candidates.push(`external__${legacyMatch[1]}`)
  }

  return [...new Set(candidates.filter(Boolean))]
}

async function readPlayer(playerId) {
  const candidates = buildCandidates(playerId)

  for (const documentId of candidates) {
    const snapshot = await db.collection(PLAYERS_COLLECTION).doc(documentId).get()
    if (!snapshot.exists) continue

    return {
      id: snapshot.id,
      ...snapshot.data(),
    }
  }

  return null
}

module.exports = { readPlayer }
