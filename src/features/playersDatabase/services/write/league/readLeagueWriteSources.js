// src/features/playersDatabase/services/write/league/readLeagueWriteSources.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { requireSeasonId } from '../../../domain/identity/index.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const readDocument = async ({ collectionName, documentId, action }) => {
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

const readLeague = async ({ leagueId }) => readDocument({
  collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
  documentId: leagueId,
  action: 'write-league-prepare-read-canonical',
})

export const readOtherLeagueTeamOwners = async ({ leagueId, seasonId }) => {
  const snapshot = await trackedGetDocsFromServer(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      action: 'write-league-prepare-read-team-owners',
      operationSubtype: 'write-prepare-getDocs',
    }
  )
  const ownersByTeamId = {}

  snapshot.docs.forEach(item => {
    const ownerLeagueId = clean(item.id)
    if (!ownerLeagueId || ownerLeagueId === leagueId) return
    const season = object(object(item.data()).seasonsById)[seasonId]
    Object.keys(object(season && season.table && season.table.teamsById)).forEach(teamId => {
      if (!ownersByTeamId[teamId]) ownersByTeamId[teamId] = []
      ownersByTeamId[teamId].push(ownerLeagueId)
    })
  })

  return ownersByTeamId
}

const readClubProfiles = async ({ clubIds }) => {
  const uniqueClubIds = Array.from(new Set(
    clubIds.map(clean).filter(Boolean)
  ))
  const profiles = await Promise.all(uniqueClubIds.map(clubId => readDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
    documentId: clubId,
    action: 'write-league-prepare-read-club-profile',
  })))

  return Object.fromEntries(
    profiles.filter(Boolean).map(profile => [clean(profile.id), profile])
  )
}

const readTeamSeasons = async ({ leagueId, seasonId }) => {
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons),
      where('identity.leagueId', '==', leagueId),
      where('identity.seasonId', '==', seasonId)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      action: 'write-league-prepare-read-team-seasons',
      operationSubtype: 'write-prepare-getDocs',
    }
  )

  return snapshot.docs.map(item => ({ id: item.id, ...(item.data() || {}) }))
}

const readLeaguesCenter = async () => readDocument({
  collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter,
  documentId: 'all',
  action: 'write-league-prepare-read-leagues-center',
})

const readClubsCenter = async ({ seasonId }) => readDocument({
  collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
  documentId: seasonId,
  action: 'write-league-prepare-read-clubs-center',
})

const readPreviousLeaguesCenterTeams = ({ leaguesCenter, leagueId, seasonId }) => {
  const league = object(object(leaguesCenter).leaguesById)[leagueId]
  const season = object(object(league).seasonsById)[seasonId]
  return object(object(season).teamsById)
}

const readPreviousClubsCenterTeamLocations = ({ clubsCenter, leagueId }) => {
  const locations = []

  Object.entries(object(object(clubsCenter).clubsById)).forEach(([clubId, club]) => {
    Object.entries(object(object(club).teamsById)).forEach(([teamId, team]) => {
      if (clean(team && team.leagueId) !== leagueId) return
      locations.push({
        clubId: clean(clubId),
        teamId: clean(teamId),
        team,
      })
    })
  })

  return locations
}

const collectLoadClubIds = rows => Array.from(new Set(
  rows.map(row => clean(row && row.clubId)).filter(Boolean)
))

export const readLeagueLoadSources = async ({ league = {}, season = {}, rows = [] } = {}) => {
  const leagueId = requireLeagueId(league.leagueId)
  const seasonId = requireSeasonId(season.seasonId)
  if (!Array.isArray(rows)) throw new Error('League rows must be an array')

  const clubIds = collectLoadClubIds(rows)
  const [
    existingLeague,
    clubProfilesById,
    existingTeamSeasons,
    leaguesCenter,
    clubsCenter,
    otherLeagueIdsByTeamId,
  ] = await Promise.all([
    readLeague({ leagueId }),
    readClubProfiles({ clubIds }),
    readTeamSeasons({ leagueId, seasonId }),
    readLeaguesCenter(),
    readClubsCenter({ seasonId }),
    readOtherLeagueTeamOwners({ leagueId, seasonId }),
  ])

  return {
    leagueId,
    seasonId,
    existingLeague: existingLeague || {},
    clubProfilesById,
    existingTeamSeasons,
    otherLeagueIdsByTeamId,
    previousLeaguesCenterTeamsById: readPreviousLeaguesCenterTeams({
      leaguesCenter,
      leagueId,
      seasonId,
    }),
    previousClubsCenterTeamLocations: readPreviousClubsCenterTeamLocations({
      clubsCenter,
      leagueId,
    }),
  }
}

export const readLeagueMutationSources = async ({ leagueId = '', seasonId = '' } = {}) => {
  const resolvedLeagueId = requireLeagueId(leagueId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const [
    existingLeague,
    existingTeamSeasons,
    clubsCenter,
    otherLeagueIdsByTeamId,
  ] = await Promise.all([
    readLeague({ leagueId: resolvedLeagueId }),
    readTeamSeasons({
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
    }),
    readClubsCenter({ seasonId: resolvedSeasonId }),
    readOtherLeagueTeamOwners({
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
    }),
  ])

  return {
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
    existingLeague,
    existingTeamSeasons,
    otherLeagueIdsByTeamId,
    previousClubsCenterTeamLocations: readPreviousClubsCenterTeamLocations({
      clubsCenter,
      leagueId: resolvedLeagueId,
    }),
  }
}
