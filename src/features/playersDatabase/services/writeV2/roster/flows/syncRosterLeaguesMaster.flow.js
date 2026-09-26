import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'

export async function syncRosterLeaguesMasterV2({
  approvedLeaguesMasterState = {},
} = {}) {
  const id = approvedLeaguesMasterState.id || 'all'
  const leagues = Array.isArray(approvedLeaguesMasterState.leagues)
    ? approvedLeaguesMasterState.leagues
    : null

  if (!leagues || !approvedLeaguesMasterState.summary) {
    throw new Error('Missing approved Leagues Master state')
  }

  await setDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, id),
    {
      id,
      docType: approvedLeaguesMasterState.docType || 'leagues_master',
      summary: approvedLeaguesMasterState.summary,
      leagues,
      updatedAt: serverTimestamp(),
    }
  )

  return {
    updated: true,
    leaguesCount: leagues.length,
  }
}
