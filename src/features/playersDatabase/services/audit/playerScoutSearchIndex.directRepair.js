// src/features/playersDatabase/services/audit/playerScoutSearchIndex.directRepair.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedUpdateDoc,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const normalizeComparableValue = value => {
  if (Array.isArray(value)) return value.map(normalizeComparableValue)

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  if (value === undefined) return null

  return value
}

const sameValue = (left, right) => (
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))
)

const DIRECT_SEARCH_INDEX_REPAIR_ROUTES = Object.freeze({
  search_index_scout_projection_mismatch: 'DIRECT_PLAYER_SEARCH_INDEX',
  search_index_season_status_mismatch: 'DIRECT_PLAYER_SEARCH_INDEX',
  team_search_index_scout_summary_mismatch: 'DIRECT_TEAM_SEARCH_INDEX',
})

export const canDirectRepairSearchIndexIssue = issue => (
  clean(DIRECT_SEARCH_INDEX_REPAIR_ROUTES[clean(issue?.type)]) ===
    clean(issue?.repairData?.writer) &&
  Boolean(clean(issue?.searchIndexDocumentId)) &&
  issue?.repairData?.fields &&
  typeof issue.repairData.fields === 'object' &&
  Object.keys(issue.repairData.fields).length > 0
)

export const canDirectRepairPlayerSearchIndexIssue = issue => (
  clean(issue?.repairData?.writer) === 'DIRECT_PLAYER_SEARCH_INDEX' &&
  canDirectRepairSearchIndexIssue(issue)
)

export const canDirectRepairTeamSearchIndexIssue = issue => (
  clean(issue?.repairData?.writer) === 'DIRECT_TEAM_SEARCH_INDEX' &&
  canDirectRepairSearchIndexIssue(issue)
)

export const repairSearchIndexIssueDirect = async ({
  issue,
} = {}) => {
  if (!canDirectRepairSearchIndexIssue(issue)) {
    return {
      issueId: clean(issue?.issueId),
      updated: false,
      skipped: true,
      reason: 'directRepairNotSupported',
      reads: 0,
      writes: 0,
    }
  }

  const searchIndexDocumentId = clean(issue.searchIndexDocumentId)
  const projectionTarget = clean(issue?.repairData?.writer) === 'DIRECT_TEAM_SEARCH_INDEX'
    ? 'teamSearchIndex'
    : 'playerSearchIndex'
  const ref = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    searchIndexDocumentId
  )
  const snapshot = await trackedGetDoc(ref, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'playerScoutRepair-directSearchIndex',
    operationSubtype: 'repair-read',
  })

  if (!snapshot.exists()) {
    return {
      issueId: clean(issue.issueId),
      searchIndexDocumentId,
      projectionTarget,
      updated: false,
      skipped: true,
      reason: 'searchIndexDocumentMissing',
      reads: 1,
      writes: 0,
    }
  }

  const currentData = snapshot.data() || {}
  const fields = issue.repairData.fields || {}
  const changedFields = Object.keys(fields).filter(field => (
    !sameValue(currentData[field], fields[field])
  ))

  if (!changedFields.length) {
    return {
      issueId: clean(issue.issueId),
      searchIndexDocumentId,
      projectionTarget,
      updated: true,
      changed: false,
      alreadyRepaired: true,
      changedFields: [],
      reads: 1,
      writes: 0,
    }
  }

  const updateData = changedFields.reduce((result, field) => {
    result[field] = fields[field]
    return result
  }, {})

  await trackedUpdateDoc(
    ref,
    {
      ...updateData,
      updatedAt: serverTimestamp(),
    },
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerScoutRepair-directSearchIndex',
      operationSubtype: 'repair-updateDoc',
    }
  )

  return {
    issueId: clean(issue.issueId),
    searchIndexDocumentId,
    projectionTarget,
    updated: true,
    changed: true,
    alreadyRepaired: false,
    changedFields,
    reads: 1,
    writes: 1,
  }
}

