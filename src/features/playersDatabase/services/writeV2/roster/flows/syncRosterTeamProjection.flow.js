import {
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { applyApprovedLeagueTeamRosterPatch } from '../../../../domain/rosterV2/support/leagues/leagueTeamRoster.plan.js'

export async function syncRosterTeamProjectionV2({
  approvedTeamProjectionState = {},
} = {}) {
  const searchIndex = approvedTeamProjectionState.searchIndex || {}
  const league = approvedTeamProjectionState.league || {}

  if (!searchIndex.docId || !searchIndex.fields) {
    throw new Error('Missing approved Team SearchIndex state')
  }
  if (!league.leagueId || !league.target?.birthTeamDocumentId || !league.patch) {
    throw new Error('Missing approved League roster patch')
  }

  const searchIndexRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    searchIndex.docId
  )
  const leagueRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.leagues,
    league.leagueId
  )

  await runTransaction(db, async transaction => {
    const leagueSnapshot = await transaction.get(leagueRef)

    if (!leagueSnapshot.exists()) {
      throw new Error('Canonical League document was not found')
    }

    const canonicalLeague = {
      id: leagueSnapshot.id,
      ...leagueSnapshot.data(),
    }
    const projectedLeague = applyApprovedLeagueTeamRosterPatch({
      league: canonicalLeague,
      target: league.target,
      patch: league.patch,
    })

    transaction.set(
      searchIndexRef,
      {
        ...searchIndex.fields,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    transaction.set(
      leagueRef,
      {
        ...projectedLeague,
        updatedAt: serverTimestamp(),
      }
    )
  })

  return {
    teamSearchIndexUpdated: true,
    leagueRosterMetadataUpdated: true,
  }
}
