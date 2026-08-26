// src/features/playersDatabase/services/write/teams/teamSeasonStats.js



import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import { isSameSeason } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import {
  buildTeamBaseDoc,
  teamDocRef,
} from './teamDoc.js'
import {
  buildTeamSeasonDoc,
  mergeTeamPlayerStats,
  upsertSeasonRows,
} from './teamSeason.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'

const hasNumberValue = value => (
  value !== undefined &&
  value !== null &&
  value !== '' &&
  Number.isFinite(Number(value))
)

const isPlainObject = value => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype
)


const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (!isPlainObject(value)) return value

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = normalizeComparableValue(value[key])
      return result
    }, {})
}

const stripTeamTechnicalTimestamps = value => {
  const source = isPlainObject(value) ? value : {}
  const next = {
    ...source,
  }

  delete next.updatedAt

  ;['current', 'history'].forEach(fieldKey => {
    if (!Array.isArray(next[fieldKey])) return

    next[fieldKey] = next[fieldKey].map(row => {
      if (!isPlainObject(row)) return row

      const nextRow = {
        ...row,
      }

      delete nextRow.updatedAt

      if (Array.isArray(nextRow.teamPlayers)) {
        nextRow.teamPlayers = nextRow.teamPlayers.map(player => {
          if (!isPlainObject(player)) return player

          const nextPlayer = {
            ...player,
          }

          delete nextPlayer.updatedAt
          return nextPlayer
        })
      }

      if (isPlainObject(nextRow.teamBalance)) {
        nextRow.teamBalance = {
          ...nextRow.teamBalance,
          source: isPlainObject(nextRow.teamBalance.source)
            ? {
                ...nextRow.teamBalance.source,
              }
            : nextRow.teamBalance.source,
        }

        if (isPlainObject(nextRow.teamBalance.source)) {
          delete nextRow.teamBalance.source.updatedAt
        }
      }

      return nextRow
    })
  })

  return next
}

const isSamePersistedTeamState = (current, next) => (
  JSON.stringify(normalizeComparableValue(stripTeamTechnicalTimestamps(current))) ===
  JSON.stringify(normalizeComparableValue(stripTeamTechnicalTimestamps(next)))
)

const stripUndefined = value => {
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined)
      .map(stripUndefined)
  }

  if (!isPlainObject(value)) return value

  return Object.entries(value).reduce((result, [key, item]) => {
    if (item === undefined) return result

    result[key] = stripUndefined(item)
    return result
  }, {})
}

export async function updateTeamSeasonPlayerStats({ season = {}, team = {}, target = 'current', players = [] } = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildTeamBaseDoc({
      ...team,
      teamDocumentId: teamId,
    }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const seasonStatus = isHistory || clean(season.seasonStatus) === 'completed'
      ? 'completed'
      : 'active'
    const effectiveSeason = {
      ...season,
      seasonId,
      seasonKey,
      seasonStatus,
    }
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeason = (Array.isArray(rows) ? rows : [])
      .find(row => isSameSeason(row, {
        seasonId,
        seasonKey,
      }))
    const baseSeasonDoc = existingSeason || buildTeamSeasonDoc({
      season: effectiveSeason,
      team: {
        ...team,
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
      },
      players: [],
    })
    const seasonDocWithoutBalance = stripUndefined({
      ...baseSeasonDoc,
      seasonStatus,
      leagueTotalRound: hasNumberValue(season.leagueTotalRound)
        ? Number(season.leagueTotalRound)
        : Number(baseSeasonDoc.leagueTotalRound) || 0,
      teamPlayers: mergeTeamPlayerStats({
        existingPlayers: baseSeasonDoc.teamPlayers,
        players,
        team,
        season: effectiveSeason,
      }),
      updatedAt: new Date().toISOString(),
    })
    const seasonDoc = withTeamBalanceSnapshot({
      seasonDoc: seasonDocWithoutBalance,
      teamDocument: baseDoc,
      seasonTarget: isHistory ? 'history' : 'current',
    })
    const nextData = stripUndefined(isHistory
      ? {
          ...baseDoc,
          history: upsertSeasonRows({
            rows: baseDoc.history,
            season: {
              seasonId,
              seasonKey,
            },
            seasonDoc,
          }),
        }
      : {
          ...baseDoc,
          current: upsertSeasonRows({
            rows: baseDoc.current,
            season: {
              seasonId,
              seasonKey,
            },
            seasonDoc,
          }),
        })

    const writeSkipped = snapshot.exists() && isSamePersistedTeamState(
      currentData,
      nextData
    )

    if (!writeSkipped) {
      transaction.set(ref, nextData, { merge: true })
    }

    const persistedSeason = writeSkipped
      ? existingSeason || seasonDoc
      : seasonDoc
    const persistedTeamDocument = writeSkipped
      ? currentData
      : nextData

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: (Array.isArray(players) ? players : []).length,
      playersCount: Array.isArray(persistedSeason.teamPlayers)
        ? persistedSeason.teamPlayers.length
        : 0,
      players: Array.isArray(persistedSeason.teamPlayers)
        ? persistedSeason.teamPlayers
        : [],
      teamBalance: persistedSeason.teamBalance || null,
      teamDocument: persistedTeamDocument,
      updated: true,
      changed: !writeSkipped,
      writeSkipped,
    }
  })
}
