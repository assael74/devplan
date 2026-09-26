import {
  buildPlayersDatabaseJobAction,
} from '../../jobs/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildClubSeasonIdentityIndexDocumentId,
  CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
} from '../../../../catalog/firestoreDocuments/clubSeasonIdentityIndex.catalog.js'
import {
  buildLeagueClubSeasonIdentityEntries,
} from '../../clubs/clubSeasonIdentityIndex.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const numberValue = value => Number.isFinite(Number(value)) ? Number(value) : 0
const pickDefinedValue = (...values) => values.find(value => value !== undefined && value !== null && value !== '')
const roundRate = value => Math.round((numberValue(value) + Number.EPSILON) * 10) / 10
const safeKey = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')

const resolveTeamId = row => clean(
  row?.birthTeamDocumentId || row?.teamDocumentId || row?.birthTeamId || row?.teamId
)

const getStats = row => ({
  gamesPlayed: numberValue(pickDefinedValue(row?.games, row?.teamGamePlayed, row?.teamStats?.teamGamePlayed)),
  goalsFor: numberValue(pickDefinedValue(row?.goalsFor, row?.teamStats?.goalsFor)),
  goalsAgainst: numberValue(pickDefinedValue(row?.goalsAgainst, row?.teamStats?.goalsAgainst)),
  points: numberValue(pickDefinedValue(row?.points, row?.teamStats?.points)),
})

const getTableRank = row => numberValue(pickDefinedValue(row?.position, row?.rank, row?.leaguePosition))

const buildRankMap = ({ rows = [], value, direction }) => {
  const ranks = new Map()
  ;[...(Array.isArray(rows) ? rows : [])]
    .sort((left, right) => {
      const difference = value(left) - value(right)
      if (difference) return direction === 'asc' ? difference : -difference
      return getTableRank(left) - getTableRank(right)
    })
    .forEach((row, index) => {
      const teamId = resolveTeamId(row)
      if (teamId) ranks.set(teamId, index + 1)
    })
  return ranks
}

const buildPerformanceRows = rows => {
  const safeRows = Array.isArray(rows) ? rows : []
  const attackRanks = buildRankMap({ rows: safeRows, value: row => getStats(row).goalsFor, direction: 'desc' })
  const defenseRanks = buildRankMap({ rows: safeRows, value: row => getStats(row).goalsAgainst, direction: 'asc' })

  return safeRows.map(row => {
    const teamId = resolveTeamId(row)
    const stats = getStats(row)
    return {
      teamId,
      performance: {
        tableRank: getTableRank(row),
        tableAttackRank: attackRanks.get(teamId) || 0,
        tableDefenseRank: defenseRanks.get(teamId) || 0,
        teamGamePlayed: stats.gamesPlayed,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalsForPerGame: roundRate(stats.gamesPlayed ? stats.goalsFor / stats.gamesPlayed : 0),
        goalsAgainstPerGame: roundRate(stats.gamesPlayed ? stats.goalsAgainst / stats.gamesPlayed : 0),
        points: stats.points,
      },
    }
  }).filter(item => item.teamId)
}

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
    normalizationStatus: clean(seasonStatus) === 'not_started' ? 'not_started' : canProject ? 'projected' : 'final',
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

export function buildLeagueProjectionActions({ jobId = '', league = {}, season = {}, target = 'current', sourceGeneration = '', tableRank = [] } = {}) {
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const generation = clean(sourceGeneration)
  if (!leagueId || !seasonKey || !generation) throw new Error('Missing League projection action identity')

  const performanceActions = buildPerformanceRows(tableRank).flatMap(({ teamId, performance }, index) => {
    const teamSeasonDocumentId = `${teamId}__${safeKey(seasonKey)}`
    const searchIndexDocumentId = ['birthTeamSeason', leagueId, safeKey(seasonKey), teamId].join('__')
    const teamSeasonPatch = {
      leagueId,
      leagueLevel: numberValue(league.level || season.leagueLevel),
      leagueTotalRound: numberValue(season.leagueTotalRound),
      tableRank: performance.tableRank,
      tableAttackRank: performance.tableAttackRank,
      tableDefenseRank: performance.tableDefenseRank,
      goalsForPerGame: performance.goalsForPerGame,
      goalsAgainstPerGame: performance.goalsAgainstPerGame,
      teamStats: {
        points: performance.points,
        teamGamePlayed: performance.teamGamePlayed,
        goalsFor: performance.goalsFor,
        goalsAgainst: performance.goalsAgainst,
      },
    }
    const searchIndexPatch = {
      ...performance,
      ...buildSearchMetrics({ target, seasonStatus: season.seasonStatus, leagueTotalRound: season.leagueTotalRound, performance }),
    }

    return [
      buildPlayersDatabaseJobAction({
        jobId,
        type: 'leagueTeamSeasonPerformance',
        order: index * 2,
        target: { collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentId: teamSeasonDocumentId },
        sourceGeneration: generation,
        approvedPayload: { patch: teamSeasonPatch },
      }),
      buildPlayersDatabaseJobAction({
        jobId,
        type: 'leagueTeamSearchIndexPerformance',
        order: (index * 2) + 1,
        target: { collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes, documentId: searchIndexDocumentId },
        sourceGeneration: generation,
        approvedPayload: { patch: searchIndexPatch, requiredTeamSeasonDocumentId: teamSeasonDocumentId },
      }),
    ]
  })

  const birthYear = numberValue(season.birthYear)
  const identityDocumentId = buildClubSeasonIdentityIndexDocumentId({
    seasonKey,
    birthYear,
  })

  if (!identityDocumentId) {
    throw new Error('Missing League Club Season Identity scope')
  }

  const identityEntries = buildLeagueClubSeasonIdentityEntries({
    league: {
      ...league,
      id: leagueId,
    },
    season,
    rows: tableRank,
  })

  const identityAction = buildPlayersDatabaseJobAction({
    jobId,
    type: 'leagueClubSeasonIdentity',
    order: performanceActions.length,
    target: {
      collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      documentId: identityDocumentId,
    },
    sourceGeneration: generation,
    approvedPayload: {
      leagueId,
      seasonKey,
      birthYear,
      projectionVersion: CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
      entries: identityEntries,
    },
  })

  return [...performanceActions, identityAction]
}
