// src/features/playersDatabase/services/write/players/playerSeason.model.js

import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../leagues/leagueDoc.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { pickDefinedValue } from '../../../model/value.model.js'
import {
  normalizePlayerStats,
  normalizePlayerStatsStatus,
} from '../../../model/playerStats.model.js'
import {
  isSamePlayerSource,
  normalizePlayerScoutCombinationIds,
  normalizePlayerScoutProfiles,
  normalizePlayerScoutStory,
  stripPlayerScoutV2SeasonFields,
} from './playerDoc.model.js'
import { isSamePlayerSeasonScope } from '../shared/playerSeasonScope.js'


const resolvePositiveLevel = values => {
  const match = (Array.isArray(values) ? values : [])
    .map(value => Number(value))
    .find(value => Number.isFinite(value) && value > 0)

  return match || 0
}

const resolveSeasonClubLevels = ({ team = {} } = {}) => {
  const clubId = clean(team.clubId)
  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clubId)
  const clubLevel = resolvePositiveLevel([
    team.clubLevel,
    team.club?.clubLevel,
    club?.clubLevel,
  ])
  const clubStrengthLevel = resolvePositiveLevel([
    team.clubStrengthLevel,
    team.club?.clubStrengthLevel,
    club?.clubStrengthLevel,
    clubLevel,
  ])

  return {
    clubLevel,
    clubStrengthLevel: clubStrengthLevel || clubLevel,
  }
}

const resolveSeasonLeagueLevel = ({ season = {}, team = {} } = {}) =>
  resolvePositiveLevel([
    season.leagueLevel,
    season.level,
    team.leagueLevel,
    team.league?.level,
  ])

const resolveSeasonLeagueName = ({ season = {}, team = {} } = {}) => {
  const explicitName = clean(season.leagueName || team.leagueName)
  if (explicitName) return explicitName

  const leagueId = clean(season.leagueId || team.leagueId)
  const league = PLAYERS_DATABASE_LEAGUES_CATALOG.find(
    item => clean(item.id) === leagueId
  )

  return clean(league?.name)
}

const resolveSeasonClubName = ({ team = {} } = {}) => {
  const explicitName = clean(team.clubName)
  if (explicitName) return explicitName

  const clubId = clean(team.clubId)
  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(
    item => clean(item.id) === clubId
  )

  return clean(
    club?.name ||
    club?.displayName ||
    team.displayName ||
    team.teamName
  )
}

const isPlainObject = value => Boolean(
  value &&
  typeof value === 'object' &&
  !Array.isArray(value)
)


const buildLineClassificationProjection = player => {
  const source = player?.lineClassification && typeof player.lineClassification === 'object'
    ? player.lineClassification
    : null
  const line = clean(source?.line)

  if (!line) return null

  return {
    line,
    position: clean(source.position) || null,
    source: clean(source.source),
    evidenceLevel: clean(source.evidenceLevel),
    modelVersion: clean(source.modelVersion),
  }
}

const buildTeamPlayerScoutHydration = player => {
  const source = player && typeof player === 'object' ? player : {}
  const primaryProfileId = clean(source.primaryScoutProfileId)
  const primaryDepthPct = Number(source.primaryScoutProfileStrengthDepthPct)
  const hasPrimaryDepth = Number.isFinite(primaryDepthPct)

  return {
    scoutProfiles: Array.isArray(source.scoutProfiles) && source.scoutProfiles.length
      ? source.scoutProfiles
      : primaryProfileId
        ? [{
            profileId: primaryProfileId,
            strength: {
              depthPct: hasPrimaryDepth ? primaryDepthPct : null,
              baseDepthPct: null,
              contextAdjustmentPct: null,
            },
            confidence: null,
            reasons: [],
          }]
        : [],
    scoutCombinationIds: Array.isArray(source.scoutCombinationIds)
      ? source.scoutCombinationIds
      : [],
    scoutOpportunity: source.scoutOpportunity &&
      typeof source.scoutOpportunity === 'object'
      ? source.scoutOpportunity
      : clean(source.scoutEffectiveImmediacyStatus)
        ? {
            effectiveActionStatus: clean(source.scoutEffectiveImmediacyStatus),
            exposureLevel: '',
            netScore: null,
            reasons: [],
          }
        : null,
    scoutPlayerInterest: source.scoutPlayerInterest &&
      typeof source.scoutPlayerInterest === 'object'
      ? source.scoutPlayerInterest
      : clean(source.scoutPlayerInterestLevel)
        ? {
            interestLevel: clean(source.scoutPlayerInterestLevel),
            reasons: [],
            limitingFactors: [],
          }
        : null,
    scoutEngineVersion: clean(source.scoutEngineVersion),
  }
}