export const repairSearchIndexIssuesDirect = async ({
  issues = [],
} = {}) => {
  const safeIssues = (Array.isArray(issues) ? issues : [])
    .filter(canDirectRepairSearchIndexIssue)
  const groupedByDocument = new Map()

  safeIssues.forEach(issue => {
    const searchIndexDocumentId = clean(issue?.searchIndexDocumentId)
    if (!searchIndexDocumentId) return

    const current = groupedByDocument.get(searchIndexDocumentId) || {
      searchIndexDocumentId,
      issues: [],
    }
    current.issues.push(issue)
    groupedByDocument.set(searchIndexDocumentId, current)
  })

  const results = []

  for (const group of groupedByDocument.values()) {
    const groupIssues = group.issues
    const firstIssue = groupIssues[0]
    const projectionTarget = clean(firstIssue?.repairData?.writer) === 'DIRECT_TEAM_SEARCH_INDEX'
      ? 'teamSearchIndex'
      : 'playerSearchIndex'
    const ref = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      group.searchIndexDocumentId
    )
    const snapshot = await trackedGetDoc(ref, {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerScoutRepair-directSearchIndex',
      operationSubtype: 'repair-read',
    })

    if (!snapshot.exists()) {
      results.push({
        issueIds: groupIssues.map(issue => clean(issue.issueId)).filter(Boolean),
        searchIndexDocumentId: group.searchIndexDocumentId,
        projectionTarget,
        updated: false,
        skipped: true,
        reason: 'searchIndexDocumentMissing',
        reads: 1,
        writes: 0,
      })
      continue
    }

    const currentData = snapshot.data() || {}
    const mergedFields = groupIssues.reduce((result, issue) => ({
      ...result,
      ...(issue?.repairData?.fields || {}),
    }), {})
    const changedFields = Object.keys(mergedFields).filter(field => (
      !sameValue(currentData[field], mergedFields[field])
    ))

    if (!changedFields.length) {
      results.push({
        issueIds: groupIssues.map(issue => clean(issue.issueId)).filter(Boolean),
        searchIndexDocumentId: group.searchIndexDocumentId,
        projectionTarget,
        updated: true,
        changed: false,
        alreadyRepaired: true,
        changedFields: [],
        reads: 1,
        writes: 0,
      })
      continue
    }

    const updateData = changedFields.reduce((result, field) => {
      result[field] = mergedFields[field]
      return result
    }, {})

    await trackedUpdateDoc(
      ref,
      {
        ...updateData,
        updatedAt: serverTimestamp(),
      },
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScoutRepair-directSearchIndex',
        operationSubtype: 'repair-updateDoc',
      }
    )

    results.push({
      issueIds: groupIssues.map(issue => clean(issue.issueId)).filter(Boolean),
      searchIndexDocumentId: group.searchIndexDocumentId,
      projectionTarget,
      updated: true,
      changed: true,
      alreadyRepaired: false,
      changedFields,
      reads: 1,
      writes: 1,
    })
  }

  const unsupportedIssuesCount = (Array.isArray(issues) ? issues.length : 0) - safeIssues.length

  return {
    issuesCount: Array.isArray(issues) ? issues.length : 0,
    targetDocumentsCount: groupedByDocument.size,
    reads: results.reduce((sum, result) => sum + Number(result.reads || 0), 0),
    writes: results.reduce((sum, result) => sum + Number(result.writes || 0), 0),
    updatedCount: results.filter(result => result.changed === true).length,
    alreadyRepairedCount: results.filter(
      result => result.alreadyRepaired === true
    ).length,
    skippedCount:
      results.filter(result => result.skipped === true).length +
      Math.max(unsupportedIssuesCount, 0),
    results,
  }
}


export const repairPlayerSearchIndexIssueDirect = repairSearchIndexIssueDirect
export const repairPlayerSearchIndexIssuesDirect = repairSearchIndexIssuesDirect
