// src/features/playersDatabase/services/read/playerIdentityReview.read.js

import {
  collection,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedGetDocs } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { getTeamById } from './team.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const chunkValues = (values = [], size = 10) => {
  const chunks = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

const uniqueValues = values => [
  ...new Set(
    values
      .map(clean)
      .filter(Boolean)
  ),
]

const readPlayerSeasonRows = async playerIds => {
  const safeIds = uniqueValues(playerIds)
  if (!safeIds.length) return []

  const snapshots = await Promise.all(
    chunkValues(safeIds).map(idChunk => trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
        where('playerId', 'in', idChunk)
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'player-identity-review',
        operationSubtype: 'player-history-query',
      }
    ))
  )

  return snapshots.flatMap(snapshot => (
    snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...(documentSnapshot.data() || {}),
      }))
      .filter(row => clean(row.entityType) === 'playerSeason')
  ))
}

const readTeamNames = async rows => {
  const teamDocumentIds = uniqueValues(
    rows.map(row => (
      row.birthTeamDocumentId ||
      row.teamDocumentId ||
      row.teamId ||
      row.birthTeamId
    ))
  )

  const teamDocuments = await Promise.all(
    teamDocumentIds.map(teamDocumentId => getTeamById(teamDocumentId))
  )
  const teamNames = new Map()

  teamDocuments.forEach(teamDocument => {
    if (!teamDocument?.id) return

    teamNames.set(
      clean(teamDocument.id),
      clean(
        teamDocument.displayName ||
        teamDocument.teamName ||
        teamDocument.name
      )
    )
  })

  return teamNames
}

const sortSeasons = (left, right) => {
  const leftId = Number(left.seasonId)
  const rightId = Number(right.seasonId)

  if (Number.isFinite(leftId) && Number.isFinite(rightId)) {
    return rightId - leftId
  }

  return clean(right.seasonKey).localeCompare(
    clean(left.seasonKey),
    'he'
  )
}

const buildSeasonRow = ({
  row = {},
  teamNames,
} = {}) => {
  const teamDocumentId = clean(
    row.birthTeamDocumentId ||
    row.teamDocumentId ||
    row.teamId ||
    row.birthTeamId
  )

  return {
    id: clean(row.id),
    displayName: clean(row.displayName),
    playerId: clean(row.playerId),
    playerDocumentId: clean(row.playerDocumentId),
    externalPlayerId: clean(row.externalPlayerId),
    playerUrl: clean(row.playerUrl),
    identityBirthYear: Number(row.identityBirthYear) || 0,
    birthYear: Number(row.birthYear) || 0,
    seasonId: clean(row.seasonId),
    seasonKey: clean(row.seasonKey),
    ageGroupId: clean(row.ageGroupId),
    ageGroupLabel: clean(row.ageGroupLabel),
    teamDocumentId,
    teamName: clean(teamNames.get(teamDocumentId)),
    teamUrl: clean(row.teamUrl),
    leagueId: clean(row.leagueId),
  }
}

const buildCandidate = ({
  seed = {},
  rows = [],
  teamNames,
} = {}) => {
  const playerId = clean(seed.playerId)
  const seasonRows = rows
    .filter(row => clean(row.playerId) === playerId)
    .map(row => buildSeasonRow({
      row,
      teamNames,
    }))
    .sort(sortSeasons)

  const urlRow = seasonRows.find(row => row.playerUrl)
  const dataRow = seasonRows[0] || {}

  return {
    playerId,
    playerDocumentId: clean(
      seed.playerDocumentId ||
      dataRow.playerDocumentId
    ),
    externalPlayerId: clean(
      seed.externalPlayerId ||
      dataRow.externalPlayerId
    ),
    displayName: clean(
      seed.displayName ||
      dataRow.displayName
    ),
    identityBirthYear: Number(
      seed.identityBirthYear ||
      dataRow.identityBirthYear ||
      dataRow.birthYear
    ) || 0,
    playerUrl: clean(
      seed.playerUrl ||
      urlRow?.playerUrl
    ),
    seasons: seasonRows,
  }
}

export async function readPlayerIdentityReview({
  candidates = [],
} = {}) {
  const safeCandidates = Array.isArray(candidates)
    ? candidates.filter(candidate => clean(candidate?.playerId))
    : []
  const playerIds = uniqueValues(
    safeCandidates.map(candidate => candidate.playerId)
  )

  if (!playerIds.length) {
    return {
      candidates: safeCandidates,
    }
  }

  const rows = await readPlayerSeasonRows(playerIds)
  const teamNames = await readTeamNames(rows)

  return {
    candidates: safeCandidates.map(seed => buildCandidate({
      seed,
      rows,
      teamNames,
    })),
  }
}
