// src/features/playersDatabase/domain/statsV2/statsReloadDecision.builder.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const STATS_RELOAD_DECISION = {
  PRESERVE_STATS: 'preserveStats',
  REMOVE_STATS: 'removeStats',
}

const uniqueCleanValues = values => [...new Set(
  (Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean)
)]

export const resolveStatsPlayerIdentityKey = player => {
  const source = player && typeof player === 'object' ? player : {}
  const aliases = uniqueCleanValues(source.aliases)

  return clean(
    source.playerId ||
    source.externalPlayerId ||
    source.playerDocumentId ||
    source.identityKey ||
    source.matchedPlayerId ||
    aliases[0] ||
    source.fullName ||
    source.name
  )
}

const normalizeDecision = decision => {
  const value = clean(decision)

  return Object.values(STATS_RELOAD_DECISION).includes(value)
    ? value
    : ''
}

const buildIncomingKeys = players => new Set(
  (Array.isArray(players) ? players : [])
    .map(resolveStatsPlayerIdentityKey)
    .filter(Boolean)
)

export const findMissingPreviousStatsPlayers = ({
  previousPlayers = [],
  incomingPlayers = [],
} = {}) => {
  const incomingKeys = buildIncomingKeys(incomingPlayers)

  return (Array.isArray(previousPlayers) ? previousPlayers : [])
    .filter(player => clean(player?.statsStatus) === 'loaded')
    .filter(player => {
      const key = resolveStatsPlayerIdentityKey(player)
      return key && !incomingKeys.has(key)
    })
    .map(player => ({
      playerKey: resolveStatsPlayerIdentityKey(player),
      player,
    }))
}

export const buildStatsReloadDecisionState = ({
  previousPlayers = [],
  incomingPlayers = [],
  decisions = {},
} = {}) => {
  const missingPlayers = findMissingPreviousStatsPlayers({
    previousPlayers,
    incomingPlayers,
  })
  const decisionSource = decisions && typeof decisions === 'object'
    ? decisions
    : {}
  const resolved = []
  const unresolved = []

  missingPlayers.forEach(entry => {
    const decision = normalizeDecision(decisionSource[entry.playerKey])

    if (!decision) {
      unresolved.push(entry)
      return
    }

    resolved.push({
      ...entry,
      decision,
    })
  })

  return {
    missingPlayers,
    resolved,
    unresolved,
    isComplete: unresolved.length === 0,
  }
}