const buildTeamPerformanceSnapshot = ({
  team = {},
  performanceField = '',
  fallbackField = '',
  tableRankField = '',
} = {}) => {
  const performance = pickDefinedValue(
    team[performanceField],
    team[fallbackField],
    team.performance?.[fallbackField],
    null,
  )

  if (!isPlainObject(performance)) return performance || null

  const rank = pickDefinedValue(team[tableRankField], performance.rank)
  if (rank === undefined || rank === null || rank === '') return performance

  return {
    ...performance,
    rank: Number.isFinite(Number(rank)) ? Number(rank) : performance.rank,
  }
}

export const getTeamSeasonDocumentRow = teamSeasonDocument => {
  if (!teamSeasonDocument?.seasonId && !teamSeasonDocument?.seasonKey) return null

  return {
    ...teamSeasonDocument,
    __sourceTarget: clean(teamSeasonDocument.seasonStatus) === 'completed'
      ? 'history'
      : 'current',
  }
}

export const getPlayerSeasonRowKey = (row = {}) => [
  clean(row.seasonKey || row.seasonId),
  clean(row.birthTeamId || row.teamId),
  clean(row.clubId),
].filter(Boolean).join('__')

export const getPlayerSeasonRowTeamId = (row = {}) =>
  clean(row.birthTeamId || row.teamId)

export const getTargetSeasonRowTeamId = ({ season = {}, team = {} } = {}) =>
  clean(
    team.birthTeamId ||
    team.teamId ||
    season.birthTeamId ||
    season.teamId
  )

export const isSamePlayerSeasonRow = ({ row = {}, season = {}, team = {} } = {}) => {
  return isSamePlayerSeasonScope(row, {
    ...season,
    ...team,
  })
}

export const findPlayerSeasonRowIndex = ({ rows = [], season = {}, team = {} } = {}) =>
  (Array.isArray(rows) ? rows : []).findIndex(row => isSamePlayerSeasonRow({
    row,
    season,
    team,
  }))

export const removePlayerSeasonRow = ({ rows = [], season = {}, team = {} } = {}) => (
  (Array.isArray(rows) ? rows : []).filter(row => !isSamePlayerSeasonRow({
    row,
    season,
    team,
  }))
)

// Canonical persistence projection for Player Document current/history rows.
// Team Season is consulted as input only; its roster/balance/summaries never
// cross this boundary into Player persistence.
export const buildPlayerSeasonCompactProjection = ({ season = {}, team = {}, player = {} } = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const playerStats = normalizePlayerStats(player)
  const seasonStatus = clean(season.seasonStatus) === 'completed'
    ? 'completed'
    : 'active'
  const clubId = clean(team.clubId)
  const { clubLevel, clubStrengthLevel } = resolveSeasonClubLevels({ team })
  const leagueLevel = resolveSeasonLeagueLevel({ season, team })
  const clubName = resolveSeasonClubName({ team })
  const leagueName = resolveSeasonLeagueName({ season, team })
  const ageGroupId = clean(season.ageGroupId || team.ageGroupId)
  const ageGroupLabel = clean(
    season.ageGroupLabel ||
    team.ageGroupLabel ||
    season.ageGroupId ||
    team.ageGroupId
  )
  const teamAttackPerformance = buildTeamPerformanceSnapshot({
    team,
    performanceField: 'teamAttackPerformance',
    fallbackField: 'offense',
    tableRankField: 'tableAttackRank',
  })
  const teamDefensePerformance = buildTeamPerformanceSnapshot({
    team,
    performanceField: 'teamDefensePerformance',
    fallbackField: 'defense',
    tableRankField: 'tableDefenseRank',
  })

  return {
    seasonId,
    seasonKey,
    seasonStatus,
    leagueId: clean(season.leagueId || team.leagueId),
    leagueName,
    ageGroupId,
    ageGroupLabel,
    clubId,
    clubName,
    clubLevel,
    clubStrengthLevel,
    leagueLevel,
    expectedLevelDelta: season.expectedLevelDelta !== null
      && season.expectedLevelDelta !== undefined
      && Number.isFinite(Number(season.expectedLevelDelta))
      ? Number(season.expectedLevelDelta)
      : team.expectedLevelDelta !== null
        && team.expectedLevelDelta !== undefined
        && Number.isFinite(Number(team.expectedLevelDelta))
        ? Number(team.expectedLevelDelta)
        : null,
    teamName: clubName,
    birthTeamId: clean(team.birthTeamId || team.teamId),
    birthTeamDocumentId: clean(
      team.birthTeamDocumentId ||
      team.teamDocumentId ||
      team.birthTeamId ||
      team.teamId
    ),
    birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
    teamId: clean(team.birthTeamId || team.teamId),
    birthYear: toNumberOrZero(
      season.birthYear ||
      team.birthYear ||
      player.birthYear
    ) || null,
    playerUrl: clean(player.playerUrl),
    notes: clean(player.notes),
    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    lineClassification: buildLineClassificationProjection(player),
    numShirt: clean(player.numShirt),
    rosterStatus: clean(player.rosterStatus) || 'regular',
    manualTransferDirection: clean(player.manualTransferDirection),
    isYoungerAgeGroup: Boolean(
      player.isYoungerAgeGroup ||
      clean(player.rosterStatus) === 'youngerAgeGroup'
    ),
    statsStatus: normalizePlayerStatsStatus(player.statsStatus),
    playerStats: {
      games: playerStats.games,
      goals: playerStats.goals,
      yellowCards: playerStats.yellowCards,
      minutes: playerStats.minutes,
      starts: playerStats.starts,
      substituteIn: playerStats.substituteIn,
      substitutedOut: playerStats.substitutedOut,
      teamMinutes: playerStats.teamMinutes,
      teamGames: toNumberOrZero(pickDefinedValue(team.teamStats?.teamGamePlayed, team.teamGamePlayed)),
      teamRank: toNumberOrZero(team.tableRank),
      teamGoalsFor: toNumberOrZero(pickDefinedValue(team.teamStats?.goalsFor, team.goalsFor)),
      teamGoalsAgainst: toNumberOrZero(pickDefinedValue(team.teamStats?.goalsAgainst, team.goalsAgainst)),
      teamAttackPerformance,
      teamDefensePerformance,
    },
    scoutProfiles: normalizePlayerScoutProfiles(player),
    scoutCombinationIds: normalizePlayerScoutCombinationIds(player),
    ...normalizePlayerScoutStory(player),
    updatedAt: new Date().toISOString(),
  }
}

