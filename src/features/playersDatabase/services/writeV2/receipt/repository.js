// src/features/playersDatabase/services/writeV2/receipt/repository.js

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
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const receipts = () => collection(
  db,
  PLAYERS_DATABASE_COLLECTIONS.writeActionsV2
)

export function createWriteActionReceiptReferenceV2() {
  return doc(receipts())
}

export async function writeWriteActionReceiptV2({
  reference,
  receipt,
} = {}) {
  if (!reference) throw new Error('Missing WriteAction V2 reference')

  await setDoc(reference, {
    ...receipt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return reference.id
}

export async function patchWriteActionReceiptV2({
  receiptId = '',
  patch = {},
} = {}) {
  if (!receiptId) throw new Error('Missing WriteAction V2 receiptId')

  await updateDoc(
    doc(receipts(), receiptId),
    {
      ...patch,
      updatedAt: serverTimestamp(),
    }
  )

  return receiptId
}

export async function readWriteActionReceiptV2({
  receiptId = '',
} = {}) {
  if (!receiptId) return null

  const snapshot = await getDoc(doc(receipts(), receiptId))

  return snapshot.exists()
    ? {
        id: snapshot.id,
        ...snapshot.data(),
      }
    : null
}

export async function listRecentWriteActionReceiptsV2({ maxResults = 5 } = {}) {
  const resolvedLimit = Math.max(1, Math.min(Number(maxResults) || 5, 10))
  const snapshot = await getDocs(query(
    receipts(),
    orderBy('updatedAt', 'desc'),
    limit(resolvedLimit)
  ))

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }))
}
