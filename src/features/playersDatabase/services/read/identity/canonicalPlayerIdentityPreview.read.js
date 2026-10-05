// src/features/playersDatabase/services/read/identity/canonicalPlayerIdentityPreview.read.js

import {
  collection,
  query,
  where,
} from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildPlayerId } from '../../../domain/identity/index.js'
import {
  buildCanonicalPlayerIdentityKeys,
  resolveCanonicalPlayerIdentityCandidates,
} from '../../../domain/identity/canonicalPlayerIdentityCandidates.domain.js'
import { chunkValues } from '../../shared/chunkValues.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const positiveInteger = value => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

const readExternalIdentityMatches = async ({
  externalPlayerIds = [],
  includeManifest = false,
} = {}) => {
  const values = [...new Set(externalPlayerIds.map(clean).filter(Boolean))]
  if (!values.length) return includeManifest ? { documents: [], queryManifest: [] } : []

  const valueChunks = chunkValues(values)
  const snapshots = await Promise.all(valueChunks.map(valueChunk => trackedGetDocs(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes),
      where('entityType', '==', 'playerSeason'),
      where('externalPlayerId', 'in', valueChunk)
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes,
      action: 'playerIdentity-preview',
      operationSubtype: 'identity-query',
    }
  )))
  const documentsById = new Map()

  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(documentSnapshot => {
      documentsById.set(documentSnapshot.id, documentSnapshot)
    })
  })

  const documents = [...documentsById.values()]
  if (!includeManifest) return documents

  return {
    documents,
    queryManifest: valueChunks.map((valueChunk, index) => ({
      field: 'externalPlayerId',
      values: [...valueChunk].sort(),
      resultIds: snapshots[index].docs.map(row => row.id).sort(),
    })),
  }
}

export const validateCanonicalPlayerIdentityQueryManifest = async (manifest = []) => {
  const rows = Array.isArray(manifest) ? manifest : []

  for (const row of rows) {
    if (clean(row && row.field) !== 'externalPlayerId') return false

    const current = await readExternalIdentityMatches({
      externalPlayerIds: Array.isArray(row && row.values) ? row.values : [],
      includeManifest: true,
    })
    const actual = current.queryManifest[0]
      ? current.queryManifest[0].resultIds
      : []
    const expected = Array.isArray(row && row.resultIds)
      ? [...row.resultIds].sort()
      : []

    if (JSON.stringify(actual) !== JSON.stringify(expected)) return false
  }

  return true
}

const buildIdentityLookup = documents => {
  const byExternalPlayerId = new Map()

  ;(Array.isArray(documents) ? documents : []).forEach(documentSnapshot => {
    const row = documentSnapshot.data() || {}
    if (clean(row.entityType) !== 'playerSeason') return

    const externalPlayerId = clean(row.externalPlayerId)
    if (!externalPlayerId) return

    const candidates = byExternalPlayerId.get(externalPlayerId) || []
    byExternalPlayerId.set(externalPlayerId, [...candidates, row])
  })

  return { byExternalPlayerId }
}

const buildIdentityCandidate = (row = {}) => ({
  playerId: clean(row.playerId),
  externalPlayerId: clean(row.externalPlayerId),
  displayName: clean(row.displayName || row.fullName),
  identityBirthYear: positiveInteger(row.identityBirthYear || row.birthYear),
  birthYear: positiveInteger(row.birthYear),
  playerUrl: clean(row.playerUrl),
  seasonId: clean(row.seasonId),
  seasonKey: clean(row.seasonKey),
  clubId: clean(row.clubId),
  teamSlot: positiveInteger(row.teamSlot || row.birthTeamSlot),
  ageGroupId: clean(row.ageGroupId),
  ageGroupLabel: clean(row.ageGroupLabel),
  teamId: clean(row.teamId || row.birthTeamId),
  teamUrl: clean(row.teamUrl),
})

const buildIdentityMemberships = ({ candidates = [], playerId = '' } = {}) => (
  (Array.isArray(candidates) ? candidates : [])
    .filter(candidate => clean(candidate && candidate.playerId) === clean(playerId))
    .map(buildIdentityCandidate)
)

