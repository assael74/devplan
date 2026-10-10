// src/features/playersDatabase/services/audit/stats/readActual.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

const readDocument = async ({ collectionName, documentId, action }) => {
  if (!clean(documentId)) return null
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, documentId),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDoc',
    }
  )
  return snapshot.exists()
    ? { id: snapshot.id, ...(snapshot.data() || {}) }
    : null
}

export const readStatsAuditActual = async ({
  leagueId = '',
  teamId = '',
  seasonId = '',
  counterpartDocumentIds = [],
  playerIds = [],
  scopedPlayerIds = [],
} = {}) => {
  const resolvedLeagueId = clean(leagueId)
  const resolvedTeamId = clean(teamId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const teamSeasonDocumentId = buildTeamSeasonDocumentId({ teamId: resolvedTeamId, seasonId: resolvedSeasonId })

  const [teamSeason, league, leaguesCenter, clubsCenter] = await Promise.all([
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      documentId: teamSeasonDocumentId,
      action: 'audit-stats-team-season',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
      documentId: resolvedLeagueId,
      action: 'audit-stats-league',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter,
      documentId: 'all',
      action: 'audit-stats-leagues-center',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
      documentId: resolvedSeasonId,
      action: 'audit-stats-clubs-center',
    }),
  ])

  const rosterPlayers = object(teamSeason && teamSeason.roster && teamSeason.roster.playersById)
  const requestedPlayerIds = Array.from(new Set(
    (Array.isArray(scopedPlayerIds) ? scopedPlayerIds : []).map(clean).filter(Boolean)
  ))
  const resolvedPlayerIds = requestedPlayerIds.length
    ? requestedPlayerIds
    : Array.from(new Set([
        ...Object.keys(rosterPlayers),
        ...(Array.isArray(playerIds) ? playerIds : []),
      ].map(clean).filter(Boolean)))
  const [playerRoots, playerSeasons, playerSearchIndexes, counterpartTeamSeasons] = await Promise.all([
    Promise.all(resolvedPlayerIds.map(playerId => readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots,
      documentId: playerId,
      action: 'audit-stats-player-root',
    }))),
    Promise.all(resolvedPlayerIds.map(playerId => readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
      documentId: buildPlayerSeasonDocumentId({ playerId, seasonId: resolvedSeasonId }),
      action: 'audit-stats-player-season',
    }))),
    Promise.all(resolvedPlayerIds.map(playerId => readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
      documentId: buildPlayerSearchIndexDocumentId({ playerId, teamSeasonDocumentId }),
      action: 'audit-stats-player-search-index',
    }))),
    Promise.all(counterpartDocumentIds.map(documentId => readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      documentId,
      action: 'audit-stats-counterpart-team-season',
    }))),
  ])

  return {
    teamSeason,
    league,
    leaguesCenter,
    clubsCenter,
    playerRootsById: Object.fromEntries(playerRoots.filter(Boolean).map(row => [clean(row.id), row])),
    playerSeasonsById: Object.fromEntries(playerSeasons.filter(Boolean).map(row => [clean(row.identity && row.identity.playerId), row])),
    playerSearchIndexesById: Object.fromEntries(playerSearchIndexes.filter(Boolean).map(row => [clean(row.playerId), row])),
    counterpartTeamSeasonsById: Object.fromEntries(
      counterpartTeamSeasons.filter(Boolean).map(row => [clean(row.id), row])
    ),
  }
}
