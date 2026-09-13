// src/features/playersDatabase/services/write/leagues/leagueTableRankTeamSync.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  buildSeasonKey,
  clean,
  leagueDocRef,
  toNumberOrZero,
} from './leagueDoc.js'
import { updateHistorySeason } from './leagueSeason.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.sync.js'
import { isSameSeason } from '../../../model/shared/season.model.js'
import { normalizeTeamIdentity } from '../../../model/team/teamIdentity.model.js'
import {
  areScoutProfilesSummariesEqual,
  areTeamTaskSignalsEqual,
  normalizeScoutProfilesSummary,
  normalizeTeamTaskSignals,
} from '../../../domain/projections/teamScoutSummary.projection.js'

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const updateTableRankRowTeamUrl = ({ tableRank = [], team = {} } = {}) => {
  const teamId = normalizeTeamIdentity({ team }).birthTeamId
  const clubId = clean(team.clubId)
  const teamUrl = clean(team.teamUrl)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = normalizeTeamIdentity({ team: row }).birthTeamId
    const rowClubId = clean(row.clubId)
    const sameTeam = teamId && rowTeamId === teamId
    const sameClubFallback = !teamId && clubId && rowClubId === clubId

    if (!sameTeam && !sameClubFallback) return row

    return {
      ...row,
      teamUrl: teamUrl || clean(row.teamUrl),
      ...(Number.isFinite(Number(team.playersCount))
        ? { playersCount: Number(team.playersCount) }
        : {}),
      ...(hasOwn(team, 'hasPlayers')
        ? { hasPlayers: Boolean(team.hasPlayers) }
        : {}),
      ...(hasOwn(team, 'hasStats')
        ? { hasStats: Boolean(team.hasStats) }
        : {}),
      ...(hasOwn(team, 'statsComplete')
        ? { statsComplete: Boolean(team.statsComplete) }
        : {}),
      updatedAt: new Date().toISOString(),
    }
  })
}

const hasFiniteNumberValue = value => clean(value) !== '' && Number.isFinite(Number(value))

const sumTableRankPlayersCount = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).reduce(
    (total, row) => total + toNumberOrZero(row?.playersCount),
    0
  )

const hasTableRankPlayersCount = tableRank =>
  (Array.isArray(tableRank) ? tableRank : []).some(row =>
    hasFiniteNumberValue(row?.playersCount)
  )

const updateHistorySeasonTableRankTeamUrl = ({ history = [], season = {}, team = {} } = {}) =>
  updateHistorySeason({
    history,
    season,
    patch: {
      tableRank: updateTableRankRowTeamUrl({
        tableRank: (Array.isArray(history) ? history : [])
          .find(row => isSameSeason(row, season))?.tableRank || [],
        team,
      }),
      updatedAt: new Date().toISOString(),
    },
  })

