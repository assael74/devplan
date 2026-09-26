import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc, trackedGetDocs } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const readDoc = async (collectionName, id, action) => {
  const snapshot = await trackedGetDoc(doc(db, collectionName, id), {
    feature: 'playersDatabase',
    collection: collectionName,
    action,
    operationSubtype: 'audit-getDoc',
  })
  return snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() || {}) } : null
}

const readByLeague = async (collectionName, leagueId, action) => {
  const snapshot = await trackedGetDocs(
    query(collection(db, collectionName), where('leagueId', '==', leagueId)),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDocs',
    }
  )
  return snapshot.docs.map(item => ({ id: item.id, ...(item.data() || {}) }))
}

export const getExpectedClubDocumentIds = expected => Array.from(new Set(
  (expected?.clubs || [])
    .map(item => String(item?.clubId || '').trim())
    .filter(Boolean)
))

export async function readActualLeagueAuditV2({ expected = {}, leagueId = '', seasonKey = '' } = {}) {
  const teamRoots = []
  const teamSeasons = []
  const teamSearchIndexes = []

  for (const team of expected.teams || []) {
    const [root, season, index] = await Promise.all([
      readDoc(
        PLAYERS_DATABASE_COLLECTIONS.teams,
        team.teamDocumentId,
        'audit-v2-league-read-team-root'
      ),
      readDoc(
        PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        team.teamSeasonDocumentId,
        'audit-v2-league-read-team-season'
      ),
      readDoc(
        PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        (expected.teamSearchIndexes || []).find(item => item.teamId === team.teamId)?.id,
        'audit-v2-league-read-team-search-index'
      ),
    ])
    teamRoots.push({ teamId: team.teamId, document: root })
    teamSeasons.push({ teamId: team.teamId, document: season })
    teamSearchIndexes.push({ teamId: team.teamId, document: index })
  }

  const expectedClubIds = getExpectedClubDocumentIds(expected)
  const clubsPromise = Promise.all(expectedClubIds.map(clubId => readDoc(
    PLAYERS_DATABASE_COLLECTIONS.clubs,
    clubId,
    'audit-v2-league-read-expected-club'
  )))

  const [scopedTeamSeasons, scopedIndexes, clubs, identity, leaguesMaster, clubsMaster] = await Promise.all([
    readByLeague(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      leagueId,
      'audit-v2-league-list-team-seasons'
    ),
    readByLeague(
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      leagueId,
      'audit-v2-league-list-search-indexes'
    ),
    clubsPromise,
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      expected.identity?.documentId,
      'audit-v2-league-read-identity'
    ),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.leaguesMaster,
      'all',
      'audit-v2-league-read-leagues-master'
    ),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      'all',
      'audit-v2-league-read-clubs-master'
    ),
  ])

  return {
    teamRoots,
    teamSeasons,
    teamSearchIndexes,
    scopedTeamSeasons: scopedTeamSeasons.filter(item => String(item.seasonKey || '') === String(seasonKey)),
    scopedIndexes: scopedIndexes.filter(item => String(item.seasonKey || '') === String(seasonKey)),
    clubs: clubs.filter(Boolean),
    identity,
    leaguesMaster,
    clubsMaster,
  }
}
