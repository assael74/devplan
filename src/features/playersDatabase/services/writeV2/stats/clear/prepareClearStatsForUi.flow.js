// src/features/playersDatabase/services/writeV2/stats/clear/prepareClearStatsForUi.flow.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'
import { buildTeamSeasonSearchIndexId } from '../../../../domain/projections/teamSeasonSearchIndex.projection.js'
import { prepareClearStatsPlanV2 } from '../prepare/prepareClearStatsPlanV2.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const readDocument = async ({ collectionName, docId, action }) => {
  if (!docId) return null

  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, docId),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'clear-stats-prepare-getDocFromServer',
    }
  )

  return snapshot.exists()
    ? { ...(snapshot.data() || {}), id: snapshot.id }
    : null
}

const readPlayerDocuments = async ({ teamSeason, playerSearchIndexesById }) => {
  const ids = Array.from(new Set(
    [
      ...(Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : []),
      ...Object.values(playerSearchIndexesById || {}),
    ]
      .map(source => clean(source?.playerDocumentId))
      .filter(Boolean)
  ))

  const documents = await Promise.all(ids.map(docId => readDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.players,
    docId,
    action: 'clear-stats-prepare-player-document',
  })))

  return Object.fromEntries(
    documents
      .filter(Boolean)
      .map(document => [document.id, document])
  )
}

const readPlayerSearchIndexes = async identity => {
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', 'playerSeason'),
      where('birthTeamDocumentId', '==', identity.birthTeamDocumentId),
      where('seasonKey', '==', identity.seasonKey)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'clear-stats-prepare-player-search-indexes',
      operationSubtype: 'clear-stats-prepare-getDocsFromServer',
    }
  )

  const result = {}

  snapshot.docs.forEach(item => {
    const document = { ...(item.data() || {}), id: item.id }
    const valid = (
      clean(document.entityType) === 'playerSeason' &&
      clean(document.birthTeamDocumentId) === identity.birthTeamDocumentId &&
      clean(document.seasonKey) === identity.seasonKey &&
      clean(document.leagueId) === identity.leagueId
    )

    if (!valid || !item.id || result[item.id]) {
      fail(
        'CLEAR_STATS_PLAYER_INDEX_IDENTITY_MISMATCH',
        `Player SearchIndex identity mismatch: ${item.id || 'unknown'}`
      )
    }

    result[item.id] = document
  })

  return result
}

export async function prepareClearStatsForUiV2({
  birthTeamDocumentId,
  seasonKey,
  leagueId,
} = {}) {
  const identity = {
    birthTeamDocumentId: clean(birthTeamDocumentId),
    seasonKey: clean(seasonKey),
    leagueId: clean(leagueId),
  }

  if (!identity.birthTeamDocumentId || !identity.seasonKey || !identity.leagueId) {
    fail('CLEAR_STATS_IDENTITY_REQUIRED', 'CLEAR_STATS requires team, season and league identity')
  }

  const teamSeasonDocumentId = buildTeamSeasonDocumentId(
    identity.birthTeamDocumentId,
    identity.seasonKey
  )

  const [teamRoot, teamSeason, league] = await Promise.all([
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teams,
      docId: identity.birthTeamDocumentId,
      action: 'clear-stats-prepare-team-root',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      docId: teamSeasonDocumentId,
      action: 'clear-stats-prepare-team-season',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
      docId: identity.leagueId,
      action: 'clear-stats-prepare-league',
    }),
  ])

  if (!teamRoot) {
    fail('CLEAR_STATS_TEAM_ROOT_NOT_FOUND', 'Canonical Team Root was not found')
  }

  if (!teamSeason) {
    fail('CLEAR_STATS_TEAM_SEASON_NOT_FOUND', 'Canonical Team Season was not found')
  }

  const clubId = clean(
    teamRoot.clubId ||
    teamSeason.clubId ||
    teamSeason.scoutIdentityContext?.clubId
  )
  const teamSearchIndexId = buildTeamSeasonSearchIndexId({
    leagueId: identity.leagueId,
    seasonKey: identity.seasonKey,
    teamId: identity.birthTeamDocumentId,
  })

  const [
    playerSearchIndexesById,
    teamSearchIndex,
    club,
    clubsMaster,
  ] = await Promise.all([
    readPlayerSearchIndexes(identity),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      docId: teamSearchIndexId,
      action: 'clear-stats-prepare-team-search-index',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubs,
      docId: clubId,
      action: 'clear-stats-prepare-club',
    }),
    readDocument({
      collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      docId: 'all',
      action: 'clear-stats-prepare-clubs-master',
    }),
  ])
  const playerDocumentsById = await readPlayerDocuments({
    teamSeason,
    playerSearchIndexesById,
  })

  return prepareClearStatsPlanV2({
    teamRoot,
    teamSeason,
    league,
    birthTeamDocumentId: identity.birthTeamDocumentId,
    seasonKey: identity.seasonKey,
    leagueId: identity.leagueId,
    projectionSources: {
      playerDocumentsById,
      playerSearchIndexesById,
      teamSearchIndex,
      league,
      clubsById: club ? { [club.id]: club } : {},
      clubsMaster,
    },
  })
}