export async function updateLeagueSeasonTableRankTeamUrl({ league = {}, season = {}, team = {} } = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const birthTeamId = clean(
    teamIdentity.birthTeamId ||
    teamIdentity.teamId ||
    team.birthTeamId ||
    team.teamId ||
    team.birthTeamDocumentId ||
    team.teamDocumentId ||
    team.id
  )
  const clubId = clean(teamIdentity.clubId || team.clubId)
  const teamUrl = clean(team.teamUrl)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId && !seasonKey) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        birthTeamId,
        teamUrl,
        updated: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentSeason = currentData.current || null
    const history = Array.isArray(currentData.history) ? currentData.history : []
    const requestedSeason = {
      seasonId,
      seasonKey,
    }
    const currentMatches = isSameSeason(currentSeason, requestedSeason)
    const historyIndex = history.findIndex(row => isSameSeason(row, requestedSeason))
    const sourceTarget = currentMatches
      ? 'current'
      : historyIndex >= 0
        ? 'history'
        : ''
    const seasonRow = sourceTarget === 'current'
      ? currentSeason
      : sourceTarget === 'history' && historyIndex >= 0
        ? history[historyIndex]
        : null

    if (!seasonRow) {
      return {
        leagueId,
        seasonId,
        birthTeamId,
        teamUrl,
        updated: false,
        reason: 'leagueSeasonMissing',
      }
    }

    const tableRank = Array.isArray(seasonRow.tableRank)
      ? seasonRow.tableRank
      : []
    const teamRowIndex = tableRank.findIndex(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(
        rowIdentity.birthTeamId ||
        rowIdentity.teamId ||
        row?.birthTeamId ||
        row?.teamId ||
        row?.birthTeamDocumentId ||
        row?.teamDocumentId ||
        row?.id
      )
      const rowClubId = clean(rowIdentity.clubId || row?.clubId)

      return (
        rowTeamId === birthTeamId ||
        (!rowTeamId && clubId && rowClubId === clubId)
      )
    })

    if (teamRowIndex === -1) {
      return {
        leagueId,
        seasonId,
        birthTeamId,
        teamUrl,
        sourceTarget,
        updated: false,
        reason: 'leagueTeamRowMissing',
      }
    }

    const currentTeamRow = tableRank[teamRowIndex] || {}
    const effectiveTeamUrl = teamUrl || clean(currentTeamRow.teamUrl)
    const effectivePlayersCount = hasFiniteNumberValue(team.playersCount)
      ? Number(team.playersCount)
      : hasFiniteNumberValue(currentTeamRow.playersCount)
        ? Number(currentTeamRow.playersCount)
        : undefined
    const effectiveHasPlayers = hasOwn(team, 'hasPlayers')
      ? Boolean(team.hasPlayers)
      : hasOwn(currentTeamRow, 'hasPlayers')
        ? Boolean(currentTeamRow.hasPlayers)
        : undefined
    const effectiveHasStats = hasOwn(team, 'hasStats')
      ? Boolean(team.hasStats)
      : hasOwn(currentTeamRow, 'hasStats')
        ? Boolean(currentTeamRow.hasStats)
        : undefined
    const effectiveStatsComplete = hasOwn(team, 'statsComplete')
      ? Boolean(team.statsComplete)
      : hasOwn(currentTeamRow, 'statsComplete')
        ? Boolean(currentTeamRow.statsComplete)
        : undefined
    const loadStatusUnchanged = (
      clean(currentTeamRow.teamUrl) === effectiveTeamUrl &&
      (
        !hasFiniteNumberValue(effectivePlayersCount) ||
        toNumberOrZero(currentTeamRow.playersCount) === Number(effectivePlayersCount)
      ) &&
      (
        effectiveHasPlayers === undefined ||
        Boolean(currentTeamRow.hasPlayers) === effectiveHasPlayers
      ) &&
      (
        effectiveHasStats === undefined ||
        Boolean(currentTeamRow.hasStats) === effectiveHasStats
      ) &&
      (
        effectiveStatsComplete === undefined ||
        Boolean(currentTeamRow.statsComplete) === effectiveStatsComplete
      )
    )
    const masterSyncRequired = (
      hasFiniteNumberValue(effectivePlayersCount) &&
      toNumberOrZero(currentTeamRow.playersCount) !== Number(effectivePlayersCount)
    )

    if (loadStatusUnchanged) {
      const playersCount = sumTableRankPlayersCount(tableRank)
      const hasPlayersCount = hasTableRankPlayersCount(tableRank)

      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        teamUrl: effectiveTeamUrl,
        playersCount: effectivePlayersCount,
        hasPlayers: effectiveHasPlayers,
        hasStats: effectiveHasStats,
        statsComplete: effectiveStatsComplete,
        seasonPlayersCount: hasPlayersCount ? playersCount : undefined,
        sourceTarget,
        updated: true,
        changed: false,
        writeSkipped: true,
        masterSyncRequired: false,
      }
    }

    const nextTableRank = tableRank.map((row, index) => (
      index === teamRowIndex
        ? {
            ...row,
            teamUrl: effectiveTeamUrl,
            ...(hasFiniteNumberValue(effectivePlayersCount)
              ? { playersCount: Number(effectivePlayersCount) }
              : {}),
            ...(effectiveHasPlayers !== undefined
              ? { hasPlayers: effectiveHasPlayers }
              : {}),
            ...(effectiveHasStats !== undefined
              ? { hasStats: effectiveHasStats }
              : {}),
            ...(effectiveStatsComplete !== undefined
              ? { statsComplete: effectiveStatsComplete }
              : {}),
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const playersCount = sumTableRankPlayersCount(nextTableRank)
    const hasPlayersCount = hasTableRankPlayersCount(nextTableRank)
    const nextSeason = {
      ...seasonRow,
      tableRank: nextTableRank,
      updatedAt: new Date().toISOString(),
    }

    if (sourceTarget === 'current') {
      transaction.set(
        ref,
        {
          current: nextSeason,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } else {
      const nextHistory = history.map((row, index) => (
        index === historyIndex ? nextSeason : row
      ))

      transaction.set(
        ref,
        {
          history: nextHistory,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      teamUrl,
      playersCount: hasFiniteNumberValue(team.playersCount)
        ? Number(team.playersCount)
        : undefined,
      hasPlayers: hasOwn(team, 'hasPlayers')
        ? Boolean(team.hasPlayers)
        : undefined,
      hasStats: hasOwn(team, 'hasStats')
        ? Boolean(team.hasStats)
        : undefined,
      statsComplete: hasOwn(team, 'statsComplete')
        ? Boolean(team.statsComplete)
        : undefined,
      seasonPlayersCount: hasPlayersCount ? playersCount : undefined,
      sourceTarget,
      updated: true,
      masterSyncRequired,
    }
  })

  if (
    result.updated &&
    !result.writeSkipped &&
    result.masterSyncRequired
  ) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}

export async function updateLeagueSeasonTableRankTeamSyncMeta({
  league = {},
  season = {},
  target = 'current',
  team = {},
  scoutProfilesSummary = {},
  teamTaskSignals = null,
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const birthTeamId = clean(
    teamIdentity.birthTeamId ||
    teamIdentity.teamId ||
    team.birthTeamId ||
    team.teamId ||
    team.birthTeamDocumentId ||
    team.teamDocumentId ||
    team.id
  )
  const clubId = clean(teamIdentity.clubId || team.clubId)
  const teamUrl = clean(team.teamUrl)
  const normalizedSummary = normalizeScoutProfilesSummary(scoutProfilesSummary)
  const hasTeamTaskSignals = Boolean(
    teamTaskSignals && typeof teamTaskSignals === 'object'
  )
  const normalizedTaskSignals = normalizeTeamTaskSignals(teamTaskSignals)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId && !seasonKey) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        updated: false,
        reason: 'leagueDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentSeason = currentData.current || null
    const history = Array.isArray(currentData.history) ? currentData.history : []
    const requestedSeason = { seasonId, seasonKey }
    const currentMatches = isSameSeason(currentSeason, requestedSeason)
    const historyIndex = history.findIndex(row => isSameSeason(row, requestedSeason))
    const preferHistory = clean(target) === 'history'
    const sourceTarget = preferHistory
      ? historyIndex >= 0
        ? 'history'
        : ''
      : currentMatches
        ? 'current'
        : historyIndex >= 0
          ? 'history'
          : ''
    const seasonRow = sourceTarget === 'current'
      ? currentSeason
      : sourceTarget === 'history' && historyIndex >= 0
        ? history[historyIndex]
        : null

    if (!seasonRow) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        updated: false,
        reason: 'leagueSeasonMissing',
      }
    }

    const tableRank = Array.isArray(seasonRow.tableRank)
      ? seasonRow.tableRank
      : []
    const teamRowIndex = tableRank.findIndex(row => {
      const rowIdentity = normalizeTeamIdentity({ team: row })
      const rowTeamId = clean(
        rowIdentity.birthTeamId ||
        rowIdentity.teamId ||
        row?.birthTeamId ||
        row?.teamId ||
        row?.birthTeamDocumentId ||
        row?.teamDocumentId ||
        row?.id
      )
      const rowClubId = clean(rowIdentity.clubId || row?.clubId)

      return (
        rowTeamId === birthTeamId ||
        (!rowTeamId && clubId && rowClubId === clubId)
      )
    })

    if (teamRowIndex === -1) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        sourceTarget,
        target: sourceTarget,
        teamId: birthTeamId,
        updated: false,
        reason: 'leagueTeamRowMissing',
      }
    }

    const currentTeamRow = tableRank[teamRowIndex] || {}
    const effectiveTeamUrl = teamUrl || clean(currentTeamRow.teamUrl)
    const effectivePlayersCount = hasFiniteNumberValue(team.playersCount)
      ? Number(team.playersCount)
      : hasFiniteNumberValue(currentTeamRow.playersCount)
        ? Number(currentTeamRow.playersCount)
        : undefined
    const effectiveHasPlayers = hasOwn(team, 'hasPlayers')
      ? Boolean(team.hasPlayers)
      : hasOwn(currentTeamRow, 'hasPlayers')
        ? Boolean(currentTeamRow.hasPlayers)
        : undefined
    const effectiveHasStats = hasOwn(team, 'hasStats')
      ? Boolean(team.hasStats)
      : hasOwn(currentTeamRow, 'hasStats')
        ? Boolean(currentTeamRow.hasStats)
        : undefined
    const effectiveStatsComplete = hasOwn(team, 'statsComplete')
      ? Boolean(team.statsComplete)
      : hasOwn(currentTeamRow, 'statsComplete')
        ? Boolean(currentTeamRow.statsComplete)
        : undefined
    const loadStatusUnchanged = (
      clean(currentTeamRow.teamUrl) === effectiveTeamUrl &&
      (
        !hasFiniteNumberValue(effectivePlayersCount) ||
        toNumberOrZero(currentTeamRow.playersCount) === Number(effectivePlayersCount)
      ) &&
      (
        effectiveHasPlayers === undefined ||
        Boolean(currentTeamRow.hasPlayers) === effectiveHasPlayers
      ) &&
      (
        effectiveHasStats === undefined ||
        Boolean(currentTeamRow.hasStats) === effectiveHasStats
      ) &&
      (
        effectiveStatsComplete === undefined ||
        Boolean(currentTeamRow.statsComplete) === effectiveStatsComplete
      )
    )
    const scoutSummaryUnchanged = areScoutProfilesSummariesEqual(
      currentTeamRow.scoutProfilesSummary,
      normalizedSummary
    )
    const taskSignalsUnchanged = !hasTeamTaskSignals || (
      hasOwn(currentTeamRow, 'teamTaskSignals') &&
      areTeamTaskSignalsEqual(
        currentTeamRow.teamTaskSignals,
        normalizedTaskSignals
      )
    )
    const playersCountChanged = (
      hasFiniteNumberValue(effectivePlayersCount) &&
      toNumberOrZero(currentTeamRow.playersCount) !== Number(effectivePlayersCount)
    )
    const masterSyncRequired = playersCountChanged || !scoutSummaryUnchanged

    if (loadStatusUnchanged && scoutSummaryUnchanged && taskSignalsUnchanged) {
      const seasonPlayersCount = hasTableRankPlayersCount(tableRank)
        ? sumTableRankPlayersCount(tableRank)
        : undefined

      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        teamUrl: effectiveTeamUrl,
        playersCount: effectivePlayersCount,
        hasPlayers: effectiveHasPlayers,
        hasStats: effectiveHasStats,
        statsComplete: effectiveStatsComplete,
        seasonPlayersCount,
        scoutProfilesSummary: normalizedSummary,
        teamTaskSignals: normalizeTeamTaskSignals(currentTeamRow.teamTaskSignals),
        sourceTarget,
        target: sourceTarget,
        teamId: birthTeamId,
        updated: true,
        changed: false,
        writeSkipped: true,
        masterSyncRequired: false,
      }
    }

    const updatedAt = new Date().toISOString()
    const nextTableRank = tableRank.map((row, index) => (
      index === teamRowIndex
        ? {
            ...row,
            teamUrl: effectiveTeamUrl,
            ...(hasFiniteNumberValue(effectivePlayersCount)
              ? { playersCount: Number(effectivePlayersCount) }
              : {}),
            ...(effectiveHasPlayers !== undefined
              ? { hasPlayers: effectiveHasPlayers }
              : {}),
            ...(effectiveHasStats !== undefined
              ? { hasStats: effectiveHasStats }
              : {}),
            ...(effectiveStatsComplete !== undefined
              ? { statsComplete: effectiveStatsComplete }
              : {}),
            scoutProfilesSummary: normalizedSummary,
            ...(hasTeamTaskSignals
              ? {
                  teamTaskSignals: {
                    ...normalizedTaskSignals,
                    updatedAt,
                  },
                }
              : {}),
            updatedAt,
          }
        : row
    ))
    const playersCount = sumTableRankPlayersCount(nextTableRank)
    const hasPlayersCount = hasTableRankPlayersCount(nextTableRank)
    const nextSeason = {
      ...seasonRow,
      tableRank: nextTableRank,
      updatedAt,
    }

    if (sourceTarget === 'current') {
      transaction.set(
        ref,
        {
          current: nextSeason,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } else {
      const nextHistory = history.map((row, index) => (
        index === historyIndex ? nextSeason : row
      ))

      transaction.set(
        ref,
        {
          history: nextHistory,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      teamUrl: effectiveTeamUrl,
      playersCount: hasFiniteNumberValue(effectivePlayersCount)
        ? Number(effectivePlayersCount)
        : undefined,
      hasPlayers: effectiveHasPlayers,
      hasStats: effectiveHasStats,
      statsComplete: effectiveStatsComplete,
      seasonPlayersCount: hasPlayersCount ? playersCount : undefined,
      scoutProfilesSummary: normalizedSummary,
      teamTaskSignals: hasTeamTaskSignals
        ? {
            ...normalizedTaskSignals,
            updatedAt,
          }
        : normalizeTeamTaskSignals(currentTeamRow.teamTaskSignals),
      sourceTarget,
      target: sourceTarget,
      teamId: birthTeamId,
      updated: true,
      changed: true,
      writeSkipped: false,
      masterSyncRequired,
    }
  })

  if (
    result.updated &&
    !result.writeSkipped &&
    result.masterSyncRequired
  ) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}

