// features/playersDatabase/domain/movement/movement.identity.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const normalize = value => clean(value).toLowerCase()

const buildKeys = player => [
  clean(player?.playerId),
  clean(player?.externalPlayerId),
  clean(player?.identityKey),
  normalize(player?.normalizedName || player?.fullName),
].filter(Boolean)

const buildKnownLookup = players => {
  const lookup = new Map()

  ;(Array.isArray(players) ? players : []).forEach(player => {
    buildKeys(player).forEach(key => {
      const rows = lookup.get(key) || []
      lookup.set(key, [...rows, player])
    })
  })

  return lookup
}

const resolveUniqueKnownPlayer = ({ player, lookup }) => {
  const candidates = new Map()

  buildKeys(player).forEach(key => {
    ;(lookup.get(key) || []).forEach(candidate => {
      const candidateKey = clean(candidate.playerId) || clean(candidate.externalPlayerId)
      if (candidateKey) candidates.set(candidateKey, candidate)
    })
  })

  return candidates.size === 1
    ? [...candidates.values()][0]
    : null
}

export const resolveRosterPlayersLocally = ({
  players = [],
  currentPlayers = [],
  previousPlayers = [],
} = {}) => {
  const currentLookup = buildKnownLookup(currentPlayers)
  const previousLookup = buildKnownLookup(previousPlayers)
  const resolved = []
  const unresolved = []

  ;(Array.isArray(players) ? players : []).forEach((player, index) => {
    const knownPlayer = resolveUniqueKnownPlayer({
      player,
      lookup: currentLookup,
    }) || resolveUniqueKnownPlayer({
      player,
      lookup: previousLookup,
    })

    if (!knownPlayer) {
      unresolved.push({ index, player })
      return
    }

    resolved.push({
      index,
      player: {
        ...player,
        playerId: clean(knownPlayer.playerId),
        playerDocumentId: clean(knownPlayer.playerDocumentId),
        externalPlayerId: clean(player.externalPlayerId || knownPlayer.externalPlayerId),
        identityKey: clean(player.identityKey || knownPlayer.identityKey),
        aliases: Array.isArray(knownPlayer.aliases) ? knownPlayer.aliases : [],
        // A unique match in the current/previous Team Season is an already
        // supplied canonical identity.  Consumers must not ask SearchIndex
        // to prove it again or reject it as an unresolved Stats identity.
        identityMatchStatus: 'provided',
        identityResolutionSource: 'teamSeason',
      },
    })
  })

  return {
    resolved,
    unresolved,
  }
}

export const mergeLocalAndResolvedPlayers = ({
  totalCount = 0,
  localResolved = [],
  broadResolved = [],
  unresolved = [],
} = {}) => {
  const rows = new Array(totalCount)

  localResolved.forEach(entry => {
    rows[entry.index] = entry.player
  })

  unresolved.forEach((entry, index) => {
    rows[entry.index] = broadResolved[index] || entry.player
  })

  return rows.filter(Boolean)
}
