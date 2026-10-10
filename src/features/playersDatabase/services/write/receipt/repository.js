// src/features/playersDatabase/services/write/receipt/repository.js

import {
  collection,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  createTrackedWriteBatch,
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const receipts = () => collection(
  db,
  PLAYERS_DATABASE_COLLECTIONS.writeActions
)

const timestampMillis = value => {
  if (value && typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0
}

export const createWriteActionReference = () => doc(receipts())

export const writeWriteActionReceipt = async ({ reference, receipt } = {}) => {
  if (!reference) throw new Error('Missing WriteAction reference')

  await setDoc(reference, {
    ...receipt,
    timestamps: {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: null,
    },
  })

  return reference.id
}

export const patchWriteActionReceipt = async ({ receiptId = '', patch = {} } = {}) => {
  const id = String(receiptId || '').trim()
  if (!id) throw new Error('Missing WriteAction receipt id')

  await updateDoc(doc(receipts(), id), {
    ...patch,
    'timestamps.updatedAt': serverTimestamp(),
  })

  return id
}

export const readWriteActionReceipt = async ({ receiptId = '' } = {}) => {
  const id = String(receiptId || '').trim()
  if (!id) return null

  const snapshot = await trackedGetDocFromServer(
    doc(receipts(), id),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.writeActions,
      action: 'data-ops-read-write-action-receipt',
      operationSubtype: 'data-ops-getDoc',
    }
  )
  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

export const listWriteActionReceiptsByTargetKey = async ({ targetKey = '' } = {}) => {
  const key = String(targetKey || '').trim()
  if (!key) throw new Error('Missing WriteAction target key')

  const snapshot = await trackedGetDocsFromServer(
    query(receipts(), where('targetKey', '==', key)),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.writeActions,
      action: 'write-action-receipts-by-target',
      operationSubtype: 'receipt-getDocs',
    }
  )

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }))
}

export const listRecentWriteActionReceipts = async ({ maxResults = 20, fromDate = null } = {}) => {
  const resolvedLimit = Math.min(Math.max(Number(maxResults) || 20, 1), 50)
  const constraints = []
  if (fromDate instanceof Date && !Number.isNaN(fromDate.getTime())) {
    constraints.push(where('timestamps.updatedAt', '>=', fromDate))
  }
  constraints.push(orderBy('timestamps.updatedAt', 'desc'), limit(resolvedLimit))
  const snapshot = await trackedGetDocsFromServer(
    query(receipts(), ...constraints),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.writeActions,
      action: 'data-ops-list-recent-write-actions',
      operationSubtype: 'data-ops-getDocs',
    }
  )

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }))
}

export const listProblemWriteActionReceipts = async ({ maxResults = 20 } = {}) => {
  const resolvedLimit = Math.min(Math.max(Number(maxResults) || 20, 1), 50)
  const snapshot = await trackedGetDocsFromServer(
    query(
      receipts(),
      where('recoveryRequired', '==', true)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.writeActions,
      action: 'data-ops-list-problem-write-actions',
      operationSubtype: 'data-ops-getDocs',
    }
  )

  return snapshot.docs
    .map(document => ({ id: document.id, ...document.data() }))
    .sort((left, right) => (
      timestampMillis(right.timestamps && right.timestamps.updatedAt)
      - timestampMillis(left.timestamps && left.timestamps.updatedAt)
    ))
    .slice(0, resolvedLimit)
}

export const listOldClosedWriteActionReceipts = async ({ beforeDate, maxResults = 50 } = {}) => {
  if (!(beforeDate instanceof Date) || Number.isNaN(beforeDate.getTime())) {
    throw new Error('Missing valid receipt cleanup date')
  }
  const resolvedLimit = Math.min(Math.max(Number(maxResults) || 50, 1), 100)
  const snapshot = await trackedGetDocsFromServer(
    query(
      receipts(),
      where('timestamps.updatedAt', '<', beforeDate),
      orderBy('timestamps.updatedAt', 'asc'),
      limit(resolvedLimit)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.writeActions,
      action: 'data-ops-list-old-closed-write-actions',
      operationSubtype: 'data-ops-getDocs',
    }
  )

  return snapshot.docs
    .map(document => ({ id: document.id, ...document.data() }))
    .filter(receipt => (
      receipt.status === 'closed'
      && receipt.executionStatus === 'succeeded'
      && receipt.recoveryRequired !== true
    ))
}

export const deleteOldClosedWriteActionReceipts = async ({ receiptIds = [], beforeDate } = {}) => {
  if (!(beforeDate instanceof Date) || Number.isNaN(beforeDate.getTime())) {
    throw new Error('Missing valid receipt cleanup date')
  }
  const ids = Array.from(new Set(receiptIds.map(value => String(value || '').trim()).filter(Boolean)))
  if (!ids.length) throw new Error('No receipts selected for cleanup')
  if (ids.length > 100) throw new Error('Receipt cleanup is limited to 100 documents per action')

  const currentReceipts = await Promise.all(ids.map(receiptId => (
    readWriteActionReceipt({ receiptId })
  )))
  const beforeMillis = beforeDate.getTime()
  const eligible = currentReceipts.filter(receipt => (
    receipt
    && receipt.status === 'closed'
    && receipt.executionStatus === 'succeeded'
    && receipt.recoveryRequired !== true
    && timestampMillis(receipt.timestamps && receipt.timestamps.updatedAt) < beforeMillis
  ))
  if (eligible.length !== ids.length) {
    throw new Error('Receipt state changed. Reload the cleanup preview before deleting.')
  }

  const batch = createTrackedWriteBatch(db, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.writeActions,
    action: 'data-ops-delete-old-write-actions',
    operationSubtype: 'data-ops-cleanup-writeBatch',
  })
  eligible.forEach(receipt => batch.delete(doc(receipts(), receipt.id)))
  await batch.commit()

  return eligible.map(receipt => receipt.id)
}
