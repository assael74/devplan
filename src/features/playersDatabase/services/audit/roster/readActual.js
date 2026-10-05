// src/features/playersDatabase/services/audit/roster/readActual.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const list = value => Array.isArray(value) ? value : []

const readDocument = async ({ collectionName, documentId, action }) => {
  const id = clean(documentId)
  if (!id) return null
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, id),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDoc',
    }
  )
  return snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() || {}) } : null
}

const readRows = async ({ collectionName, documentIds, action }) => {
  const ids = Array.from(new Set(list(documentIds).map(clean).filter(Boolean)))
  const rows = await Promise.all(ids.map(documentId => readDocument({ collectionName, documentId, action })))
  return Object.fromEntries(rows.map((row, index) => [ids[index], row]))
}

export const readRosterAuditActual = async ({ approvedState = null } = {}) => {
  const state = object(approvedState)
  const counterpartIds = list(state.counterparts).map(row => row && row.documentId)
  const playerSeasonIds = list(state.playerSeasons).map(row => row && row.documentId)
  const searchState = object(state.playerSearchIndexes)
  const searchIndexIds = [
    ...list(searchState.upserts).map(row => row && row.documentId),
    ...list(searchState.deletes),
  ]

  const [teamRoot, teamSeason, league, leaguesCenter, clubsCenter, counterparts, playerSeasons, playerSearchIndexes] = await Promise.all([
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots, documentId: state.teamId, action: 'audit-roster-team-root' }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentId: state.teamSeasonDocumentId, action: 'audit-roster-team-season' }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues, documentId: state.leagueId, action: 'audit-roster-league' }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter, documentId: 'all', action: 'audit-roster-leagues-center' }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter, documentId: state.seasonId, action: 'audit-roster-clubs-center' }),
    readRows({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentIds: counterpartIds, action: 'audit-roster-counterpart' }),
    readRows({ collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons, documentIds: playerSeasonIds, action: 'audit-roster-player-season' }),
    readRows({ collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes, documentIds: searchIndexIds, action: 'audit-roster-player-search-index' }),
  ])

  return { teamRoot, teamSeason, league, leaguesCenter, clubsCenter, counterparts, playerSeasons, playerSearchIndexes }
}

export default readRosterAuditActual
