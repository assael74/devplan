// src/features/playersDatabase/services/writeV2/roster/clear/readClearRoster.js

import { collection, doc, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer, trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as C } from '../../../../constants/pdb.constants.js'
import { buildClearRosterIds, assertClearRosterDocumentId, sameClearRosterSeason } from '../../../../domain/rosterV2/clear/clearRosterIdentity.js'
import { getTeamSeasonStatsState } from '../../../../domain/statsV2/teamSeasonStatsState.js'
import { getTeamSeasonRosterState } from '../../../../domain/rosterV2/clear/rosterAbsent.builder.js'

export const CLEAR_ROSTER_COLLECTIONS = {
  teamSeason: C.teamSeasons,
  teamRoot: C.teams,
  playerIndex: C.searchIndexes,
  teamSearchIndex: C.searchIndexes,
  league: C.leagues,
  club: C.clubs,
  clubsMaster: C.clubsMaster,
  leaguesMaster: C.leaguesMaster,
}

const usage = collectionName => ({
  feature: 'playersDatabase', collection: collectionName,
  action: 'clear-roster-v2-read', operationSubtype: 'getFromServer',
})

export const readClearRosterDocument = async (kind, id) => {
  const collectionName = CLEAR_ROSTER_COLLECTIONS[kind]
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, assertClearRosterDocumentId(id)), usage(collectionName)
  )
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null
}

export const readClearRosterEligibility = async identity => {
  const ids = buildClearRosterIds(identity)
  const season = await readClearRosterDocument('teamSeason', ids.teamSeasonDocumentId)
  const absent = Boolean(
    season && season.birthTeamDocumentId === identity.birthTeamDocumentId &&
    season.seasonKey === identity.seasonKey && season.leagueId === identity.leagueId &&
    getTeamSeasonStatsState(season) === 'absent'
  )
  return absent
}

export const resolveNextTeamSeasonDeleteAction = ({ identity, season }) => {
  const validTarget = Boolean(
    season && season.birthTeamDocumentId === identity.birthTeamDocumentId &&
    season.seasonKey === identity.seasonKey && season.leagueId === identity.leagueId
  )
  if (!validTarget) return null

  if (getTeamSeasonStatsState(season) === 'present') return 'stats'

  return getTeamSeasonRosterState(season) === 'present' ? 'roster' : null
}

export const readNextTeamSeasonDeleteAction = async identity => {
  const ids = buildClearRosterIds(identity)
  const season = await readClearRosterDocument('teamSeason', ids.teamSeasonDocumentId)
  if (!season) return null

  return resolveNextTeamSeasonDeleteAction({ identity, season })
}

export const readClearRosterSources = async target => {
  const ids = buildClearRosterIds(target)
  const [teamRoot, teamSeason] = await Promise.all([
    readClearRosterDocument('teamRoot', target.birthTeamDocumentId),
    readClearRosterDocument('teamSeason', ids.teamSeasonDocumentId),
  ])
  if (!teamRoot || !teamSeason) throw new Error('Canonical Clear Roster target is missing')
  const identity = {
    birthTeamDocumentId: target.birthTeamDocumentId,
    seasonKey: target.seasonKey,
    leagueId: target.leagueId || teamSeason.leagueId,
  }
  const fullIds = buildClearRosterIds(identity)
  const [league, teamSearchIndex, club, clubsMaster, leaguesMaster, playerSnapshot, leagueSnapshot] = await Promise.all([
    readClearRosterDocument('league', identity.leagueId),
    readClearRosterDocument('teamSearchIndex', fullIds.teamSearchIndexId),
    readClearRosterDocument('club', teamRoot.clubId),
    readClearRosterDocument('clubsMaster', 'all'),
    readClearRosterDocument('leaguesMaster', 'all'),
    trackedGetDocsFromServer(query(collection(db, C.searchIndexes),
      where('entityType', '==', 'playerSeason'),
      where('birthTeamDocumentId', '==', identity.birthTeamDocumentId)
    ), usage(C.searchIndexes)),
    trackedGetDocsFromServer(collection(db, C.leagues), usage(C.leagues)),
  ])
  return {
    identity, teamRoot, teamSeason, league, teamSearchIndex, club, clubsMaster, leaguesMaster,
    playerIndexes: playerSnapshot.docs
      .map(row => ({ ...row.data(), id: row.id }))
      .filter(row => sameClearRosterSeason(row.seasonKey || row.seasonId, identity.seasonKey)),
    leagues: leagueSnapshot.docs.map(row => ({ ...row.data(), id: row.id })),
  }
}
