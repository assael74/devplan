// features/playersDatabase/services/write/leagues/leagueTableRank.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
  toNumberOrZero,
} from './leagueDoc.js'
import { buildSeasonDoc, updateHistorySeason } from './leagueSeason.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { normalizeTeamIdentity } from '../../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../model/teamStats.model.js'

const buildTableRankRow = (row = {}) => {
  const rank = toNumberOrZero(row.position ?? row.rank ?? row.leaguePosition)
  const identity = normalizeTeamIdentity({ team: row })
  const teamStats = normalizeTeamStats(row, {
    gamesCandidates: [row.games],
    goalsForCandidates: [row.goalsFor],
    goalsAgainstCandidates: [row.goalsAgainst],
    pointsCandidates: [row.points],
  })

  return {
    rank,
    clubId: identity.clubId,
    birthTeamId: identity.birthTeamId,
    birthTeamSlot: identity.birthTeamSlot,
    teamId: identity.birthTeamId,
    teamUrl: clean(row.teamUrl),
    teamStats: {
      points: teamStats.points,
      goalsFor: teamStats.goalsFor,
      goalsAgainst: teamStats.goalsAgainst,
      teamGamePlayed: teamStats.gamesPlayed,
    },
    scoutProfilesSummary: {
      total: 0,
      profileCounts: {},
    },
    updatedAt: new Date().toISOString(),
  }
}

const buildTableRank = rows =>
  (Array.isArray(rows) ? rows : [])
    .map(row => buildTableRankRow(row))
    .filter(row => row.rank || row.clubId || row.birthTeamId || row.teamId)

const updateHistorySeasonTableRank = ({
  history = [],
  season = {},
  tableRank = [],
}) =>
  updateHistorySeason({
    history,
    season,
    patch: {
      birthYear: toNumberOrZero(season.birthYear),
      leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
      tableRank,
      updatedAt: new Date().toISOString(),
    },
  })

export async function updateLeagueSeasonTableRank({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({ ...league, id: leagueId }, currentData)
    const { seasonKey } = normalizeSeasonIdentity({ season: { ...season, seasonId } })
    const isHistory = clean(target) === 'history'
    const tableRank = buildTableRank(rows)
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeasonTableRank({
            history: baseDoc.history,
            season: { ...season, seasonId, seasonKey },
            tableRank,
          }),
        }
      : {
        ...baseDoc,
        current: {
          ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({ ...season, seasonId, seasonKey })),
          seasonId,
          seasonKey,
          birthYear: toNumberOrZero(season.birthYear),
          leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
          tableRank,
          updatedAt: new Date().toISOString(),
        },
      }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: tableRank.length,
    }
  })
}

const updateTableRankRowTeamUrl = ({
  tableRank = [],
  team = {},
} = {}) => {
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
      teamUrl,
      ...(Number.isFinite(Number(team.playersCount))
        ? { playersCount: Number(team.playersCount) }
        : {}),
      updatedAt: new Date().toISOString(),
    }
  })
}

const updateHistorySeasonTableRankTeamUrl = ({
  history = [],
  season = {},
  team = {},
} = {}) =>
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

const updateTableRankRowScoutProfilesSummary = ({
  tableRank = [],
  team = {},
  scoutProfilesSummary = {},
} = {}) => {
  const teamId = normalizeTeamIdentity({ team }).birthTeamId
  const clubId = clean(team.clubId)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = normalizeTeamIdentity({ team: row }).birthTeamId
    const rowClubId = clean(row.clubId)
    const sameTeam = teamId && rowTeamId === teamId
    const sameClubFallback = !teamId && clubId && rowClubId === clubId

    if (!sameTeam && !sameClubFallback) return row

    return {
      ...row,
      scoutProfilesSummary: {
        total: toNumberOrZero(scoutProfilesSummary.total),
        profileCounts: scoutProfilesSummary.profileCounts || {},
      },
      updatedAt: new Date().toISOString(),
    }
  })
}