const unresolvedIdentity = ({
  player,
  externalPlayerId,
  identityBirthYear,
  message,
}) => {
  return {
    ...player,
    playerId: '',
    externalPlayerId,
    identityBirthYear,
    identityMatchStatus: 'unresolved',
    identityStatus: externalPlayerId ? 'נדרשת בדיקה' : 'לא זוהה',
    identityMessage: message,
    identityValid: false,
    identityMemberships: [],
    identityCandidates: [],
    identityCandidateIds: [],
  }
}

const resolvePlayerIdentity = ({ player = {}, season = {}, lookup }) => {
  const keys = buildCanonicalPlayerIdentityKeys({ player, season })
  const externalPlayerId = keys.externalPlayerId

  if (!externalPlayerId || !keys.identityBirthYear) {
    return unresolvedIdentity({
      player,
      externalPlayerId,
      identityBirthYear: keys.identityBirthYear,
      message: 'נדרש מזהה שחקן חיצוני תקין ושנתון זהות',
    })
  }

  const playerId = buildPlayerId({
    birthYear: keys.identityBirthYear,
    externalPlayerId,
  })
  const resolution = resolveCanonicalPlayerIdentityCandidates({ keys, lookup })
  const canonicalCandidates = resolution.candidates.filter(
    candidate => clean(candidate && candidate.playerId) === playerId
  )

  if (resolution.candidates.length && !canonicalCandidates.length) {
    return unresolvedIdentity({
      player,
      externalPlayerId,
      identityBirthYear: keys.identityBirthYear,
      message: 'נמצאה זהות ישנה שאינה תואמת למזהה הקנוני; נדרש תיקון לפני הייבוא',
    })
  }

  const matched = canonicalCandidates.length > 0

  return {
    ...player,
    playerId,
    externalPlayerId,
    identityBirthYear: keys.identityBirthYear,
    identityMatchStatus: matched ? 'matched' : 'new',
    identityStatus: matched ? 'זוהה שחקן קיים' : 'שחקן חדש',
    identityMessage: matched
      ? `לפי מזהה התאחדות ${externalPlayerId}`
      : `מזהה התאחדות חדש ${externalPlayerId}`,
    identityValid: true,
    identityMemberships: buildIdentityMemberships({
      candidates: canonicalCandidates,
      playerId,
    }),
    identityCandidates: [],
    identityCandidateIds: [],
  }
}

const readResolutionSources = async ({ players = [], season = {} } = {}) => {
  const safePlayers = Array.isArray(players) ? players : []
  const externalPlayerIds = safePlayers.map(player => (
    buildCanonicalPlayerIdentityKeys({ player, season }).externalPlayerId
  ))
  const identityRead = await readExternalIdentityMatches({
    externalPlayerIds,
    includeManifest: true,
  })

  return {
    players: safePlayers,
    documents: identityRead.documents,
    queryManifest: identityRead.queryManifest,
  }
}

const resolvePlayers = ({ players = [], season = {}, documents = [] }) => {
  const lookup = buildIdentityLookup(documents)

  return players.map(player => resolvePlayerIdentity({ player, season, lookup }))
}

export async function resolveCanonicalTeamPlayerIdentityPreview({
  players = [],
  season = {},
} = {}) {
  const sources = await readResolutionSources({ players, season })
  return resolvePlayers({ ...sources, season })
}

export async function resolveCanonicalTeamPlayerIdentitiesWithSources({
  players = [],
  season = {},
} = {}) {
  const sources = await readResolutionSources({ players, season })

  return {
    players: resolvePlayers({ ...sources, season }),
    sourceDocuments: sources.documents.map(documentSnapshot => ({
      id: documentSnapshot.id,
      data: documentSnapshot.data() || {},
    })),
    queryManifest: sources.queryManifest,
  }
}

export async function resolveCanonicalTeamPlayerIdentities(args = {}) {
  const result = await resolveCanonicalTeamPlayerIdentitiesWithSources(args)
  return result.players
}
