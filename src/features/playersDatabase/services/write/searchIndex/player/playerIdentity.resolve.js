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

const IDENTITY_LOOKUP_LIMIT = 10

const chunkValues = (values = [], size = IDENTITY_LOOKUP_LIMIT) => {
  const chunks = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

const readIdentityFieldMatchesMany = async ({
  field,
  values = [],
} = {}) => {
  const safeValues = [...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  )]
  if (!safeValues.length) return []

  const snapshots = await Promise.all(
    chunkValues(safeValues).map(valueChunk => readIdentityMatches(query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where(field, 'in', valueChunk)
    )))
  )
  const docsById = new Map()

  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(item => {
      if (clean(item.data()?.entityType) !== 'playerSeason') return
      docsById.set(item.id, item)
    })
  })

  return [...docsById.values()]
}

const buildIdentityLookup = docs => {
  const byExternalPlayerId = new Map()
  const byIdentityKey = new Map()
  const byNormalizedDisplayName = new Map()

  ;(Array.isArray(docs) ? docs : []).forEach(item => {
    const data = item.data() || {}
    const playerId = clean(data.playerId)
    if (!playerId) return

    const append = (map, key) => {
      const cleanKey = clean(key)
      if (!cleanKey) return
      const values = map.get(cleanKey) || []
      if (!values.some(value => value.playerId === playerId)) {
        map.set(cleanKey, [...values, data])
      }
    }

    append(byExternalPlayerId, data.externalPlayerId)
    append(byIdentityKey, data.identityKey)
    append(byNormalizedDisplayName, data.normalizedDisplayName)
  })

  return {
    byExternalPlayerId,
    byIdentityKey,
    byNormalizedDisplayName,
  }
}

const getLookupPlayerIds = rows => [...new Set(
  (Array.isArray(rows) ? rows : [])
    .map(row => clean(row?.playerId))
    .filter(Boolean)
)]

const resolveLegacyNameMatchesFromLookup = ({
  player = {},
  season = {},
  lookup,
} = {}) => {
  const normalizedName = normalizePlayerNameValue(
    player.normalizedName || player.matchedPlayerName || player.fullName
  )
  if (!normalizedName) return []

  const identityBirthYear = resolvePlayerIdentityBirthYear({
    player,
    season,
  })
  const seasonBirthYear = Number(season.birthYear)
  const isYounger = Boolean(
    player.isYoungerAgeGroup || clean(player.rosterStatus) === 'youngerAgeGroup'
  )
  const rows = lookup.byNormalizedDisplayName.get(normalizedName) || []

  return [...new Set(
    rows
      .filter(data => {
        const storedIdentityYear = Number(data.identityBirthYear)
        if (storedIdentityYear) return storedIdentityYear === identityBirthYear

        const storedBirthYear = Number(data.birthYear)
        if (storedBirthYear === identityBirthYear) return true

        return isYounger && storedBirthYear === seasonBirthYear
      })
      .map(data => clean(data.playerId))
      .filter(Boolean)
  )]
}

const resolveExistingPlayerIdsFromLookup = ({
  player = {},
  season = {},
  lookup,
} = {}) => {
  const externalPlayerId = clean(player.externalPlayerId)

  if (externalPlayerId) {
    const matches = getLookupPlayerIds(
      lookup.byExternalPlayerId.get(externalPlayerId)
    )
    if (matches.length) return matches
  }

  const identityKey = buildPlayerIdentityKey({
    player,
    season,
  })
  if (identityKey) {
    const matches = getLookupPlayerIds(
      lookup.byIdentityKey.get(identityKey)
    )
    if (matches.length) return matches
  }

  return resolveLegacyNameMatchesFromLookup({
    player,
    season,
    lookup,
  })
}

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
  const identityBirthYear = resolvePlayerIdentityBirthYear({
    player,
    season,
  })
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
  const identityKey = buildPlayerIdentityKey({
    player,
    season,
  })
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

  const identityMatches = await findIdentityKeyMatches({
    player,
    season,
  })
  if (identityMatches.length) return identityMatches

  return findLegacyNameMatches({
    player,
    season,
  })
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
  identityBirthYear: resolvePlayerIdentityBirthYear({
    player,
    season,
  }),
  identityKey: buildPlayerIdentityKey({
    player,
    season,
  }),
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

  const identityKey = buildPlayerIdentityKey({
    player,
    season,
  })
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

  const matches = await resolveExistingPlayerIds({
    player,
    season,
  })
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
  const unresolvedPlayers = safePlayers.filter(player => (
    !resolveInternalPlayerId(player)
  ))
  const externalPlayerIds = unresolvedPlayers
    .map(player => clean(player.externalPlayerId))
    .filter(Boolean)
  const identityKeys = unresolvedPlayers
    .map(player => buildPlayerIdentityKey({
      player,
      season,
    }))
    .filter(Boolean)
  const normalizedNames = unresolvedPlayers
    .map(player => normalizePlayerNameValue(
      player.normalizedName ||
      player.matchedPlayerName ||
      player.fullName
    ))
    .filter(Boolean)

  const [
    externalDocs,
    identityDocs,
    legacyNameDocs,
  ] = await Promise.all([
    readIdentityFieldMatchesMany({
      field: 'externalPlayerId',
      values: externalPlayerIds,
    }),
    readIdentityFieldMatchesMany({
      field: 'identityKey',
      values: identityKeys,
    }),
    readIdentityFieldMatchesMany({
      field: 'normalizedDisplayName',
      values: normalizedNames,
    }),
  ])
  const docsById = new Map()

  ;[
    ...externalDocs,
    ...identityDocs,
    ...legacyNameDocs,
  ].forEach(item => docsById.set(item.id, item))

  const lookup = buildIdentityLookup([...docsById.values()])
  const resolvedByKey = new Map()
  const results = []

  safePlayers.forEach(player => {
    const resolutionKey = buildResolutionKey({
      player,
      season,
    })
    const previous = resolutionKey
      ? resolvedByKey.get(resolutionKey)
      : null

    if (previous) {
      results.push(enrichResolvedPlayer({
        player,
        season,
        playerId: previous.playerId,
        matchStatus: previous.identityMatchStatus,
        candidateIds: previous.identityCandidateIds,
      }))
      return
    }

    const existingPlayerId = resolveInternalPlayerId(player)
    let resolvedPlayer = null

    if (existingPlayerId) {
      resolvedPlayer = enrichResolvedPlayer({
        player,
        season,
        playerId: existingPlayerId,
        matchStatus: 'provided',
      })
    } else {
      const matches = resolveExistingPlayerIdsFromLookup({
        player,
        season,
        lookup,
      })

      resolvedPlayer = enrichResolvedPlayer({
        player,
        season,
        playerId: matches.length === 1
          ? matches[0]
          : createInternalPlayerId(),
        matchStatus: matches.length === 1
          ? 'matched'
          : matches.length > 1
            ? 'ambiguous'
            : 'created',
        candidateIds: matches.length > 1 ? matches : [],
      })
    }

    if (resolutionKey) {
      resolvedByKey.set(resolutionKey, resolvedPlayer)
    }
    results.push(resolvedPlayer)
  })

  return results
}
