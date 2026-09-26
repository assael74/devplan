import {
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'
import { cleanValue } from '../../../../model/shared/value.model.js'

export async function syncRosterCounterpartsV2({
  approvedCounterpartStates = [],
} = {}) {
  const states = Array.isArray(approvedCounterpartStates)
    ? approvedCounterpartStates
    : []

  if (!states.length) return { updatedCount: 0 }

  const batch = writeBatch(db)
  let updatedCount = 0

  states.forEach(state => {
    const birthTeamDocumentId = cleanValue(state.birthTeamDocumentId)
    const seasonKey = cleanValue(state.seasonKey)
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(
      birthTeamDocumentId,
      seasonKey
    )

    if (!teamSeasonDocumentId) return

    batch.update(doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      teamSeasonDocumentId
    ), {
      transfersIn: Array.isArray(state.transfersIn) ? state.transfersIn : [],
      transfersOut: Array.isArray(state.transfersOut) ? state.transfersOut : [],
      pendingPlayers: Array.isArray(state.pendingPlayers) ? state.pendingPlayers : [],
      updatedAt: serverTimestamp(),
    })

    updatedCount += 1
  })

  await batch.commit()
  return { updatedCount }
}