export const buildPlayerSeasonDoc = buildPlayerSeasonCompactProjection

export const buildPlayerSeasonRowsFromTeamSeasonDocument = ({
  teamSeasonDocument = {},
  season = {},
  team = {},
  player = {},
} = {}) => {
  const teamSeasonRow = getTeamSeasonDocumentRow(teamSeasonDocument)
  const seasonRows = teamSeasonRow ? [teamSeasonRow] : []
  const collectedRows = []

  seasonRows.forEach(seasonRow => {
    const teamPlayers = Array.isArray(seasonRow.teamPlayers)
      ? seasonRow.teamPlayers
      : []
    const matchedPlayer = teamPlayers.find(nextPlayer =>
      isSamePlayerSource(nextPlayer, player)
    )

    if (!matchedPlayer) return

    collectedRows.push({
      row: buildPlayerSeasonDoc({
        season: {
          ...season,
          ...seasonRow,
          seasonId: clean(seasonRow.seasonId || season.seasonId),
          seasonKey: clean(seasonRow.seasonKey || season.seasonKey),
        },
        team: {
          ...team,
          ...seasonRow,
        },
        player: {
          ...player,
          ...matchedPlayer,
          ...buildTeamPlayerScoutHydration(matchedPlayer),
          playerStats: matchedPlayer.playerStats || {},
          scoutSignals: Array.isArray(matchedPlayer.scoutSignals)
            ? matchedPlayer.scoutSignals
            : [],
          scoutCombinations: Array.isArray(matchedPlayer.scoutCombinations)
            ? matchedPlayer.scoutCombinations
            : [],
        },
      }),
      sourceTarget: clean(seasonRow.__sourceTarget) || 'current',
    })
  })

  const fallbackRow = buildPlayerSeasonDoc({
    season,
    team,
    player,
  })

  const fallbackKey = getPlayerSeasonRowKey(fallbackRow)
  const hasHydratedFallbackRow = fallbackKey && collectedRows.some(({ row }) => (
    getPlayerSeasonRowKey(row) === fallbackKey
  ))

  if (!hasHydratedFallbackRow) {
    collectedRows.push({
      row: fallbackRow,
      sourceTarget: clean(season.seasonStatus) === 'completed' ? 'history' : 'current',
    })
  }

  const rowsByKey = new Map()

  collectedRows.forEach(({ row, sourceTarget }) => {
    const key = getPlayerSeasonRowKey(row)
    if (!key) return

    rowsByKey.set(key, {
      ...row,
      sourceTarget,
    })
  })

  const rows = [...rowsByKey.values()]

  return {
    current: rows
      .filter(row => row.sourceTarget !== 'history')
      .map(({ sourceTarget, ...row }) => row),
    history: rows
      .filter(row => row.sourceTarget === 'history')
      .map(({ sourceTarget, ...row }) => row),
  }
}

export const upsertSeasonRows = ({ rows = [], season = {}, team = {}, seasonDoc = {} } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const seasonIndex = findPlayerSeasonRowIndex({
    rows: safeRows,
    season,
    team,
  })

  if (seasonIndex === -1) return [
    ...safeRows,
    stripPlayerScoutV2SeasonFields(seasonDoc),
  ]

  return safeRows.map((row, index) => (
    index === seasonIndex
      ? stripPlayerScoutV2SeasonFields(seasonDoc)
      : row
  ))
}
