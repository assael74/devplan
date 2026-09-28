// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsPlayerIndexes.flow.js

import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'
import {
  pickOwnedFields,
  STATS_PLAYER_INDEX_OWNED_FIELDS,
} from '../support/statsProjectionOwnership.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const assertApproved = approved => {
  if (approved?.planType !== 'approvedStatsState' || approved?.planVersion !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Invalid Approved Stats State')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }
}

const CREATE_WRITE_METADATA_FIELDS = new Set([
  'updatedAt',
  'lastWriteAction',
  'lastWriteAt',
])
const CREATE_CATALOG_FIELDS = Object.keys(SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT)
  .filter(key => !CREATE_WRITE_METADATA_FIELDS.has(key))
const CREATE_CATALOG_FIELD_SET = new Set(CREATE_CATALOG_FIELDS)

const validateCreateFields = ({ docId, fields }) => {
  const value = fields && typeof fields === 'object' && !Array.isArray(fields)
    ? fields
    : {}
  const keys = Object.keys(value)
  const hasUnknownField = keys.some(key => !CREATE_CATALOG_FIELD_SET.has(key))
  const hasMissingField = CREATE_CATALOG_FIELDS.some(key => !Object.prototype.hasOwnProperty.call(value, key))

  if (
    hasUnknownField ||
    hasMissingField ||
    clean(value.id) !== docId ||
    clean(value.entityId) !== docId ||
    clean(value.entityType) !== 'playerSeason' ||
    !clean(value.displayName) ||
    !clean(value.seasonKey) ||
    !clean(value.birthTeamDocumentId)
  ) {
    const error = new Error('Player SearchIndex create payload does not match Catalog')
    error.code = 'STATS_PLAYER_INDEX_CREATE_INVALID'
    throw error
  }

  return value
}

export async function syncStatsPlayerIndexesV2({ approved } = {}) {
  assertApproved(approved)
  const states = Array.isArray(approved.playerSearchIndexStates)
    ? approved.playerSearchIndexStates
    : []
  const seen = new Set()
  const prepared = states.map(state => {
    const docId = clean(state?.docId)
    const action = clean(state?.action)

    if (!docId || seen.has(docId)) {
      const error = new Error('Player SearchIndex identity must be unique and complete')
      error.code = 'STATS_PLAYER_INDEX_IDENTITY_INVALID'
      throw error
    }
    seen.add(docId)

    if (!['create', 'update'].includes(action)) {
      const error = new Error('Player SearchIndex action must be create or update')
      error.code = 'STATS_PLAYER_INDEX_ACTION_INVALID'
      throw error
    }

    const fields = action === 'create'
      ? validateCreateFields({ docId, fields: state?.fields })
      : pickOwnedFields({
          fields: state?.fields,
          allowed: STATS_PLAYER_INDEX_OWNED_FIELDS,
          code: 'STATS_PLAYER_INDEX_SCOPE_INVALID',
        })

    return {
      ref: doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, docId),
      fields,
    }
  })

  for (const item of prepared) {
    await setDoc(item.ref, {
      ...item.fields,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  return {
    totalCount: prepared.length,
    writtenCount: prepared.length,
    skippedCount: 0,
  }
}
