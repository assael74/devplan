// C:\projects\devplan\functions\src\repositories\narrative\team.repo.js

const { db } = require('../../config/admin')

const TEAMS_COLLECTION = 'dbBirthTeams'

function clean(value) {
  return String(value || '').trim()
}

async function readTeams(documentIds = []) {
  const ids = [...new Set(
    (Array.isArray(documentIds) ? documentIds : [])
      .map(clean)
      .filter(Boolean)
  )]

  if (!ids.length) return []

  const snapshots = await Promise.all(
    ids.map(documentId => db.collection(TEAMS_COLLECTION).doc(documentId).get())
  )

  return snapshots
    .filter(snapshot => snapshot.exists)
    .map(snapshot => ({
      id: snapshot.id,
      ...snapshot.data(),
    }))
}

module.exports = { readTeams }
