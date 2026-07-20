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

const buildTableRankRow = (row = {}) => {
  const rank = toNumberOrZero(row.position)
  const games = toNumberOrZero(row.games)
  const goalsFor = toNumberOrZero(row.goalsFor)
  const goalsAgainst = toNumberOrZero(row.goalsAgainst)
  const points = toNumberOrZero(row.points)
  const birthTeamId = clean(row.birthTeamId || row.teamId || row.teamSlotId)
  const birthTeamSlot = toNumberOrZero(row.birthTeamSlot || row.teamSlot) || 1

  return {
    rank,
    clubId: clean(row.clubId),
    birthTeamId,
    birthTeamSlot,
    teamId: birthTeamId,
    teamUrl: clean(row.teamUrl),
    teamStats: {
      points,
      goalsFor,
      goalsAgainst,
      teamGamePlayed: games,
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
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
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
  const teamId = clean(team.birthTeamId || team.teamId)
  const clubId = clean(team.clubId)
  const teamUrl = clean(team.teamUrl)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = clean(row.birthTeamId || row.teamId || row.teamSlotId)
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
          .find(row => {
            const seasonKey = clean(season.seasonKey) || buildSeasonKey(season.seasonId)
            return clean(row.seasonKey) === seasonKey || clean(row.seasonId) === clean(season.seasonId)
          })?.tableRank || [],
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
  const teamId = clean(team.birthTeamId || team.teamId)
  const clubId = clean(team.clubId)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = clean(row.birthTeamId || row.teamId || row.teamSlotId)
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
          .find(row => {
            const seasonKey = clean(season.seasonKey) || buildSeasonKey(season.seasonId)
            return clean(row.seasonKey) === seasonKey || clean(row.seasonId) === clean(season.seasonId)
          })?.tableRank || [],
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
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({ ...league, id: leagueId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeasonTableRankTeamUrl({
            history: baseDoc.history,
            season: { ...season, seasonId, seasonKey },
            team,
          }),
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({ ...season, seasonId, seasonKey })),
            tableRank: updateTableRankRowTeamUrl({
              tableRank: baseDoc.current?.tableRank || [],
              team,
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
      teamUrl: clean(team.teamUrl),
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
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
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

