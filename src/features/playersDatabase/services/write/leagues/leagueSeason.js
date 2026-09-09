// features/playersDatabase/services/write/leagues/leagueSeason.js

import { pickDefinedValue } from '../../../model/value.model.js'
import { normalizeSeasonStatus } from '../../../model/season.model.js'


import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildLeagueBaseDoc,
  buildSeasonKey,
  clean,
  cleanSeasonComputedFields,
  leagueDocRef,
  toNumberOrZero,
} from './leagueDoc.js'
import { syncLeaguesMasterDocument } from './leaguesMaster.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
export { buildSeasonKey } from './leagueDoc.js'

const normalizeSeasonTableRank = value => {
  if (value === null || value === undefined) return null
  return Array.isArray(value) ? value : null
}

export const buildSeasonDoc = (season = {}) => {
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)

  return {
    seasonId,
    seasonKey,
    seasonUrl: clean(season.seasonUrl),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    seasonStatus: normalizeSeasonStatus(
      season.seasonStatus,
      clean(season.seasonStatus) === 'completed' ? 'completed' : 'active'
    ),
    tableRank: normalizeSeasonTableRank(season.tableRank),
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
      ? {
        ...row,
        ...seasonDoc,
      }
      : row
  ))
}

const removeHistorySeason = (history = [], season = {}) => (
  (Array.isArray(history) ? history : []).filter(row => (
    !isSameSeason(row, season)
  ))
)

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
  syncMaster = true,
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    // A user's "season completed" choice is authoritative. Keeping this
    // together with the target makes the transition resilient to callers
    // that still pass the default target by mistake.
    const isHistory = (
      clean(target) === 'history' ||
      normalizeSeasonStatus(season.seasonStatus) === 'completed'
    )
    const currentSeasonKey = clean(baseDoc.current?.seasonKey || baseDoc.current?.seasonId)

    if (!isHistory && currentSeasonKey && currentSeasonKey !== seasonKey) {
      throw new Error(
        `League ${leagueId} already has an active season (${currentSeasonKey}). Move it to history before creating ${seasonKey}.`
      )
    }

    const existingSeason = isHistory
      ? findHistorySeason(baseDoc.history, seasonKey)
      : clean(baseDoc.current?.seasonKey) === seasonKey || clean(baseDoc.current?.seasonId) === seasonId
        ? baseDoc.current
        : null
    const hasIncomingTableRank = Object.prototype.hasOwnProperty.call(
      season,
      'tableRank'
    )
    const requestedCurrentStatus = clean(season.seasonStatus)
    const seasonDoc = buildSeasonDoc({
      ...(existingSeason || {}),
      ...season,
      seasonId,
      seasonKey,
      seasonStatus: isHistory
        ? 'completed'
        : ['active', 'not_started'].includes(requestedCurrentStatus)
          ? requestedCurrentStatus
          : 'active',
      tableRank: hasIncomingTableRank
        ? season.tableRank
        : existingSeason?.tableRank,
    })
    const matchesCurrent = isSameSeason(baseDoc.current, seasonDoc)
    const nextData = isHistory
      ? {
          ...baseDoc,
          // Selecting history for the existing active season is a lifecycle
          // transition, not a duplicate season record.
          current: matchesCurrent ? null : baseDoc.current,
          history: upsertHistorySeason(baseDoc.history, seasonDoc),
        }
      : {
          ...baseDoc,
          current: seasonDoc,
          // Selecting active for an existing historical season moves it back
          // to current so one identity cannot exist in both targets.
          history: removeHistorySeason(baseDoc.history, seasonDoc),
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

  if (syncMaster) {
    await syncLeaguesMasterDocument({
      leagues: [league],
    })
  }

  return result
}

export async function updateLeagueSeasonUrl({
  league = {},
  season = {},
  target = 'current',
  seasonUrl = '',
} = {}) {
  const leagueId = clean(league.id || season.leagueId)
  const seasonId = clean(season.seasonId)
  const resolvedSeasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeason({
            history: baseDoc.history,
            season: {
              ...season,
              seasonId,
              seasonKey: resolvedSeasonKey,
            },
            patch: {
              seasonUrl: clean(seasonUrl),
              updatedAt: new Date().toISOString(),
            },
          }),
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
              ...season,
              seasonId,
              seasonKey: resolvedSeasonKey,
            })),
            seasonId,
            seasonKey: resolvedSeasonKey,
            seasonUrl: clean(seasonUrl),
            updatedAt: new Date().toISOString(),
          },
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey: resolvedSeasonKey,
      seasonUrl: clean(seasonUrl),
      target: isHistory ? 'history' : 'current',
    }
  })

  await syncLeaguesMasterDocument({
    leagues: [league],
  })

  return result
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
  const resolvedSeasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = leagueDocRef(leagueId)

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildLeagueBaseDoc({
      ...league,
      id: leagueId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const patch = {
      birthYear: toNumberOrZero(pickDefinedValue(birthYear, season.birthYear)),
      leagueTotalRound: toNumberOrZero(pickDefinedValue(leagueTotalRound, season.leagueTotalRound)),
      updatedAt: new Date().toISOString(),
    }
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: updateHistorySeason({
            history: baseDoc.history,
            season: {
              ...season,
              seasonId,
              seasonKey: resolvedSeasonKey,
            },
            patch,
          }),
        }
      : {
          ...baseDoc,
          current: {
            ...cleanSeasonComputedFields(baseDoc.current || buildSeasonDoc({
              ...season,
              seasonId,
              seasonKey: resolvedSeasonKey,
            })),
            seasonId,
            seasonKey: resolvedSeasonKey,
            ...patch,
          },
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      leagueId,
      seasonId,
      seasonKey: resolvedSeasonKey,
      target: isHistory ? 'history' : 'current',
      birthYear: patch.birthYear,
      leagueTotalRound: patch.leagueTotalRound,
    }
  })

  await syncLeaguesMasterDocument({
    leagues: [league],
  })

  return result
}

export const updateHistorySeason = ({
  history = [],
  season = {},
  patch = {},
}) => {
  const rows = Array.isArray(history) ? history : []
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const seasonIndex = rows.findIndex(row => isSameSeason(row, {
    ...season,
    seasonId,
    seasonKey,
  }))

  if (seasonIndex === -1) {
    return [
      ...rows,
      {
        ...buildSeasonDoc({
          ...season,
          seasonKey,
        }),
        ...patch,
      },
    ]
  }

  return rows.map((row, index) => (
    index === seasonIndex
      ? {
        ...cleanSeasonComputedFields(row),
        ...patch,
      }
      : cleanSeasonComputedFields(row)
  ))
}
