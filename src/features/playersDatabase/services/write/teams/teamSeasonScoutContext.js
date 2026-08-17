// src/features/playersDatabase/services/write/teams/teamSeasonScoutContext.js

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { adaptTeamSearchIndexDocument } from '../../../domain/index.js'
import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'
import { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'
import { isSameSeason } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  buildTeamBaseDoc,
  teamDocRef,
} from './teamDoc.js'
import { normalizeTeamPlayer } from './teamSeason.model.js'

const buildTeamScoutContext = ({ teamIndexDocument = {}, season = {} } = {}) => {
  const domainTeam = adaptTeamSearchIndexDocument(teamIndexDocument)
  const performance = domainTeam.performance || {}
  const actualStats = domainTeam.stats?.actual || {}
  const seasonStatus = clean(season.seasonStatus) === 'completed' ||
    domainTeam.lifecycle?.isFinal === true
    ? 'completed'
    : 'active'

  return {
    ...teamIndexDocument,
    clubId: clean(domainTeam.identity?.clubId || teamIndexDocument.clubId),
    clubLevel: teamIndexDocument.clubLevel,
    clubStrengthLevel: teamIndexDocument.clubStrengthLevel,
    birthTeamId: clean(
      domainTeam.identity?.teamId ||
      teamIndexDocument.birthTeamId ||
      teamIndexDocument.teamId
    ),
    birthTeamDocumentId: clean(
      domainTeam.identity?.teamDocumentId ||
      teamIndexDocument.birthTeamDocumentId ||
      teamIndexDocument.teamDocumentId
    ),
    birthTeamSlot: Number(
      domainTeam.identity?.teamSlot ||
      teamIndexDocument.birthTeamSlot ||
      1
    ),
    teamId: clean(
      domainTeam.identity?.teamId ||
      teamIndexDocument.teamId
    ),
    teamDocumentId: clean(
      domainTeam.identity?.teamDocumentId ||
      teamIndexDocument.teamDocumentId
    ),
    ageGroupId: clean(
      domainTeam.league?.ageGroupId ||
      teamIndexDocument.ageGroupId
    ),
    ageGroupLabel: clean(
      domainTeam.league?.ageGroupLabel ||
      teamIndexDocument.ageGroupLabel
    ),
    birthYear: Number(
      domainTeam.season?.birthYear ||
      teamIndexDocument.birthYear ||
      season.birthYear ||
      0
    ),
    leagueId: clean(
      domainTeam.league?.leagueId ||
      teamIndexDocument.leagueId
    ),
    leagueLevel: Number(
      domainTeam.league?.leagueLevel ||
      teamIndexDocument.leagueLevel ||
      0
    ),
    expectedLevelDelta: domainTeam.expectedLeagueLevelChange?.expectedLevelDelta === null
      || domainTeam.expectedLeagueLevelChange?.expectedLevelDelta === undefined
      ? teamIndexDocument.expectedLevelDelta === null
        || teamIndexDocument.expectedLevelDelta === undefined
        ? null
        : Number(teamIndexDocument.expectedLevelDelta)
      : Number(domainTeam.expectedLeagueLevelChange.expectedLevelDelta),
    leagueTotalRound: Number(
      domainTeam.league?.leagueGames ||
      teamIndexDocument.leagueTotalRound ||
      season.leagueTotalRound ||
      0
    ),
    seasonStatus,
    tableRank: domainTeam.ranking?.tableRank,
    tableAttackRank: domainTeam.ranking?.attackRank,
    tableDefenseRank: domainTeam.ranking?.defenseRank,
    gamesPlayed: Number(actualStats.gamesPlayed) || 0,
    teamGamePlayed: Number(actualStats.gamesPlayed) || 0,
    goalsFor: Number(actualStats.goalsFor) || 0,
    goalsAgainst: Number(actualStats.goalsAgainst) || 0,
    goalsForPerGame: Number(actualStats.goalsForPerGame) || 0,
    performance,
    teamScout: performance,
    offense: performance.offense || {},
    defense: performance.defense || {},
    teamStats: {
      points: Number(actualStats.points) || 0,
      goalsFor: Number(actualStats.goalsFor) || 0,
      goalsAgainst: Number(actualStats.goalsAgainst) || 0,
      teamGamePlayed: Number(actualStats.gamesPlayed) || 0,
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

export async function updateTeamSeasonPlayersScoutContext({ season = {}, target = 'current', teamIndexDocument = {} } = {}) {
  const teamContext = buildTeamScoutContext({
    teamIndexDocument,
    season,
  })
  const teamId = resolveTeamLookupKey(teamContext)
  const seasonId = clean(season.seasonId || teamIndexDocument.seasonId)
  const seasonKey = clean(season.seasonKey || teamIndexDocument.seasonKey)

  if (!teamId) {
    return {
      updated: false,
      skipped: true,
      reason: 'missingTeamId',
    }
  }
  if (!seasonId && !seasonKey) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'

    if (!snapshot.exists()) {
      return {
        teamDocumentId: teamId,
        updated: false,
        skipped: true,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({
      ...teamContext,
      teamDocumentId: teamId,
    }, currentData)
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    const seasonIndex = rows.findIndex(row => isSameSeason(row, {
      seasonId,
      seasonKey,
    }))

    if (seasonIndex === -1) {
      return {
        teamDocumentId: teamId,
        updated: false,
        skipped: true,
        reason: 'teamSeasonMissing',
      }
    }

    const currentSeason = rows[seasonIndex] || {}
    const effectiveSeason = {
      ...season,
      ...currentSeason,
      seasonId: clean(currentSeason.seasonId || seasonId),
      seasonKey: clean(currentSeason.seasonKey || seasonKey),
      seasonStatus: clean(currentSeason.seasonStatus) === 'completed' || isHistory
        ? 'completed'
        : teamContext.seasonStatus,
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
      const calculatedPlayer = buildPlayerScoutState({
        player: contextPlayer,
        team: teamContext,
        season: effectiveSeason,
        perspective: 'players_database_team_context_update',
      })

      return normalizeTeamPlayer(calculatedPlayer, effectiveSeason)
    })
    const scoutProfilesSummary = buildScoutProfilesSummary(nextPlayers)
    const updatedAt = new Date().toISOString()
    const nextSeason = {
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
      scoutProfiledPlayersCount: scoutProfilesSummary.total,
      scoutProfilesSummary,
      teamStats: {
        ...(currentSeason.teamStats || {}),
        ...teamContext.teamStats,
      },
      updatedAt,
    }
    const nextRows = rows.map((row, index) => (
      index === seasonIndex ? nextSeason : row
    ))
    const nextTeamDocument = {
      ...baseDoc,
      [fieldKey]: nextRows,
      updatedAt,
    }

    transaction.set(
      ref,
      {
        [fieldKey]: nextRows,
        updatedAt,
      },
      { merge: true }
    )

    return {
      teamDocumentId: teamId,
      seasonId: effectiveSeason.seasonId,
      seasonKey: effectiveSeason.seasonKey,
      target: fieldKey,
      updated: true,
      skipped: false,
      players: nextPlayers,
      playersCount: nextPlayers.length,
      scoutProfilesSummary,
      teamContext,
      teamDocument: nextTeamDocument,
    }
  })
}

export async function updateLeagueTeamPlayersScoutContextMany({ season = {}, target = 'current', teamIndexDocuments = [] } = {}) {
  const results = []
  const failures = []

  for (const teamIndexDocument of Array.isArray(teamIndexDocuments) ? teamIndexDocuments : []) {
    try {
      results.push(await updateTeamSeasonPlayersScoutContext({
        season,
        target,
        teamIndexDocument,
      }))
    } catch (error) {
      failures.push({
        teamDocumentId: clean(
          teamIndexDocument.birthTeamDocumentId ||
          teamIndexDocument.teamDocumentId ||
          teamIndexDocument.birthTeamId ||
          teamIndexDocument.teamId
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
