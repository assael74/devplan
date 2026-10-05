// src/features/playersDatabase/services/audit/league/readActual.js

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
import { requireSeasonId } from '../../../domain/identity/seasonIdentity.js'
import { requireLeagueId } from '../../../domain/league/leagueIdentity.js'

const LEAGUES_CENTER_DOCUMENT_ID = 'all'

const readDoc = async ({ collectionName, documentId, action }) => {
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

const readTeamSeasonsByLeague = async ({ leagueId, seasonId }) => {
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons),
      where('identity.leagueId', '==', leagueId),
      where('identity.seasonId', '==', seasonId)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      action: 'audit-league-read-team-seasons',
      operationSubtype: 'audit-getDocs',
    }
  )

  return snapshot.docs.map(item => ({ id: item.id, ...(item.data() || {}) }))
}

const readExpectedTeamSeasons = async expected => {
  const documentIds = Array.from(new Set(
    (expected && expected.teamSeasonCompetitionSnapshots || [])
      .map(item => String(item && item.teamSeasonDocumentId || '').trim())
      .filter(Boolean)
  ))

  return Promise.all(documentIds.map(documentId => readDoc({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    documentId,
    action: 'audit-league-read-expected-team-season',
  })))
}

export const readLeagueCanonical = async ({ leagueId = '' } = {}) => {
  const safeLeagueId = requireLeagueId(leagueId)
  return readDoc({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
    documentId: safeLeagueId,
    action: 'audit-league-read-canonical',
  })
}

export const readClubProfiles = async ({ clubIds = [] } = {}) => {
  const uniqueClubIds = Array.from(new Set(
    clubIds.map(value => String(value || '').trim()).filter(Boolean)
  ))
  const profiles = await Promise.all(uniqueClubIds.map(clubId => readDoc({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
    documentId: clubId,
    action: 'audit-league-read-club-profile',
  })))

  return Object.fromEntries(
    profiles.filter(Boolean).map(profile => [String(profile.id || '').trim(), profile])
  )
}

export const readActualLeagueAudit = async ({ expected = {}, leagueId = '', seasonId = '' } = {}) => {
  const safeLeagueId = requireLeagueId(leagueId)
  const safeSeasonId = requireSeasonId(seasonId)

  const [leaguesCenter, clubsCenter, scopedTeamSeasons, expectedTeamSeasons] = await Promise.all([
    readDoc({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leaguesCenter,
      documentId: LEAGUES_CENTER_DOCUMENT_ID,
      action: 'audit-league-read-leagues-center',
    }),
    readDoc({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
      documentId: safeSeasonId,
      action: 'audit-league-read-clubs-center',
    }),
    readTeamSeasonsByLeague({
      leagueId: safeLeagueId,
      seasonId: safeSeasonId,
    }),
    readExpectedTeamSeasons(expected),
  ])

  const teamSeasonsById = new Map()
  ;[...scopedTeamSeasons, ...expectedTeamSeasons.filter(Boolean)].forEach(item => {
    teamSeasonsById.set(item.id, item)
  })

  return {
    leaguesCenter,
    clubsCenter,
    teamSeasons: Array.from(teamSeasonsById.values()),
  }
}
