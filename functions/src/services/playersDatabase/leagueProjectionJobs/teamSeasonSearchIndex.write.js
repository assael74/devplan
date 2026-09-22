// C:/projects/devplan/functions/src/services/playersDatabase/leagueProjectionJobs/teamSeasonSearchIndex.write.js

const { admin, db } = require('../../../config/admin')
const {
  runForCurrentLeagueProjectionAttempt,
} = require('./leagueProjectionJob.repository')
const {
  buildTeamSeasonDocumentId,
  WRITE_CHUNK_SIZE,
} = require('./teamSeasonPerformance.write')
const {
  buildTeamPerformanceRows,
} = require('./teamPerformance.projection')

const SEARCH_INDEXES_COLLECTION = 'dbSearchIndexes'
const LEAGUES_COLLECTION = 'dbLeagues'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const numberValue = value => Number.isFinite(Number(value)) ? Number(value) : 0
const normalizeSeasonDocumentKey = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')

const resolveCanonicalSeason = ({ league = {}, seasonKey = '', target = 'current' } = {}) => (
  target === 'history'
    ? (Array.isArray(league.history) ? league.history : []).find(season => (
        clean(season?.seasonKey || season?.seasonId) === seasonKey
      )) || null
    : league.current || null
)

const buildTeamSeasonSearchIndexId = ({ leagueId = '', seasonKey = '', teamId = '' } = {}) => (
  ['birthTeamSeason', clean(leagueId), normalizeSeasonDocumentKey(seasonKey), clean(teamId)]
    .filter(Boolean)
    .join('__')
)

const buildSearchMetrics = ({ target = 'current', seasonStatus = '', leagueTotalRound = 0, performance = {} } = {}) => {
  const teamGamePlayed = Math.max(0, numberValue(performance.teamGamePlayed))
  const points = Math.max(0, numberValue(performance.points))
  const goalsFor = Math.max(0, numberValue(performance.goalsFor))
  const goalsAgainst = Math.max(0, numberValue(performance.goalsAgainst))
  const totalGames = Math.max(0, numberValue(leagueTotalRound))
  const remainingTeamGames = Math.max(0, totalGames - teamGamePlayed)
  const active = clean(target) !== 'history' && clean(seasonStatus) !== 'completed'
  const canProject = active && teamGamePlayed > 0 && totalGames > 0 && remainingTeamGames > 0
  const factor = canProject ? Math.max(1, totalGames / teamGamePlayed) : 1

  return {
    seasonStatus: clean(target) === 'history' ? 'completed' : clean(seasonStatus) || 'active',
    normalizationStatus: clean(seasonStatus) === 'not_started'
      ? 'not_started'
      : canProject ? 'projected' : 'final',
    normalizationVersion: 1,
    remainingTeamGames,
    projectedPointsRaw: Math.round(points * factor * 1000) / 1000,
    projectedPoints: Math.round(points * factor),
    projectedGoalsForRaw: Math.round(goalsFor * factor * 1000) / 1000,
    projectedGoalsFor: Math.round(goalsFor * factor),
    projectedGoalsAgainstRaw: Math.round(goalsAgainst * factor * 1000) / 1000,
    projectedGoalsAgainst: Math.round(goalsAgainst * factor),
    projectedTeamGamePlayedRaw: canProject ? totalGames : teamGamePlayed,
    projectedTeamGamePlayed: Math.round(canProject ? totalGames : teamGamePlayed),
  }
}

const buildPatch = ({ source = {}, performance = {} } = {}) => ({
  tableRank: performance.tableRank,
  tableAttackRank: performance.tableAttackRank,
  tableDefenseRank: performance.tableDefenseRank,
  teamGamePlayed: performance.teamGamePlayed,
  goalsFor: performance.goalsFor,
  goalsAgainst: performance.goalsAgainst,
  goalsForPerGame: performance.goalsForPerGame,
  goalsAgainstPerGame: performance.goalsAgainstPerGame,
  points: performance.points,
  ...buildSearchMetrics({
    target: source.target,
    seasonStatus: source?.season?.seasonStatus,
    leagueTotalRound: source?.season?.leagueTotalRound,
    performance,
  }),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
})

async function updateTeamSeasonSearchIndexes({ source = {}, jobId = '', sourceRevision = '', attemptToken = '' } = {}) {
  const leagueId = clean(source?.league?.id || source?.league?.leagueId)
  const seasonKey = clean(source?.season?.seasonKey || source?.season?.seasonId)
  if (!leagueId || !seasonKey) throw new Error('Missing League identity for Team SearchIndex projection')

  const entries = buildTeamPerformanceRows(source?.tableRank)
    .filter(entry => entry.teamId)
    .map(entry => ({
      ...entry,
      teamSeasonRef: db.collection('dbBirthTeamSeasons').doc(
        buildTeamSeasonDocumentId({ teamId: entry.teamId, seasonKey })
      ),
      indexRef: db.collection(SEARCH_INDEXES_COLLECTION).doc(
        buildTeamSeasonSearchIndexId({ leagueId, seasonKey, teamId: entry.teamId })
      ),
    }))
  let updatedCount = 0
  const missingTeamSeasonIds = []
  const missingIndexIds = []

  for (let start = 0; start < entries.length; start += WRITE_CHUNK_SIZE) {
    const chunk = entries.slice(start, start + WRITE_CHUNK_SIZE)
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
              league: canonicalLeague.data() || {}, seasonKey, target: clean(source?.target) || 'current',
            })
          : null
        if (canonicalSeason && clean(canonicalSeason?.sourceRevision) !== clean(sourceRevision)) {
          return { applied: false, reason: 'staleCanonicalSource' }
        }
        const snapshots = await transaction.getAll(...chunk.flatMap(entry => [entry.teamSeasonRef, entry.indexRef]))
        const missingTeams = []
        const missingIndexes = []
        let updated = 0
        chunk.forEach((entry, index) => {
          const teamSeason = snapshots[index * 2]
          const searchIndex = snapshots[(index * 2) + 1]
          if (!teamSeason.exists) {
            missingTeams.push(entry.teamId)
            return
          }
          if (!searchIndex.exists) {
            missingIndexes.push(entry.teamId)
            return
          }
          transaction.update(searchIndex.ref, buildPatch({ source, performance: entry.performance }))
          updated += 1
        })
        return { applied: true, updated, missingTeams, missingIndexes }
      },
    })
    if (!result.applied) return { rowsCount: entries.length, updatedCount, missingTeamSeasonIds, missingIndexIds, stale: true }
    updatedCount += result.updated
    missingTeamSeasonIds.push(...result.missingTeams)
    missingIndexIds.push(...result.missingIndexes)
  }

  return { rowsCount: entries.length, updatedCount, missingTeamSeasonIds, missingIndexIds }
}

module.exports = {
  buildSearchMetrics,
  buildTeamSeasonSearchIndexId,
  updateTeamSeasonSearchIndexes,
}
