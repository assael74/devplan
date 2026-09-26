import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildApprovedRosterCanonicalState,
  buildRosterTeamRoot,
} from '../../../../domain/builders/teamRosterCanonical.builder.js'
import { countCurrentRosterPlayers } from '../../../../model/team/rosterStatus.model.js'
import { buildCleanApprovedRosterState } from '../../../../domain/builders/approvedRosterState.builder.js'

export async function writeRosterV2({
  team = {},
  persistedSeason = {},
} = {}) {
  const cleanPersistedSeason = buildCleanApprovedRosterState({ persistedSeason }).persistedSeason || {}
  const approved = buildApprovedRosterCanonicalState({
    team,
    persistedSeason: cleanPersistedSeason,
  })
  const createdAt = serverTimestamp()
  const updatedAt = serverTimestamp()
  const rootRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teams,
    approved.birthTeamDocumentId
  )
  const seasonRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    approved.teamSeasonDocumentId
  )

  return trackedRunTransaction(db, async transaction => {
    const rootSnapshot = await transaction.get(rootRef)
    const currentRoot = rootSnapshot.exists()
      ? rootSnapshot.data() || {}
      : {}
    const nextRoot = buildRosterTeamRoot({
      team: {
        ...team,
        birthTeamDocumentId: approved.birthTeamDocumentId,
      },
      currentData: currentRoot,
      persistedSeason: approved.persistedSeason,
      createdAt,
      updatedAt,
    })

    transaction.set(rootRef, nextRoot)
    transaction.set(seasonRef, {
      ...approved.persistedSeason,
      updatedAt,
    })

    return {
      birthTeamDocumentId: approved.birthTeamDocumentId,
      teamDocumentId: approved.birthTeamDocumentId,
      teamSeasonDocumentId: approved.teamSeasonDocumentId,
      seasonKey: approved.seasonKey,
      createdTeam: !rootSnapshot.exists(),
      playersCount: countCurrentRosterPlayers(
        approved.persistedSeason.teamPlayers
      ),
      movementState: {
        transfersIn: approved.persistedSeason.transfersIn || [],
        transfersOut: approved.persistedSeason.transfersOut || [],
        pendingPlayers: approved.persistedSeason.pendingPlayers || [],
      },
      teamBalance: approved.persistedSeason.teamBalance || null,
    }
  }, {
    feature: 'playersDatabase',
    action: 'roster-v2-write-canonical',
    collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
  })
}
