// src/features/playersDatabase/services/write/teams/teamSeasonScoutContext.js

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'
import { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { clean } from '../leagues/leagueDoc.js'
import { buildTeamSeasonDocumentData, teamSeasonDocRef } from './teamSeasonDoc.js'
import { buildTeamPlayerSeasonalScoutProjection } from '../shared/playerScoutProjection.js'
import {
  buildCanonicalLeagueTeamScoutContexts,
} from '../shared/leagueTeamScoutContext.js'

const isPlainObject = value => Boolean(
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype
)

const stripTeamScoutContextTechnicalTimestamps = value => {
  const row = value && typeof value === 'object' ? value : {}
  const nextRow = isPlainObject(row) ? { ...row } : row
  if (!isPlainObject(nextRow)) return nextRow

  delete nextRow.updatedAt

  if (Array.isArray(nextRow.teamPlayers)) {
    nextRow.teamPlayers = nextRow.teamPlayers.map(player => {
      if (!isPlainObject(player)) return player
      const nextPlayer = { ...player }
      delete nextPlayer.updatedAt
      return nextPlayer
    })
  }

  if (isPlainObject(nextRow.teamBalance)) {
    nextRow.teamBalance = { ...nextRow.teamBalance }
    if (isPlainObject(nextRow.teamBalance.source)) {
      nextRow.teamBalance.source = { ...nextRow.teamBalance.source }
      delete nextRow.teamBalance.source.updatedAt
    }
  }

  return nextRow
}

const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (!isPlainObject(value)) return value

  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = normalizeComparableValue(value[key])
      return acc
    }, {})
}

const isSameTeamScoutContextRows = (currentRows, nextRows) => (
  JSON.stringify(normalizeComparableValue(
    stripTeamScoutContextTechnicalTimestamps(currentRows)
  )) ===
  JSON.stringify(normalizeComparableValue(
    stripTeamScoutContextTechnicalTimestamps(nextRows)
  ))
)

export const buildCanonicalTeamSeasonScoutContext = ({
  league = {},
  season = {},
  row = {},
  teamPerformance = null,
  scoutPerformance = null,
} = {}) => {
  const performance = scoutPerformance || {}
  const officialPerformance = teamPerformance || {}
  const seasonStatus = clean(season.seasonStatus) === 'completed'
    ? 'completed'
    : 'active'

  return {
    displayName: clean(row.displayName || row.teamName),
    teamName: clean(row.teamName || row.displayName),
    clubId: clean(row.clubId),
    clubLevel: Number(row.clubLevel) || 0,
    clubStrengthLevel: Number(row.clubStrengthLevel || row.clubLevel) || 0,
    birthTeamId: clean(
      row.birthTeamId ||
      row.teamId
    ),
    birthTeamDocumentId: clean(
      row.birthTeamDocumentId ||
      row.teamDocumentId ||
      row.birthTeamId ||
      row.teamId
    ),
    birthTeamSlot: Number(
      row.birthTeamSlot ||
      1
    ),
    teamId: clean(
      row.teamId || row.birthTeamId
    ),
    teamDocumentId: clean(
      row.birthTeamDocumentId ||
      row.teamDocumentId ||
      row.birthTeamId ||
      row.teamId
    ),
    ageGroupId: clean(
      row.ageGroupId || league.ageGroupId
    ),
    ageGroupLabel: clean(
      row.ageGroupLabel || league.ageGroupLabel
    ),
    birthYear: Number(season.birthYear || 0),
    leagueId: clean(
      league.id || league.leagueId || season.leagueId
    ),
    leagueLevel: Number(
      league.level || league.leagueLevel || season.leagueLevel ||
      0
    ),
    expectedLevelDelta: row.expectedLevelDelta === null || row.expectedLevelDelta === undefined
      ? null
      : Number(row.expectedLevelDelta),
    leagueTotalRound: Number(season.leagueTotalRound || 0),
    leagueName: clean(league.leagueName || league.name),
    region: clean(league.region),
    teamUrl: clean(row.teamUrl),
    seasonUrl: clean(season.seasonUrl),
    seasonStatus,
    tableRank: officialPerformance.tableRank ?? null,
    tableAttackRank: officialPerformance.tableAttackRank ?? null,
    tableDefenseRank: officialPerformance.tableDefenseRank ?? null,
    gamesPlayed: Number(officialPerformance.teamGamePlayed) || 0,
    teamGamePlayed: Number(officialPerformance.teamGamePlayed) || 0,
    goalsFor: Number(officialPerformance.goalsFor) || 0,
    goalsAgainst: Number(officialPerformance.goalsAgainst) || 0,
    goalsForPerGame: Number(officialPerformance.goalsForPerGame) || 0,
    performance,
    teamScout: performance,
    offense: performance.offense || {},
    defense: performance.defense || {},
    teamStats: {
      points: Number(row.teamStats?.points || row.points) || 0,
      goalsFor: Number(officialPerformance.goalsFor) || 0,
      goalsAgainst: Number(officialPerformance.goalsAgainst) || 0,
      teamGamePlayed: Number(officialPerformance.teamGamePlayed) || 0,
    },
  }
}

const buildContextPlayer = ({ player = {}, teamContext = {} } = {}) => ({
  ...player,
  playerStats: {
    ...(player.playerStats || {}),
    teamGames: Number(teamContext.teamGamePlayed) || 0,
    teamRank: teamContext.tableRank === null || teamContext.tableRank === undefined
      ? null
      : Number(teamContext.tableRank),
    teamGoalsFor: Number(teamContext.goalsFor) || 0,
    teamGoalsAgainst: Number(teamContext.goalsAgainst) || 0,
    teamAttackPerformance: teamContext.offense || null,
    teamDefensePerformance: teamContext.defense || null,
  },
})

