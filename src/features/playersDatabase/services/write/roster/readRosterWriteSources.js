// src/features/playersDatabase/services/write/roster/readRosterWriteSources.js

import {
  collection,
  doc,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { previousRosterSeasonRef } from '../../../domain/roster/rosterHistory.js'
import { normalizeDecisionTeam } from '../../../domain/roster/rosterWritePlan.builder.js'
import {
  buildPlayerId,
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const map = value => object(value)
const list = value => Array.isArray(value) ? value : []
const unique = values => Array.from(new Set(values.map(clean).filter(Boolean)))

const readDocument = async ({ collectionName, documentId }) => {
  const id = clean(documentId)
  if (!id) return null
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, id),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action: 'write-roster-prepare-read',
      operationSubtype: 'write-prepare-getDoc',
    }
  )
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

const readDocumentsByIds = async ({ collectionName, documentIds }) => {
  const rows = await Promise.all(unique(documentIds).map(async documentId => {
    const row = await readDocument({ collectionName, documentId })
    return row ? [documentId, row] : null
  }))
  return Object.fromEntries(rows.filter(Boolean))
}

const resolveIncomingPlayerIds = ({ players, birthYear }) => list(players).map(player => {
  const source = object(player)
  const externalPlayerId = clean(source.externalPlayerId)
  const expected = buildPlayerId({ birthYear, externalPlayerId })
  const playerId = clean(source.playerId) || expected
  if (playerId !== expected) throw new Error('Roster player identity mismatch')
  return playerId
})

const findClubsCenterTeam = ({ clubsCenter, teamId }) => {
  const matches = []
  Object.entries(map(clubsCenter && clubsCenter.clubsById)).forEach(([clubId, club]) => {
    const team = map(club && club.teamsById)[teamId]
    if (team) matches.push({ clubId, team })
  })
  if (matches.length > 1) throw new Error('Duplicate ClubsCenter Team projection')
  return matches[0] || null
}

const readCenters = async ({ leagueId, seasonId, teamId }) => {
  const [leaguesCenter, clubsCenter] = await Promise.all([
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter, documentId: 'all' }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter, documentId: seasonId }),
  ])
  const leagueCenterSeason = object(
    map(object(map(leaguesCenter && leaguesCenter.leaguesById)[leagueId]).seasonsById)[seasonId]
  )
  return {
    clubsCenterDocument: clubsCenter,
    previousLeaguesCenterTeamsById: map(leagueCenterSeason.teamsById),
    previousLeaguesCenterTeamProjection: map(leagueCenterSeason.teamsById)[teamId] || null,
    previousClubsCenterTeamProjection: findClubsCenterTeam({ clubsCenter, teamId })?.team || null,
  }
}

const readCounterpartProjectionSources = async ({
  teamSeasonsById,
  currentLeague,
  currentClubProfile,
  currentClubsCenter,
} = {}) => {
  const teamSeasons = Object.values(map(teamSeasonsById))
  const leagueIds = unique(teamSeasons.map(row => clean(row && row.identity && row.identity.leagueId)))
  const clubIds = unique(teamSeasons.map(row => clean(row && row.identity && row.identity.clubId)))
  const seasonIds = unique(teamSeasons.map(row => clean(row && row.identity && row.identity.seasonId)))
  const currentLeagueId = clean(currentLeague && (currentLeague.leagueId || currentLeague.id))
  const currentClubId = clean(currentClubProfile && (currentClubProfile.clubId || currentClubProfile.id))
  const currentSeasonId = clean(currentClubsCenter && (currentClubsCenter.seasonId || currentClubsCenter.id))

  const [leagueRows, clubRows, centerRows] = await Promise.all([
    readDocumentsByIds({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
      documentIds: leagueIds.filter(id => id !== currentLeagueId),
    }),
    readDocumentsByIds({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
      documentIds: clubIds.filter(id => id !== currentClubId),
    }),
    readDocumentsByIds({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
      documentIds: seasonIds.filter(id => id !== currentSeasonId),
    }),
  ])
  if (currentLeagueId) leagueRows[currentLeagueId] = currentLeague
  if (currentClubId) clubRows[currentClubId] = currentClubProfile
  if (currentSeasonId) centerRows[currentSeasonId] = currentClubsCenter

  return Object.fromEntries(teamSeasons.map(teamSeason => {
    const identity = object(teamSeason && teamSeason.identity)
    const documentId = clean(identity.teamSeasonDocumentId || teamSeason.id)
    const teamId = clean(identity.teamId)
    const leagueId = clean(identity.leagueId)
    const clubId = clean(identity.clubId)
    const seasonId = requireSeasonId(identity.seasonId)
    const league = object(leagueRows[leagueId])
    const season = object(map(league.seasonsById)[seasonId])
    const teamRow = object(map(season.table && season.table.teamsById)[teamId])
    const clubProfile = object(clubRows[clubId])
    const previous = findClubsCenterTeam({
      clubsCenter: centerRows[seasonId],
      teamId,
    })

    if (!documentId || !Object.keys(teamRow).length || !Object.keys(clubProfile).length) {
      throw new Error('Missing canonical source for counterpart ClubsCenter projection')
    }

    return [documentId, {
      league,
      season,
      teamRow,
      clubProfile,
      previousTeamProjection: previous ? previous.team : null,
    }]
  }))
}

