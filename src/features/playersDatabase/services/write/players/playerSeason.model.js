// features/playersDatabase/services/write/players/playerSeason.model.js

import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../leagues/leagueDoc.js'
import { pickDefinedValue } from '../../../model/value.model.js'
import {
  normalizePlayerStats,
  normalizePlayerStatsStatus,
} from '../../../model/playerStats.model.js'
import {
  isSamePlayerSource,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
} from './playerDoc.model.js'

export const getTeamSeasonRows = teamDoc => [
  ...(Array.isArray(teamDoc?.current)
    ? teamDoc.current.map(row => ({
        ...row,
        __sourceTarget: 'current',
      }))
    : []),
  ...(Array.isArray(teamDoc?.history)
    ? teamDoc.history.map(row => ({
        ...row,
        __sourceTarget: 'history',
      }))
    : []),
]

export const getPlayerSeasonRowKey = (row = {}) => [
  clean(row.seasonKey || row.seasonId),
  clean(row.birthTeamId || row.teamId),
  clean(row.clubId),
].filter(Boolean).join('__')

export const getPlayerSeasonRowTeamId = (row = {}) =>
  clean(row.birthTeamId || row.teamId)

export const getTargetSeasonRowTeamId = ({
  season = {},
  team = {},
} = {}) =>
  clean(
    team.birthTeamId ||
    team.teamId ||
    season.birthTeamId ||
    season.teamId
  )

export const isSamePlayerSeasonRow = ({
  row = {},
  season = {},
  team = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const rowSeasonId = clean(row.seasonId)
  const rowSeasonKey = clean(row.seasonKey)

  if (
    (seasonKey && rowSeasonKey && rowSeasonKey !== seasonKey) ||
    (seasonId && rowSeasonId && rowSeasonId !== seasonId)
  ) {
    return false
  }

  const targetTeamId = getTargetSeasonRowTeamId({
    season,
    team,
  })
  if (!targetTeamId) return true

  return getPlayerSeasonRowTeamId(row) === targetTeamId
}

export const findPlayerSeasonRowIndex = ({
  rows = [],
  season = {},
  team = {},
} = {}) =>
  (Array.isArray(rows) ? rows : []).findIndex(row => isSamePlayerSeasonRow({
    row,
    season,
    team,
  }))

export const removePlayerSeasonRow = ({
  rows = [],
  season = {},
  team = {},
} = {}) => (
  (Array.isArray(rows) ? rows : []).filter(row => !isSamePlayerSeasonRow({
    row,
    season,
    team,
  }))
)

export const buildPlayerSeasonDoc = ({
  season = {},
  team = {},
  player = {},
} = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const playerStats = normalizePlayerStats(player)
  const clubId = clean(team.clubId)
  const clubName = clean(team.clubName || team.displayName || team.teamName)
  const ageGroupId = clean(season.ageGroupId || team.ageGroupId)
  const ageGroupLabel = clean(
    season.ageGroupLabel ||
    team.ageGroupLabel ||
    season.ageGroupId ||
    team.ageGroupId
  )

  return {
    seasonId,
    seasonKey,
    leagueId: clean(season.leagueId || team.leagueId),
    leagueName: clean(season.leagueName || team.leagueName),
    ageGroupId,
    ageGroupLabel,
    clubId,
    clubName,
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
    numShirt: clean(player.numShirt),
    statsStatus: normalizePlayerStatsStatus(player.statsStatus),
    playerStats: {
      games: playerStats.games,
      goals: playerStats.goals,
      yellowCards: playerStats.yellowCards,
      minutes: playerStats.minutes,
      starts: playerStats.starts,
      substituteIn: playerStats.substituteIn,
      substitutedOut: playerStats.substitutedOut,
      teamMinutes: 0,
      teamGames: toNumberOrZero(pickDefinedValue(team.teamStats?.teamGamePlayed, team.teamGamePlayed)),
      teamRank: toNumberOrZero(team.tableRank),
      teamGoalsFor: toNumberOrZero(pickDefinedValue(team.teamStats?.goalsFor, team.goalsFor)),
      teamGoalsAgainst: toNumberOrZero(pickDefinedValue(team.teamStats?.goalsAgainst, team.goalsAgainst)),
      teamAttackPerformance: null,
      teamDefensePerformance: null,
    },
    scoutProfiles: normalizePlayerScoutProfiles(player),
    scoutCombinations: normalizePlayerScoutCombinations(player),
    updatedAt: new Date().toISOString(),
  }
}

export const buildPlayerSeasonRowsFromTeamDoc = ({
  teamDoc = {},
  season = {},
  team = {},
  player = {},
  target = 'current',
} = {}) => {
  const seasonRows = getTeamSeasonRows(teamDoc)
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
          ...teamDoc,
          ...team,
          ...seasonRow,
        },
        player: {
          ...player,
          ...matchedPlayer,
        },
      }),
      sourceTarget: clean(seasonRow.__sourceTarget) || 'history',
    })
  })

  const fallbackRow = buildPlayerSeasonDoc({
    season,
    team,
    player,
  })

  collectedRows.push({
    row: fallbackRow,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',
  })

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

export const upsertSeasonRows = ({
  rows = [],
  season = {},
  team = {},
  seasonDoc = {},
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const seasonIndex = findPlayerSeasonRowIndex({
    rows: safeRows,
    season,
    team,
  })

  if (seasonIndex === -1) return [...safeRows, seasonDoc]

  return safeRows.map((row, index) => (
    index === seasonIndex
      ? {
        ...row,
        ...seasonDoc,
      }
      : row
  ))
}
