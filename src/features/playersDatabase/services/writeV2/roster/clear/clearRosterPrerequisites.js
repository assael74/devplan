// src/features/playersDatabase/services/writeV2/roster/clear/clearRosterPrerequisites.js

import { collection, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as C } from '../../../../constants/pdb.constants.js'
import { sameClearRosterSeason } from '../../../../domain/rosterV2/clear/clearRosterIdentity.js'

const usage = {
  feature: 'playersDatabase', collection: C.writeActionsV2,
  action: 'clear-roster-prerequisites', operationSubtype: 'getFromServer',
}

export const findOpenClearRosterReceipt = async identity => {
  const snapshot = await trackedGetDocsFromServer(query(
    collection(db, C.writeActionsV2), where('flowType', '==', 'roster')
  ), usage)
  const matches = snapshot.docs
    .map(row => ({ ...row.data(), id: row.id }))
    .filter(receipt => (
      receipt.flowType === 'roster' && receipt.operationType === 'clear' && receipt.status === 'open' &&
      receipt.auditTarget?.birthTeamDocumentId === identity.birthTeamDocumentId &&
      sameClearRosterSeason(receipt.auditTarget?.seasonKey, identity.seasonKey)
    ))
  if (matches.length > 1) throw new Error('Multiple open Clear Roster receipts require review')
  // Reuse pending, reported and failed_or_unknown alike: no status proves that
  // canonical writes did not happen. No abandonment or rollback on Retry.
  return matches[0]?.id || ''
}