const readCounterparts = async counterpartRequests => {
  const documentIds = list(counterpartRequests).map(row => clean(row && row.teamSeasonDocumentId))
  return readDocumentsByIds({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    documentIds,
  })
}

const collectCanonicalCounterpartDocumentIds = teamSeason => {
  const movement = object(teamSeason && teamSeason.movement)
  const currentDocumentId = clean(
    teamSeason && teamSeason.identity && teamSeason.identity.teamSeasonDocumentId
  )
  const documentIds = [
    ...Object.values(map(movement.transfersInById))
      .map(fact => clean(fact && fact.fromTeamSeasonDocumentId)),
    ...Object.values(map(movement.transfersOutById))
      .map(fact => clean(fact && fact.toTeamSeasonDocumentId)),
  ]
  return unique(documentIds.filter(documentId => documentId !== currentDocumentId))
}

export const readRosterLoadSources = async ({ input = {} } = {}) => {
  const source = object(input)
  const team = object(source.team)
  const season = object(source.season)
  const seasonId = requireSeasonId(season.seasonId)
  const birthYear = Number(team.birthYear || season.birthYear)
  const teamId = buildTeamId({
    clubId: team.clubId,
    birthYear,
    teamSlot: team.teamSlot,
  })
  const teamSeasonDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })
  const leagueId = clean(source.leagueId || season.leagueId)
  if (!leagueId) throw new Error('Missing leagueId')

  const [existingTeamRoot, existingTeamSeason, league] = await Promise.all([
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots, documentId: teamId }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentId: teamSeasonDocumentId }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues, documentId: leagueId }),
  ])
  if (!league) throw new Error('Canonical League document was not found')

  const previousRef = previousRosterSeasonRef({ teamRoot: existingTeamRoot, seasonId })
  const previousTeamSeason = list(source.participantDecisions).length && previousRef
    ? await readDocument({
        collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        documentId: buildTeamSeasonDocumentId({ teamId, seasonId: previousRef.seasonId }),
      })
    : null

  const leagueSeason = object(map(league.seasonsById)[seasonId])
  const teamRow = object(map(leagueSeason.table && leagueSeason.table.teamsById)[teamId])
  if (!Object.keys(teamRow).length) throw new Error('Team row was not found in canonical League season')
  const clubId = clean(teamRow.clubId || team.clubId)

  const clubProfile = await readDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
    documentId: clubId,
  })
  if (!clubProfile) throw new Error('Canonical ClubProfile was not found')

  const incomingPlayerIds = resolveIncomingPlayerIds({ players: source.players, birthYear })
  const existingPlayerIds = Object.keys(object(existingTeamSeason && existingTeamSeason.roster && existingTeamSeason.roster.playersById))
  const affectedPlayerIds = unique([...incomingPlayerIds, ...existingPlayerIds])
  const playerSeasonDocumentIds = affectedPlayerIds.map(playerId => buildPlayerSeasonDocumentId({ playerId, seasonId }))

  const [playerRootsById, playerSeasonRowsById, existingCounterpartTeamSeasonsById, centers] = await Promise.all([
    readDocumentsByIds({ collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots, documentIds: affectedPlayerIds }),
    readDocumentsByIds({ collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons, documentIds: playerSeasonDocumentIds }),
    readCounterparts([
      ...list(source.counterpartRequests),
      ...list(source.participantDecisions)
        .filter(row => ['joined', 'left'].includes(clean(row.decision || row.statsMovementDecision)))
        .map(row => normalizeDecisionTeam({ value: row.team || row.statsMovementTeam, seasonId }))
        .filter(Boolean),
    ]),
    readCenters({ leagueId, seasonId, teamId }),
  ])
  const counterpartProjectionSourcesByDocumentId = await readCounterpartProjectionSources({
    teamSeasonsById: existingCounterpartTeamSeasonsById,
    currentLeague: league,
    currentClubProfile: clubProfile,
    currentClubsCenter: centers.clubsCenterDocument,
  })

  const existingPlayerSeasonsById = {}
  Object.entries(playerSeasonRowsById).forEach(([_documentId, row]) => {
    const playerId = clean(row.identity && row.identity.playerId)
    if (playerId) existingPlayerSeasonsById[playerId] = row
  })

  return {
    existingTeamRoot,
    existingTeamSeason,
    previousTeamSeason,
    league,
    clubProfile,
    playerRootsById,
    existingPlayerSeasonsById,
    existingCounterpartTeamSeasonsById,
    counterpartProjectionSourcesByDocumentId,
    ...centers,
  }
}

