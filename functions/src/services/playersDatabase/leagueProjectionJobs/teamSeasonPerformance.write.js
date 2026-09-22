// C:/projects/devplan/functions/src/services/playersDatabase/leagueProjectionJobs/teamSeasonPerformance.write.js

const { admin, db } = require('../../../config/admin')
const {
  buildTeamPerformanceRows,
} = require('./teamPerformance.projection')
const {
  runForCurrentLeagueProjectionAttempt,
} = require('./leagueProjectionJob.repository')

const TEAM_SEASONS_COLLECTION = 'dbBirthTeamSeasons'
const LEAGUES_COLLECTION = 'dbLeagues'
const WRITE_CHUNK_SIZE = 200

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const normalizeSeasonDocumentKey = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')

const buildTeamSeasonDocumentId = ({ teamId = '', seasonKey = '' } = {}) => {
  const safeTeamId = clean(teamId)
  const safeSeasonKey = normalizeSeasonDocumentKey(seasonKey)
  return safeTeamId && safeSeasonKey ? `${safeTeamId}__${safeSeasonKey}` : ''
}

const buildPatch = ({ existing = {}, source = {}, performance = {} } = {}) => ({
  leagueId: clean(source?.league?.id || source?.league?.leagueId || existing.leagueId),
  leagueLevel: Number(source?.league?.level || source?.season?.leagueLevel || existing.leagueLevel || 0),
  leagueTotalRound: Number(source?.season?.leagueTotalRound || existing.leagueTotalRound || 0),
  tableRank: performance.tableRank,
  tableAttackRank: performance.tableAttackRank,
  tableDefenseRank: performance.tableDefenseRank,
  goalsForPerGame: performance.goalsForPerGame,
  goalsAgainstPerGame: performance.goalsAgainstPerGame,
  teamStats: {
    ...(existing.teamStats || {}),
    points: performance.points,
    teamGamePlayed: performance.teamGamePlayed,
    goalsFor: performance.goalsFor,
    goalsAgainst: performance.goalsAgainst,
  },
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
})

const resolveCanonicalSeason = ({ league = {}, seasonKey = '', target = 'current' } = {}) => {
  if (target === 'history') {
    return (Array.isArray(league.history) ? league.history : []).find(season => (
      clean(season?.seasonKey || season?.seasonId) === seasonKey
    )) || null
  }
  return league.current || null
}

async function updateTeamSeasonLeaguePerformance({
  source = {},
  jobId = '',
  sourceRevision = '',
  attemptToken = '',
} = {}) {
  const seasonKey = clean(source?.season?.seasonKey || source?.season?.seasonId)
  const rows = buildTeamPerformanceRows(source?.tableRank)
    .filter(entry => entry.teamId)
  if (!seasonKey) throw new Error('Missing season key for Team Season projection')

  const references = rows.map(entry => (
    db.collection(TEAM_SEASONS_COLLECTION).doc(
      buildTeamSeasonDocumentId({ teamId: entry.teamId, seasonKey })
    )
  ))
  const missingTeamSeasonIds = []
  let updatedCount = 0

  for (let start = 0; start < references.length; start += WRITE_CHUNK_SIZE) {
    const referenceChunk = references.slice(start, start + WRITE_CHUNK_SIZE)
    const rowChunk = rows.slice(start, start + WRITE_CHUNK_SIZE)
    const result = await runForCurrentLeagueProjectionAttempt({
      jobId,
      sourceRevision,
      attemptToken,
      callback: async ({ transaction }) => {
        const leagueId = clean(source?.league?.id || source?.league?.leagueId)
        const canonicalLeague = leagueId
          ? await transaction.get(db.collection(LEAGUES_COLLECTION).doc(leagueId))
          : null
        const canonicalSeason = canonicalLeague?.exists
          ? resolveCanonicalSeason({
              league: canonicalLeague.data() || {},
              seasonKey,
              target: clean(source?.target) || 'current',
            })
          : null
        const canonicalSourceRevision = clean(canonicalSeason?.sourceRevision)
        if (canonicalSourceRevision && canonicalSourceRevision !== clean(sourceRevision)) {
          return { applied: false, reason: 'staleCanonicalSource' }
        }
        const snapshots = await transaction.getAll(...referenceChunk)
        const missing = []
        let updated = 0

        snapshots.forEach((snapshot, index) => {
          const entry = rowChunk[index]
          if (!snapshot.exists) {
            missing.push(entry.teamId)
            return
          }
          transaction.update(snapshot.ref, buildPatch({
            existing: snapshot.data() || {},
            source,
            performance: entry.performance,
          }))
          updated += 1
        })
        return { applied: true, updated, missing }
      },
    })
    if (!result.applied) {
      return {
        rowsCount: rows.length,
        updatedCount,
        missingTeamSeasonIds,
        stale: true,
      }
    }
    updatedCount += result.updated
    missingTeamSeasonIds.push(...result.missing)
  }

  return {
    rowsCount: rows.length,
    updatedCount,
    missingTeamSeasonIds,
  }
}

module.exports = {
  buildTeamSeasonDocumentId,
  WRITE_CHUNK_SIZE,
  updateTeamSeasonLeaguePerformance,
}
