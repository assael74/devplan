// src/features/playersDatabase/services/write/receipt/repository.js

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const receipts = () => collection(
  db,
  PLAYERS_DATABASE_COLLECTIONS.writeActions
)

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

  const snapshot = await getDoc(doc(receipts(), id))
  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

export const listWriteActionReceiptsByTargetKey = async ({ targetKey = '' } = {}) => {
  const key = String(targetKey || '').trim()
  if (!key) throw new Error('Missing WriteAction target key')

  const snapshot = await getDocs(query(
    receipts(),
    where('targetKey', '==', key)
  ))

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }))
}

export const listRecentWriteActionReceipts = async ({ maxResults = 20 } = {}) => {
  const resolvedLimit = Math.min(Math.max(Number(maxResults) || 20, 1), 50)
  const snapshot = await getDocs(query(
    receipts(),
    orderBy('timestamps.updatedAt', 'desc'),
    limit(resolvedLimit)
  ))

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }))
}