const readRosterSearchIndexes = async ({ playerIds, teamSeasonDocumentId }) => {
  const documentIds = unique(playerIds).map(playerId => (
    buildPlayerSearchIndexDocumentId({ playerId, teamSeasonDocumentId })
  ))
  const rowsById = await readDocumentsByIds({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
    documentIds,
  })
  return Object.values(rowsById)
}

const readRosterPlayerSeasonsByTeam = async ({ teamId }) => {
  const snapshot = await trackedGetDocsFromServer(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.playerSeasons),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
      action: 'write-roster-clear-read-player-seasons',
      operationSubtype: 'write-prepare-getDocs',
    }
  )
  return Object.fromEntries(snapshot.docs
    .map(item => [item.id, { id: item.id, ...item.data() }])
    .filter(([, row]) => Object.prototype.hasOwnProperty.call(object(row.teamsById), teamId)))
}

export const readRosterClearSources = async ({
  input = {},
  includeCounterparts = false,
} = {}) => {
  const source = object(input)
  const teamId = clean(source.teamId)
  const seasonId = requireSeasonId(source.seasonId)
  const leagueId = clean(source.leagueId)
  if (!teamId || !leagueId) throw new Error('Missing Roster Clear target identity')
  const teamSeasonDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })

  const [existingTeamRoot, existingTeamSeason, league, centers] = await Promise.all([
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamRoots, documentId: teamId }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentId: teamSeasonDocumentId }),
    readDocument({ collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues, documentId: leagueId }),
    readCenters({ leagueId, seasonId, teamId }),
  ])
  if (!league) throw new Error('Canonical League document was not found')

  const season = object(map(league.seasonsById)[seasonId])
  const teamRow = object(map(season.table && season.table.teamsById)[teamId])
  if (!Object.keys(teamRow).length) throw new Error('Team row was not found in canonical League season')
  const clubId = clean(teamRow.clubId)
  const clubProfile = await readDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
    documentId: clubId,
  })
  if (!clubProfile) throw new Error('Canonical ClubProfile was not found')

  const canonicalPlayerIds = unique(
    Object.keys(object(existingTeamSeason && existingTeamSeason.roster && existingTeamSeason.roster.playersById))
  )
  const playerSeasonRowsById = existingTeamSeason
    ? await readDocumentsByIds({
        collectionName: PLAYERS_DATABASE_COLLECTIONS.playerSeasons,
        documentIds: canonicalPlayerIds.map(playerId => (
          buildPlayerSeasonDocumentId({ playerId, seasonId })
        )),
      })
    : await readRosterPlayerSeasonsByTeam({ teamId })
  const recoveredPlayerIds = Object.values(playerSeasonRowsById)
    .map(row => clean(row.identity && row.identity.playerId))
  const playerIds = unique([...canonicalPlayerIds, ...recoveredPlayerIds])
  const [
    playerRootsById,
    existingPlayerSearchIndexes,
    existingCounterpartTeamSeasonsById,
  ] = await Promise.all([
    readDocumentsByIds({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.playerRoots,
      documentIds: playerIds,
    }),
    readRosterSearchIndexes({ playerIds, teamSeasonDocumentId }),
    readDocumentsByIds({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      documentIds: includeCounterparts
        ? collectCanonicalCounterpartDocumentIds(existingTeamSeason)
        : [],
    }),
  ])
  const existingPlayerSeasonsById = {}
  Object.values(playerSeasonRowsById).forEach(row => {
    const playerId = clean(row.identity && row.identity.playerId)
    if (playerId) existingPlayerSeasonsById[playerId] = row
  })
  const counterpartProjectionSourcesByDocumentId = await readCounterpartProjectionSources({
    teamSeasonsById: existingCounterpartTeamSeasonsById,
    currentLeague: league,
    currentClubProfile: clubProfile,
    currentClubsCenter: centers.clubsCenterDocument,
  })

  return {
    existingTeamRoot,
    existingTeamSeason,
    playerRootsById,
    existingPlayerSeasonsById,
    existingPlayerSearchIndexes,
    existingCounterpartTeamSeasonsById,
    counterpartProjectionSourcesByDocumentId,
    league,
    clubProfile,
    ...centers,
  }
}