const updateHistorySeasonTableRankScoutProfilesSummary = ({
  history = [],
  season = {},
  team = {},
  scoutProfilesSummary = {},
} = {}) =>
  updateHistorySeason({
    history,
    season,
    patch: {
      tableRank: updateTableRankRowScoutProfilesSummary({
        tableRank: (Array.isArray(history) ? history : [])
          .find(row => isSameSeason(row, season))?.tableRank || [],
        team,
        scoutProfilesSummary,
      }),
      updatedAt: new Date().toISOString(),
    },
  })

export async function updateLeagueSeasonTableRankTeamUrl({
  league = {},
  season = {},
  target = 'current',
  team = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const { seasonKey } = normalizeSeasonIdentity({
    season: {
      ...season,
      seasonId,
    },
  })
  const teamIdentity = normalizeTeamIdentity({ team })
  const birthTeamId = clean(teamIdentity.birthTeamId)
  const teamUrl = clean(team.teamUrl)
  const isHistory = clean(target) === 'history'

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')
  if (!birthTeamId) throw new Error('Missing birth team id')

  const ref = leagueDocRef(leagueId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        teamUrl,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'leagueDocMissing',
      }
    }

    const data = snapshot.data() || {}
    const fieldKey = isHistory ? 'history' : 'current'
    const seasonRows = isHistory
      ? (Array.isArray(data.history) ? data.history : [])
      : [data.current].filter(Boolean)
    const seasonIndex = seasonRows.findIndex(row => (
      isSameSeason(row, { seasonId, seasonKey })
    ))

    if (seasonIndex === -1) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        teamUrl,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'leagueSeasonMissing',
      }
    }

    const seasonRow = seasonRows[seasonIndex] || {}
    const tableRank = Array.isArray(seasonRow.tableRank)
      ? seasonRow.tableRank
      : []
    const teamRowIndex = tableRank.findIndex(row => (
      clean(normalizeTeamIdentity({ team: row }).birthTeamId) === birthTeamId
    ))

    if (teamRowIndex === -1) {
      return {
        leagueId,
        seasonId,
        seasonKey,
        birthTeamId,
        teamUrl,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'leagueTeamRowMissing',
      }
    }

    const nextTableRank = tableRank.map((row, index) => (
      index === teamRowIndex
        ? {
            ...row,
            teamUrl,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const nextSeasonRow = {
      ...seasonRow,
      tableRank: nextTableRank,
      updatedAt: new Date().toISOString(),
    }

    transaction.set(
      ref,
      isHistory
        ? {
            history: seasonRows.map((row, index) => (
              index === seasonIndex ? nextSeasonRow : row
            )),
            updatedAt: new Date().toISOString(),
          }
        : {
            current: nextSeasonRow,
            updatedAt: new Date().toISOString(),
          },
      { merge: true }
    )

    return {
      leagueId,
      seasonId,
      seasonKey,
      birthTeamId,
      teamUrl,
      target: isHistory ? 'history' : 'current',
      updated: true,
    }
  })
}

export async function updateLeagueSeasonTableRankScoutProfilesSummary({
  league = {},
  season = {},
  target = 'current',
  team = {},
  scoutProfilesSummary = {},
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({ ...league, id: leagueId }, currentData)
    const { seasonKey } = normalizeSeasonIdentity({ season: { ...season, seasonId } })
    const isHistory = clean(target) === 'history'
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeasonTableRankScoutProfilesSummary({
            history: baseDoc.history,
            season: { ...season, seasonId, seasonKey },
            team,
            scoutProfilesSummary,
          }),
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({ ...season, seasonId, seasonKey })),
            tableRank: updateTableRankRowScoutProfilesSummary({
              tableRank: baseDoc.current?.tableRank || [],
              team,
              scoutProfilesSummary,
            }),
            updatedAt: new Date().toISOString(),
          },
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      teamId: clean(team.teamId),
      scoutProfilesSummary,
    }
  })
}

