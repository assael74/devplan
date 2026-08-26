// src/features/playersDatabase/services/audit/repair/repair.verify.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

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

const collectChangedDocumentIds = applyResult => new Set(
  (Array.isArray(applyResult?.directSearchIndex?.results)
    ? applyResult.directSearchIndex.results
    : [])
    .filter(result => result?.changed === true)
    .map(result => clean(result?.searchIndexDocumentId))
    .filter(Boolean)
)

const groupExpectedFieldsByDocument = ({ issues, documentIds }) => {
  const groups = new Map()

  ;(Array.isArray(issues) ? issues : []).forEach(issue => {
    const documentId = clean(issue?.searchIndexDocumentId)
    if (!documentId || !documentIds.has(documentId)) return

    const fields = issue?.repairData?.fields
    if (!fields || typeof fields !== 'object') return

    const current = groups.get(documentId) || {
      documentId,
      issueIds: [],
      expectedFields: {},
    }

    current.issueIds.push(clean(issue?.issueId))

    Object.entries(fields).forEach(([field, value]) => {
      if (
        Object.prototype.hasOwnProperty.call(current.expectedFields, field) &&
        !sameValue(current.expectedFields[field], value)
      ) {
        throw new Error(
          'האימות מצא ערכים סותרים לאותו שדה באותו אינדקס.'
        )
      }

      current.expectedFields[field] = value
    })

    groups.set(documentId, current)
  })

  return [...groups.values()]
}

export async function verifyPlayerDatabaseRepair({
  issues = [],
  applyResult,
} = {}) {
  const changedDocumentIds = collectChangedDocumentIds(applyResult)
  const groups = groupExpectedFieldsByDocument({
    issues,
    documentIds: changedDocumentIds,
  })
  const results = []

  for (const group of groups) {
    const ref = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      group.documentId
    )
    const snapshot = await trackedGetDoc(ref, {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerDatabaseAuditV2-verifyRepair',
      operationSubtype: 'verification-read',
    })

    if (!snapshot.exists()) {
      results.push({
        documentId: group.documentId,
        issueIds: group.issueIds,
        verified: false,
        reason: 'documentMissingAfterRepair',
        mismatchedFields: Object.keys(group.expectedFields),
        reads: 1,
      })
      continue
    }

    const data = snapshot.data() || {}
    const mismatchedFields = Object.keys(group.expectedFields).filter(field => (
      !sameValue(data[field], group.expectedFields[field])
    ))

    results.push({
      documentId: group.documentId,
      issueIds: group.issueIds,
      verified: mismatchedFields.length === 0,
      reason: mismatchedFields.length
        ? 'fieldsStillMismatch'
        : '',
      mismatchedFields,
      reads: 1,
    })
  }

  const changedDocumentsCount = changedDocumentIds.size
  const verifiedCount = results.filter(result => result.verified === true).length
  const failedCount = results.filter(result => result.verified !== true).length
  const alreadyVerifiedCount = Number(
    applyResult?.directSearchIndex?.alreadyRepairedCount || 0
  ) + Number(applyResult?.freshResolvedCount || 0)

  return {
    executed: groups.length > 0,
    changedDocumentsCount,
    checkedDocumentsCount: results.length,
    verifiedCount,
    alreadyVerifiedCount,
    failedCount,
    reads: results.reduce(
      (sum, result) => sum + Number(result.reads || 0),
      0
    ),
    complete: failedCount === 0,
    results,
  }
}
