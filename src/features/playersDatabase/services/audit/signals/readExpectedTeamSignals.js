// src/features/playersDatabase/services/audit/signals/readExpectedTeamSignals.js

import { collection, query, where } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../constants/pdb.constants.js'
import { readClubProfiles } from '../league/readActual.js'
import { buildExpectedTeamSignals } from './buildExpectedTeamSignals.js'

const usage = { feature: 'playersDatabase', action: 'audit-team-signal-sources' }
const documents = snapshot => snapshot.docs.map(row => ({ ...row.data(), id: row.id }))

export const readExpectedTeamSignals = async ({ clubIds = [] } = {}) => {
  const ids = [...new Set(clubIds.filter(Boolean))]
  if (!ids.length) return new Map()
  const [leagueSnapshot, ...teamSnapshots] = await Promise.all([
    trackedGetDocsFromServer(collection(db, collections.leagues), usage),
    ...ids.map(clubId => trackedGetDocsFromServer(query(
      collection(db, collections.teamSeasons), where('identity.clubId', '==', clubId),
    ), usage)),
  ])
  const teamSeasons = teamSnapshots.flatMap(documents)
  const profileIds = new Set(ids)
  teamSeasons.forEach(season => {
    const movement = season.movement || {}
    ;[...Object.values(movement.transfersInById || {}), ...Object.values(movement.transfersOutById || {})]
      .forEach(fact => [fact.fromClubId, fact.toClubId].filter(Boolean).forEach(id => profileIds.add(id)))
  })
  const profilesById = await readClubProfiles({ clubIds: [...profileIds] })
  return buildExpectedTeamSignals({
    leagues: documents(leagueSnapshot), teamSeasons, profilesById, clubIds: ids,
  })
}
