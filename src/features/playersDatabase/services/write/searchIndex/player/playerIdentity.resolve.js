// features/playersDatabase/services/write/searchIndex/player/playerIdentity.resolve.js

import {
  collection,
  query,
  where,
} from 'firebase/firestore'
import { trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildPlayerIdentityKey,
  createInternalPlayerId,
  normalizePlayerNameValue,
  resolveInternalPlayerId,
  resolvePlayerIdentityBirthYear,
} from '../../../../model/playerIdentity.model.js'
import { clean } from '../../leagues/leagueDoc.js'

const readIdentityMatches = queryRef => trackedGetDocs(queryRef, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'playerIdentity-resolve',
  operationSubtype: 'identity-query',
})

const getPlayerIds = snapshot => [...new Set(
  snapshot.docs
    .filter(item => clean(item.data()?.entityType) === 'playerSeason')
    .map(item => clean(item.data()?.playerId))
    .filter(Boolean)
)]

const findByField = async ({ field, value }) => {
  if (!clean(value)) return []

  const snapshot = await readIdentityMatches(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where(field, '==', value)
  ))

  return getPlayerIds(snapshot)
}

const findLegacyNameMatches = async ({
  player = {},
  season = {},
} = {}) => {
  const normalizedName = normalizePlayerNameValue(
    player.normalizedName || player.matchedPlayerName || player.fullName
  )
  if (!normalizedName) return []

  const snapshot = await readIdentityMatches(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('normalizedDisplayName', '==', normalizedName)
  ))
  const identityBirthYear = resolvePlayerIdentityBirthYear({ player, season })
  const seasonBirthYear = Number(season.birthYear)
  const isYounger = Boolean(
    player.isYoungerAgeGroup || clean(player.rosterStatus) === 'youngerAgeGroup'
  )

  return [...new Set(snapshot.docs
    .filter(item => {
      const data = item.data() || {}
      const storedIdentityYear = Number(data.identityBirthYear)
      if (storedIdentityYear) return storedIdentityYear === identityBirthYear

      const storedBirthYear = Number(data.birthYear)
      if (storedBirthYear === identityBirthYear) return true

      return isYounger && storedBirthYear === seasonBirthYear
    })
    .map(item => clean(item.data()?.playerId))
    .filter(Boolean))]
}

const findIdentityKeyMatches = async ({
  player = {},
  season = {},
} = {}) => {
  const identityKey = buildPlayerIdentityKey({ player, season })
  if (!identityKey) return []

  return findByField({
    field: 'identityKey',
    value: identityKey,
  })
}

const resolveExistingPlayerIds = async ({
  player = {},
  season = {},
} = {}) => {
  const externalPlayerId = clean(player.externalPlayerId)
  if (externalPlayerId) {
    const matches = await findByField({
      field: 'externalPlayerId',
      value: externalPlayerId,
    })
    if (matches.length) return matches
  }

  const identityMatches = await findIdentityKeyMatches({ player, season })
  if (identityMatches.length) return identityMatches

  return findLegacyNameMatches({ player, season })
}

const enrichResolvedPlayer = ({
  player = {},
  season = {},
  playerId = '',
  matchStatus = '',
  candidateIds = [],
} = {}) => ({
  ...player,
  playerId,
  identityBirthYear: resolvePlayerIdentityBirthYear({ player, season }),
  identityKey: buildPlayerIdentityKey({ player, season }),
  identityMatchStatus: matchStatus,
  identityCandidateIds: candidateIds,
})

const buildResolutionKey = ({
  player = {},
  season = {},
} = {}) => {
  const existingPlayerId = resolveInternalPlayerId(player)
  if (existingPlayerId) return `playerId:${existingPlayerId}`

  const externalPlayerId = clean(player.externalPlayerId)
  if (externalPlayerId) return `externalPlayerId:${externalPlayerId}`

  const identityKey = buildPlayerIdentityKey({ player, season })
  return identityKey ? `identityKey:${identityKey}` : ''
}

export async function resolvePlayerIdentity({
  player = {},
  season = {},
} = {}) {
  const existingPlayerId = resolveInternalPlayerId(player)
  if (existingPlayerId) {
    return enrichResolvedPlayer({
      player,
      season,
      playerId: existingPlayerId,
      matchStatus: 'provided',
    })
  }

  const matches = await resolveExistingPlayerIds({ player, season })
  if (matches.length === 1) {
    return enrichResolvedPlayer({
      player,
      season,
      playerId: matches[0],
      matchStatus: 'matched',
    })
  }

  return enrichResolvedPlayer({
    player,
    season,
    playerId: createInternalPlayerId(),
    matchStatus: matches.length > 1 ? 'ambiguous' : 'created',
    candidateIds: matches,
  })
}

export async function resolvePlayerIdentities({
  players = [],
  season = {},
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const resolvedByKey = new Map()
  const results = []

  for (const player of safePlayers) {
    const resolutionKey = buildResolutionKey({ player, season })
    const previous = resolutionKey ? resolvedByKey.get(resolutionKey) : null

    if (previous) {
      results.push(enrichResolvedPlayer({
        player,
        season,
        playerId: previous.playerId,
        matchStatus: previous.identityMatchStatus,
        candidateIds: previous.identityCandidateIds,
      }))
      continue
    }

    const resolvedPlayer = await resolvePlayerIdentity({ player, season })
    if (resolutionKey) resolvedByKey.set(resolutionKey, resolvedPlayer)
    results.push(resolvedPlayer)
  }

  return results
}
