// features/playersDatabase/services/write/leagues/leagueSeason.js

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

export { buildSeasonKey } from './leagueDoc.js'

export const buildSeasonDoc = (season = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)

  return {
    seasonId,
    seasonKey,
    seasonUrl: clean(season.seasonUrl),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    tableRank: Array.isArray(season.tableRank) ? season.tableRank : [],
    updatedAt: new Date().toISOString(),
  }
}

export const isSameSeason = (row = {}, season = {}) => {
  const rowSeasonKey = clean(row?.seasonKey)
  const rowSeasonId = clean(row?.seasonId)
  const seasonKey = clean(season?.seasonKey)
  const seasonId = clean(season?.seasonId)

  return Boolean(
    (seasonKey && rowSeasonKey === seasonKey) ||
    (seasonId && rowSeasonId === seasonId)
  )
}

const upsertHistorySeason = (history = [], seasonDoc = {}) => {
  const rows = Array.isArray(history) ? history : []
  const seasonIndex = rows.findIndex(row => isSameSeason(row, seasonDoc))

  if (seasonIndex === -1) {
    return [...rows, seasonDoc]
  }

  return rows.map((row, index) => (
    index === seasonIndex
      ? { ...row, ...seasonDoc }
      : row
  ))
}

export const findHistorySeason = (history = [], seasonKey = '') =>
  (Array.isArray(history) ? history : [])
    .find(row => isSameSeason(row, {
      seasonKey,
      seasonId: clean(seasonKey).replace(/_/g, '/'),
    })) || null

export async function upsertLeagueSeason({
  league = {},
  season = {},
  target = 'current',
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
    const existingSeason = isHistory
      ? findHistorySeason(baseDoc.history, seasonKey)
      : clean(baseDoc.current?.seasonKey) === seasonKey || clean(baseDoc.current?.seasonId) === seasonId
        ? baseDoc.current
        : null
    const seasonDoc = buildSeasonDoc({
      ...(existingSeason || {}),
      ...season,
      seasonId,
      seasonKey,
      tableRank: Array.isArray(existingSeason?.tableRank)
        ? existingSeason.tableRank
        : Array.isArray(season.tableRank)
          ? season.tableRank
          : [],
    })
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: upsertHistorySeason(baseDoc.history, seasonDoc),
        }
      : {
          ...baseDoc,
          current: seasonDoc,
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey: seasonDoc.seasonKey,
      target: isHistory ? 'history' : 'current',
      createdLeague: !snapshot.exists(),
    }
  })
}

export async function updateLeagueSeasonUrl({
  league = {},
  season = {},
  target = 'current',
  seasonUrl = '',
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
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeason({
            history: baseDoc.history,
            season: { ...season, seasonId, seasonKey },
            patch: {
              seasonUrl: clean(seasonUrl),
              updatedAt: new Date().toISOString(),
            },
          }),
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({ ...season, seasonId, seasonKey })),
            seasonId,
            seasonKey,
            seasonUrl: clean(seasonUrl),
            updatedAt: new Date().toISOString(),
          },
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      seasonUrl: clean(seasonUrl),
      target: isHistory ? 'history' : 'current',
    }
  })
}

export async function updateLeagueSeasonMeta({
  league = {},
  season = {},
  target = 'current',
  birthYear = null,
  leagueTotalRound = null,
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
    const patch = {
      birthYear: toNumberOrZero(birthYear ?? season.birthYear),
      leagueTotalRound: toNumberOrZero(leagueTotalRound ?? season.leagueTotalRound),
      updatedAt: new Date().toISOString(),
    }
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeason({
            history: baseDoc.history,
            season: { ...season, seasonId, seasonKey },
            patch,
          }),
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({ ...season, seasonId, seasonKey })),
            seasonId,
            seasonKey,
            ...patch,
          },
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      birthYear: patch.birthYear,
      leagueTotalRound: patch.leagueTotalRound,
    }
  })
}

export const updateHistorySeason = ({
  history = [],
  season = {},
  patch = {},
}) => {
  const rows = Array.isArray(history) ? history : []
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const seasonIndex = rows.findIndex(row => isSameSeason(row, { ...season, seasonId, seasonKey }))

  if (seasonIndex === -1) {
    return [
      ...rows,
      {
        ...buildSeasonDoc({ ...season, seasonKey }),
        ...patch,
      },
    ]
  }

  return rows.map((row, index) => (
    index === seasonIndex
      ? { ...cleanSeasonComputedFields(row), ...patch }
      : cleanSeasonComputedFields(row)
  ))
}
