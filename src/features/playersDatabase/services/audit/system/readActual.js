// src/features/playersDatabase/services/audit/system/readActual.js

import { collection } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { SYSTEM_AUDIT_TARGET, SYSTEM_AUDIT_TARGETS } from './contract.js'

const readCollection = async (collectionName, action) => {
  const snapshot = await trackedGetDocsFromServer(
    collection(db, collectionName),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDocsFromServer',
    }
  )

  return snapshot.docs.map(row => ({
    id: row.id,
    data: row.data() || {},
  }))
}

const READ_TARGETS = Object.freeze({
  [SYSTEM_AUDIT_TARGET.TEAM_ROOTS]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots,
    action: 'audit-system-team-roots',
  },
  [SYSTEM_AUDIT_TARGET.TEAM_SEASONS]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    action: 'audit-system-team-seasons',
  },
  [SYSTEM_AUDIT_TARGET.PLAYER_ROOTS]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots,
    action: 'audit-system-player-roots',
  },
  [SYSTEM_AUDIT_TARGET.PLAYER_SEASONS]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
    action: 'audit-system-player-seasons',
  },
  [SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
    action: 'audit-system-player-search-indexes',
  },
  [SYSTEM_AUDIT_TARGET.LEAGUES]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
    action: 'audit-system-leagues',
  },
  [SYSTEM_AUDIT_TARGET.CLUB_PROFILES]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
    action: 'audit-system-club-profiles',
  },
  [SYSTEM_AUDIT_TARGET.LEAGUES_CENTER]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter,
    action: 'audit-system-leagues-center',
  },
  [SYSTEM_AUDIT_TARGET.CLUBS_CENTER]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
    action: 'audit-system-clubs-center',
  },
  [SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsDirectory,
    action: 'audit-system-clubs-directory',
  },
})

export const readSystemAuditActual = async ({ targets = SYSTEM_AUDIT_TARGETS } = {}) => {
  const selectedTargets = SYSTEM_AUDIT_TARGETS.filter(target => targets.includes(target))
  const entries = await Promise.all(selectedTargets.map(async target => {
    const definition = READ_TARGETS[target]
    const rows = await readCollection(definition.collectionName, definition.action)
    return [target, rows]
  }))
  const actual = Object.fromEntries(
    SYSTEM_AUDIT_TARGETS.map(target => [target, []])
  )

  entries.forEach(([target, rows]) => {
    actual[target] = rows
  })

  return actual
}