export async function updateTeamSeasonPlayersScoutContext({
  league = {},
  season = {},
  teamContextInput = {},
} = {}) {
  const teamContext = buildCanonicalTeamSeasonScoutContext({
    league,
    season,
    ...teamContextInput,
  })
  const teamId = resolveTeamLookupKey(teamContext)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey || seasonId)

  if (!teamId) {
    return {
      updated: false,
      skipped: true,
      reason: 'missingTeamId',
    }
  }
  if (!seasonId && !seasonKey) throw new Error('Missing season id')

  const ref = teamSeasonDocRef({
    birthTeamDocumentId: teamId,
    seasonKey: seasonKey || seasonId,
  })

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        teamDocumentId: teamId,
        updated: false,
        skipped: true,
        reason: 'teamSeasonMissing',
      }
    }

    const currentSeason = snapshot.data() || {}
    const sourceTarget = clean(currentSeason.seasonStatus || season.seasonStatus) === 'completed'
      ? 'history'
      : 'current'
    const effectiveSeason = {
      ...season,
      ...currentSeason,
      seasonId: clean(currentSeason.seasonId || seasonId),
      seasonKey: clean(currentSeason.seasonKey || seasonKey),
      seasonStatus: clean(currentSeason.seasonStatus || season.seasonStatus) === 'completed'
        ? 'completed'
        : 'active',
      leagueLevel: teamContext.leagueLevel,
      expectedLevelDelta: teamContext.expectedLevelDelta,
      leagueTotalRound: teamContext.leagueTotalRound,
    }
    const currentPlayers = Array.isArray(currentSeason.teamPlayers)
      ? currentSeason.teamPlayers
      : []
    const nextPlayers = currentPlayers.map(player => {
      const contextPlayer = buildContextPlayer({
        player,
        teamContext,
      })
      return {
        ...player,
        ...buildTeamPlayerSeasonalScoutProjection({
        player: contextPlayer,
        team: teamContext,
        season: effectiveSeason,
        }),
      }
    })
    const scoutProfilesSummary = buildScoutProfilesSummary(nextPlayers)
    const updatedAt = new Date().toISOString()
    const nextSeasonWithoutBalance = {
      ...currentSeason,
      leagueId: clean(teamContext.leagueId || currentSeason.leagueId),
      ageGroupId: clean(teamContext.ageGroupId || currentSeason.ageGroupId),
      birthYear: Number(teamContext.birthYear || currentSeason.birthYear || 0),
      leagueTotalRound: Number(
        teamContext.leagueTotalRound ||
        currentSeason.leagueTotalRound ||
        0
      ),
      leagueLevel: Number(teamContext.leagueLevel || currentSeason.leagueLevel || 0),
      expectedLevelDelta: teamContext.expectedLevelDelta,
      seasonStatus: effectiveSeason.seasonStatus,
      teamPlayers: nextPlayers,
      playersCount: nextPlayers.length,
      scoutProfilesSummary,
      teamStats: {
        ...(currentSeason.teamStats || {}),
        ...teamContext.teamStats,
      },
      updatedAt,
    }
    const nextSeason = withTeamBalanceSnapshot({
      seasonDoc: nextSeasonWithoutBalance,
      teamRoot: { ...teamContext, id: teamId, birthTeamDocumentId: teamId },
    })
    const writeSkipped = isSameTeamScoutContextRows(
      currentSeason,
      nextSeason
    )
    const persistedSeason = writeSkipped
      ? currentSeason
      : buildTeamSeasonDocumentData({
        team: { ...teamContext, birthTeamDocumentId: teamId },
        season: effectiveSeason,
        seasonDoc: nextSeason,
        existingData: currentSeason,
      })

    if (!writeSkipped) {
      transaction.set(ref, persistedSeason)
    }

    return {
      teamDocumentId: teamId,
      teamSeasonDocumentId: ref.id,
      seasonId: effectiveSeason.seasonId,
      seasonKey: effectiveSeason.seasonKey,
      target: sourceTarget,
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
      skipped: false,
      players: Array.isArray(persistedSeason?.teamPlayers)
        ? persistedSeason.teamPlayers
        : [],
      playersCount: Array.isArray(persistedSeason?.teamPlayers)
        ? persistedSeason.teamPlayers.length
        : 0,
      scoutProfilesSummary: persistedSeason?.scoutProfilesSummary || {
        total: 0,
        profileCounts: {},
      },
      teamBalance: persistedSeason?.teamBalance || null,
      teamContext,
      seasonDocument: persistedSeason,
    }
  })
}

export async function updateLeagueTeamPlayersScoutContextMany({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) {
  const results = []
  const failures = []
  const { contexts } = buildCanonicalLeagueTeamScoutContexts({
    league,
    season,
    target,
    rows,
  })

  for (const context of contexts) {
    try {
      results.push(await updateTeamSeasonPlayersScoutContext({
        league,
        season,
        teamContextInput: context,
      }))
    } catch (error) {
      failures.push({
        teamDocumentId: clean(
          context.row?.birthTeamDocumentId ||
          context.row?.teamDocumentId ||
          context.row?.birthTeamId ||
          context.row?.teamId
        ),
        message: clean(error?.message) || 'Team context scout recalculation failed',
      })
    }
  }

  return {
    rowsCount: results.filter(result => result.updated).length,
    skippedCount: results.filter(result => result.skipped).length,
    failedCount: failures.length,
    failures,
    results,
  }
}
