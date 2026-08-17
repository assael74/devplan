// C:\projects\devplan\functions\src\repositories\narrative\searchIndex.repo.js

const { db } = require('../../config/admin')

const SEARCH_INDEXES_COLLECTION = 'dbSearchIndexes'

function clean(value) {
  return String(value || '').trim()
}

function buildSeasonKey(value) {
  return clean(value).replace(/[^0-9a-zA-Z]+/g, '_')
}

function resolveSeasonStartYear(value) {
  const match = clean(value).match(/^(\d{2,4})\/(\d{2,4})$/)
  if (!match) return 0

  const year = Number(match[1])
  if (!Number.isFinite(year)) return 0

  return year < 100 ? 2000 + year : year
}

function resolveLatestEntry(player = {}) {
  const entries = [
    ...(Array.isArray(player.history) ? player.history : []),
    ...(Array.isArray(player.current) ? player.current : []),
  ]

  return [...entries]
    .filter(entry => clean(entry.seasonKey || entry.seasonId))
    .sort((left, right) => (
      resolveSeasonStartYear(right.seasonKey || right.seasonId) -
      resolveSeasonStartYear(left.seasonKey || left.seasonId)
    ))[0] || null
}

function buildTeamSeasonIndexId(entry = {}) {
  return [
    'birthTeamSeason',
    clean(entry.leagueId),
    buildSeasonKey(entry.seasonKey || entry.seasonId),
    clean(entry.birthTeamId || entry.teamId || entry.birthTeamDocumentId),
  ].filter(Boolean).join('__')
}

async function readLatestTeamProjection(player = {}) {
  const entry = resolveLatestEntry(player)
  if (!entry) return null

  const documentId = buildTeamSeasonIndexId(entry)
  if (!documentId) return null

  const snapshot = await db.collection(SEARCH_INDEXES_COLLECTION).doc(documentId).get()
  if (!snapshot.exists) return null

  return {
    id: snapshot.id,
    seasonKey: clean(entry.seasonKey || entry.seasonId),
    birthTeamDocumentId: clean(entry.birthTeamDocumentId),
    ...snapshot.data(),
  }
}

module.exports = { readLatestTeamProjection }
