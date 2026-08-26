// src/features/playersDatabase/services/write/teams/teamBalanceRefresh.js

import {
  collection,
  doc,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import {
  createTrackedWriteBatch,
  trackedGetDocs,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { isSameSeason } from '../../../model/season.model.js'
import { clean } from '../leagues/leagueDoc.js'
import { buildTeamBalanceSearchIndexProjection } from '../searchIndex/team/teamSeasonIndex.balance.js'
import { commitBatchWhenNeeded } from '../searchIndex/shared/searchIndexBatch.write.js'
import { withTeamBalanceSnapshot } from './teamBalanceSnapshot.js'

const DEFAULT_REFRESH_LIMIT = 100
const MAX_REFRESH_LIMIT = 400

const toSafeLimit = value => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return DEFAULT_REFRESH_LIMIT

  return Math.min(MAX_REFRESH_LIMIT, Math.floor(numericValue))
}

const normalizeRows = value => (
  Array.isArray(value)
    ? value
    : value
      ? [value]
      : []
)

const groupRowsByTeamDocument = rows => {
  const groups = new Map()

  rows.forEach(row => {
    const teamDocumentId = clean(
      row.birthTeamDocumentId ||
      row.teamDocumentId ||
      row.birthTeamId ||
      row.teamId
    )
    if (!teamDocumentId) return

    if (!groups.has(teamDocumentId)) groups.set(teamDocumentId, [])
    groups.get(teamDocumentId).push(row)
  })

  return groups
}

const findSeasonLocation = ({ teamDocument = {}, indexRow = {} } = {}) => {
  const requestedSeason = {
    seasonId: clean(indexRow.seasonId),
    seasonKey: clean(indexRow.seasonKey),
  }
  const currentRows = normalizeRows(teamDocument.current)
  const historyRows = normalizeRows(teamDocument.history)
  const requestedTarget = clean(indexRow.sourceTarget) === 'history'
    ? 'history'
    : 'current'
  const targetOrder = requestedTarget === 'history'
    ? ['history', 'current']
    : ['current', 'history']

  for (const target of targetOrder) {
    const rows = target === 'history' ? historyRows : currentRows
    const seasonIndex = rows.findIndex(row => isSameSeason(row, requestedSeason))

    if (seasonIndex >= 0) {
      return {
        target,
        rows,
        seasonIndex,
        season: rows[seasonIndex],
        currentRows,
        historyRows,
      }
    }
  }

  return null
}

const areBalanceSnapshotsEqual = (left, right) => (
  JSON.stringify(left || null) === JSON.stringify(right || null)
)

const buildStaleIndexRows = snapshot => (
  snapshot.docs
    .map(item => ({
      id: item.id,
      ...(item.data() || {}),
    }))
    .filter(row => clean(row.entityType) === 'birthTeamSeason')
)

const isBalanceProjectionEqual = ({ indexRow = {}, projection = {} } = {}) => (
  Object.keys(projection).every(key => (
    (indexRow[key] === undefined ? '' : indexRow[key]) === projection[key]
  ))
)

const buildMissingResult = ({
  teamDocumentId = '',
  indexRows = [],
  reason = '',
} = {}) => ({
  teamDocumentId,
  teamUpdated: false,
  indexPatches: [],
  skippedRows: indexRows.map(row => ({
    id: row.id,
    seasonId: clean(row.seasonId),
    seasonKey: clean(row.seasonKey),
    reason,
  })),
})

const refreshTeamDocumentBalanceRows = async ({
  teamDocumentId,
  indexRows = [],
} = {}) => {
  const teamRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teams,
    teamDocumentId
  )

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(teamRef)
    if (!snapshot.exists()) {
      return buildMissingResult({
        teamDocumentId,
        indexRows,
        reason: 'teamDocMissing',
      })
    }

    const currentData = snapshot.data() || {}
    let nextCurrent = normalizeRows(currentData.current)
    let nextHistory = normalizeRows(currentData.history)
    let currentChanged = false
    let historyChanged = false
    const indexPatches = []
    const skippedRows = []

    indexRows.forEach(indexRow => {
      const location = findSeasonLocation({
        teamDocument: {
          ...currentData,
          current: nextCurrent,
          history: nextHistory,
        },
        indexRow,
      })

      if (!location) {
        skippedRows.push({
          id: indexRow.id,
          seasonId: clean(indexRow.seasonId),
          seasonKey: clean(indexRow.seasonKey),
          reason: 'teamSeasonMissing',
        })
        return
      }

      const refreshedSeason = withTeamBalanceSnapshot({
        seasonDoc: location.season,
        teamDocument: {
          ...currentData,
          current: nextCurrent,
          history: nextHistory,
        },
        seasonTarget: location.target,
      })
      const balanceChanged = !areBalanceSnapshotsEqual(
        location.season?.teamBalance,
        refreshedSeason?.teamBalance
      )
      const persistedSeason = balanceChanged
        ? {
            ...refreshedSeason,
            updatedAt: new Date().toISOString(),
          }
        : location.season

      if (balanceChanged) {
        if (location.target === 'history') {
          nextHistory = location.rows.map((row, index) => (
            index === location.seasonIndex ? persistedSeason : row
          ))
          historyChanged = true
        } else {
          nextCurrent = location.rows.map((row, index) => (
            index === location.seasonIndex ? persistedSeason : row
          ))
          currentChanged = true
        }
      }

      const teamBalance = persistedSeason?.teamBalance || null
      const balanceProjection = buildTeamBalanceSearchIndexProjection(teamBalance)
      if (!Object.keys(balanceProjection).length) {
        skippedRows.push({
          id: indexRow.id,
          seasonId: clean(indexRow.seasonId),
          seasonKey: clean(indexRow.seasonKey),
          reason: 'balanceProjectionUnavailable',
        })
        return
      }

      const indexProjectionUnchanged = (
        isBalanceProjectionEqual({
          indexRow,
          projection: balanceProjection,
        }) &&
        clean(indexRow.sourceTarget) === location.target
      )

      if (!indexProjectionUnchanged) {
        indexPatches.push({
          id: indexRow.id,
          sourceTarget: location.target,
          balanceProjection,
        })
      }
    })

    if (currentChanged || historyChanged) {
      transaction.set(
        teamRef,
        {
          ...(currentChanged ? { current: nextCurrent } : {}),
          ...(historyChanged ? { history: nextHistory } : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      teamDocumentId,
      teamUpdated: currentChanged || historyChanged,
      indexPatches,
      skippedRows,
    }
  })
}

export async function refreshTeamBalancesByDependency({
  fromDependencyKey = '',
  maxRows = DEFAULT_REFRESH_LIMIT,
} = {}) {
  const dependencyKey = clean(fromDependencyKey)
  if (!dependencyKey) throw new Error('Missing source Team Balance dependency key')

  const batchLimit = toSafeLimit(maxRows)
  const staleQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('balanceDependencyKey', '==', dependencyKey),
    limit(batchLimit)
  )
  const staleSnapshot = await trackedGetDocs(staleQuery, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamBalance-refresh-find-stale',
    operationSubtype: 'maintenance-query',
  })
  const staleRows = buildStaleIndexRows(staleSnapshot)
  const groups = groupRowsByTeamDocument(staleRows)
  const groupedRowIds = new Set(
    [...groups.values()]
      .flat()
      .map(row => row.id)
  )
  const ungroupedRows = staleRows
    .filter(row => !groupedRowIds.has(row.id))
    .map(row => ({
      id: row.id,
      seasonId: clean(row.seasonId),
      seasonKey: clean(row.seasonKey),
      reason: 'teamDocumentIdMissing',
    }))
  const groupResults = []

  for (const [teamDocumentId, indexRows] of groups.entries()) {
    groupResults.push(await refreshTeamDocumentBalanceRows({
      teamDocumentId,
      indexRows,
    }))
  }

  const indexPatches = groupResults.flatMap(result => result.indexPatches || [])
  const skippedRows = [
    ...ungroupedRows,
    ...groupResults.flatMap(result => result.skippedRows || []),
  ]
  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'teamBalance-refresh-index',
    operationSubtype: 'maintenance-batch',
  })

  indexPatches.forEach(item => {
    batch.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, item.id),
      {
        ...item.balanceProjection,
        sourceTarget: item.sourceTarget,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  })

  await commitBatchWhenNeeded({
    batch,
    operationsCount: indexPatches.length,
  })

  return {
    fromDependencyKey: dependencyKey,
    queriedRowsCount: staleSnapshot.size,
    staleRowsCount: staleRows.length,
    teamDocumentsReadCount: groups.size,
    teamDocumentsUpdatedCount: groupResults.filter(result => result.teamUpdated).length,
    searchIndexRowsUpdatedCount: indexPatches.length,
    refreshedDependencyKeys: [
      ...new Set(indexPatches
        .map(item => clean(item.balanceProjection?.balanceDependencyKey))
        .filter(Boolean)),
    ],
    skippedRowsCount: skippedRows.length,
    skippedRows,
    batchLimit,
    hasMore: staleSnapshot.size >= batchLimit,
  }
}
