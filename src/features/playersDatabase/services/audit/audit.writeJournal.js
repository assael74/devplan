import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

export async function recordPlayersDatabaseWriteAction({ actionType = '', auditScope = null } = {}) {
  if (!actionType) return null
  const reference = await addDoc(collection(db, PLAYERS_DATABASE_COLLECTIONS.writeActions), {
    actionType,
    auditScope,
    completedAt: serverTimestamp(),
  })
  return reference.id
}
