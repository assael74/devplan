// src/features/playersDatabase/services/write/audit/writeSystemAuditRepair.js

import { doc } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { SYSTEM_AUDIT_TARGETS } from '../../audit/system/contract.js'
import { sameRepairValue } from '../../audit/system/repair/repairValue.js'

const keyOf = item => `${item.target}/${item.documentId}`

const assertTarget = item => {
  if (
    !SYSTEM_AUDIT_TARGETS.includes(item.target)
    || !PLAYERS_DATABASE_COLLECTIONS[item.target]
    || typeof item.documentId !== 'string'
    || !item.documentId.trim()
    || item.documentId.includes('/')
    || item.before === undefined
  ) throw new Error('יעד התיקון אינו תקין.')
}

export const writeSystemAuditRepair = async ({ changes = [], guards = [] } = {}) => {
  if (!changes.length || changes.length > 400) {
    throw new Error('תיקון אחד חייב לכלול בין מסמך אחד ל־400 מסמכים. יש לצמצם את היקף התיקון.')
  }
  const keys = new Set()
  changes.forEach(change => {
    assertTarget(change)
    if (change.after === undefined || keys.has(keyOf(change))) {
      throw new Error('תוכנית התיקון כוללת יעד כפול או תוכן חסר.')
    }
    if (change.after !== null && (typeof change.after !== 'object' || Array.isArray(change.after))) {
      throw new Error('תוכן מסמך התיקון אינו תקין.')
    }
    keys.add(keyOf(change))
  })

  const reads = new Map()
  ;[...guards, ...changes].forEach(item => {
    assertTarget(item)
    const key = keyOf(item)
    if (reads.has(key) && !sameRepairValue(reads.get(key).before, item.before)) {
      throw new Error('מקורות התיקון אינם תואמים. יש להכין הצעה חדשה.')
    }
    reads.set(key, item)
  })

  return trackedRunTransaction(db, async transaction => {
    // Read every precondition before staging any write, including absent destinations.
    for (const item of reads.values()) {
      const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS[item.target], item.documentId)
      const snapshot = await transaction.get(reference)
      const current = snapshot.exists() ? snapshot.data() : null
      if (!sameRepairValue(current, item.before)) {
        throw new Error('הנתונים השתנו מאז הכנת התיקון. יש להציג ולאשר הצעה חדשה.')
      }
    }
    changes.forEach(change => {
      const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS[change.target], change.documentId)
      if (change.after === null) transaction.delete(reference)
      else transaction.set(reference, change.after)
    })
    return { writtenDocuments: changes.length }
  }, {
    feature: 'playersDatabase',
    action: 'repair-system-audit',
    operationSubtype: 'audit-repair-transaction',
  })
}
