// src/features/playersDatabase/services/write/stats/readStatsLoadSources.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { arrivalSourceDocumentId } from '../../../domain/movement/arrivalHistory.projection.js'
import {
  buildPlayerId,
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
      operationSubtype: 'write-prepare-getDoc',
    }
  )
  return snapshot.exists()
    ? { id: snapshot.id, ...(snapshot.data() || {}) }
    : null
}

const readPlayers = async ({ playerIds }) => {
  const rows = await Promise.all(playerIds.map(playerId => readDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots,
    documentId: playerId,
    action: 'write-stats-prepare-read-player-root',
  })))
  return Object.fromEntries(rows.filter(Boolean).map(row => [clean(row.id), row]))
}

const readPlayerSeasons = async ({ playerIds, seasonId }) => {
  const rows = await Promise.all(playerIds.map(async playerId => {
    const documentId = buildPlayerSeasonDocumentId({ playerId, seasonId })
    const row = await readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
      documentId,
      action: 'write-stats-prepare-read-player-season',
    })
    return [playerId, row]
  }))
  return Object.fromEntries(rows.filter(([, row]) => Boolean(row)))
}

export const readStatsLoadSources = async ({
  leagueId = '',
  teamId = '',
  seasonId = '',
  incomingPlayers = [],
} = {}) => {
  const resolvedLeagueId = clean(leagueId)
  const resolvedTeamId = clean(teamId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  if (!resolvedLeagueId) throw new Error('Missing leagueId for Stats Load')
  if (!resolvedTeamId) throw new Error('Missing teamId for Stats Load')

  const teamSeasonDocumentId = buildTeamSeasonDocumentId({
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
  })
  const [teamRoot, teamSeason, league, leaguesCenter, clubsCenter] = await Promise.all([
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots,
      documentId: resolvedTeamId,
      action: 'write-stats-prepare-read-team-root',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      documentId: teamSeasonDocumentId,
      action: 'write-stats-prepare-read-team-season',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
      documentId: resolvedLeagueId,
      action: 'write-stats-prepare-read-league',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter,
      documentId: 'all',
      action: 'write-stats-prepare-read-leagues-center',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
      documentId: resolvedSeasonId,
      action: 'write-stats-prepare-read-clubs-center',
    }),
  ])

  const teamSeasonIdentity = object(teamSeason && teamSeason.identity)
  const clubId = clean(teamSeasonIdentity.clubId)
  const rosterPlayersById = object(teamSeason && teamSeason.roster && teamSeason.roster.playersById)
  const statsPlayersById = object(teamSeason && teamSeason.stats && teamSeason.stats.playersById)
  const scoutingPlayersById = object(teamSeason && teamSeason.scouting && teamSeason.scouting.playersById)
  const birthYear = Number(teamSeasonIdentity.birthYear)
  const incomingPlayerIds = (Array.isArray(incomingPlayers) ? incomingPlayers : []).map(row => {
    const explicitPlayerId = clean(row && row.playerId)
    if (explicitPlayerId) return explicitPlayerId
    return buildPlayerId({ birthYear: Number(row && row.birthYear) || birthYear, externalPlayerId: clean(row && row.externalPlayerId) })
  })
  const playerIds = Array.from(new Set([
    ...Object.keys(rosterPlayersById),
    ...Object.keys(statsPlayersById),
    ...Object.keys(scoutingPlayersById),
    ...incomingPlayerIds,
  ].map(clean).filter(Boolean)))
  const counterpartDocumentIds = Array.from(new Set((Array.isArray(incomingPlayers) ? incomingPlayers : [])
    .filter(row => ['joined', 'left'].includes(clean(row && (row.statsMovementDecision || row.rosterStatus))))
    .map(row => {
      const movementTeam = object(row && row.statsMovementTeam)
      const movementTeamId = clean(movementTeam.teamId || movementTeam.birthTeamDocumentId || movementTeam.birthTeamId)
      return clean(movementTeam.teamSeasonDocumentId) || (movementTeamId ? buildTeamSeasonDocumentId({ teamId: movementTeamId, seasonId: resolvedSeasonId }) : '')
    })
    .filter(Boolean)))
  const historyDocumentIds = Array.from(new Set((Array.isArray(incomingPlayers) ? incomingPlayers : [])
    .filter(row => ['joined', 'left'].includes(clean(row && (row.statsMovementDecision || row.rosterStatus))))
    .map(row => {
      const decision = clean(row.statsMovementDecision || row.rosterStatus)
      const movementTeam = object(row.statsMovementTeam)
      const sourceTeamId = decision === 'joined'
        ? clean(movementTeam.teamId || movementTeam.birthTeamDocumentId || movementTeam.birthTeamId)
        : resolvedTeamId
      return arrivalSourceDocumentId({ teamId: sourceTeamId, seasonId: resolvedSeasonId })
    }).filter(Boolean)))
  const [playerRootsById, playerSeasonsById, counterpartRows, historyRows] = await Promise.all([
    readPlayers({ playerIds }),
    readPlayerSeasons({ playerIds, seasonId: resolvedSeasonId }),
    Promise.all(counterpartDocumentIds.map(documentId => readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      documentId,
      action: 'write-stats-prepare-read-counterpart-team-season',
    }))),
    Promise.all(historyDocumentIds.map(documentId => readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      documentId,
      action: 'write-stats-prepare-read-arrival-history',
    }))),
  ])

  const previousLeaguesCenterTeam = object(
    object(
      object(
        object(leaguesCenter).leaguesById
      )[resolvedLeagueId]
    ).seasonsById
  )[resolvedSeasonId]
  const previousLeagueTeam = object(object(previousLeaguesCenterTeam).teamsById)[resolvedTeamId] || null
  const previousClubsCenterTeam = object(
    object(
      object(object(clubsCenter).clubsById)[clubId]
    ).teamsById
  )[resolvedTeamId] || null

  return {
    teamRoot,
    teamSeason,
    league,
    playerRootsById,
    playerSeasonsById,
    previousLeaguesCenterTeam: previousLeagueTeam,
    previousClubsCenterTeam,
    existingCounterpartTeamSeasonsById: Object.fromEntries(counterpartRows.filter(Boolean).map(row => [clean(row.id), row])),
    sourceHistoryTeamSeasonsById: Object.fromEntries(historyRows.filter(Boolean).map(row => [clean(row.id), row])),
  }
}
