// src/features/playersDatabase/domain/adapters/teamBalanceInput.adapter.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const toKnownNonNegativeNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return null

  return number
}

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : {}
)

const hasKnownValue = value => (
  value !== null &&
  value !== undefined &&
  value !== ''
)

const resolveStatValue = ({
  stats = {},
  source = {},
  key,
  legacyKeys = [],
}) => {
  if (hasKnownValue(stats[key])) return stats[key]
  if (hasKnownValue(source[key])) return source[key]

  for (const legacyKey of legacyKeys) {
    if (hasKnownValue(stats[legacyKey])) return stats[legacyKey]
    if (hasKnownValue(source[legacyKey])) return source[legacyKey]
  }

  return null
}

export const adaptTeamBalancePlayerRow = player => {
  const source = player && typeof player === 'object' ? player : {}
  const stats = getPlayerStats(source)

  return {
    playerId: clean(
      source.playerId ||
      source.externalPlayerId ||
      source.identityKey
    ),
    externalPlayerId: clean(source.externalPlayerId),
    identityKey: clean(source.identityKey),
    rosterStatus: clean(source.rosterStatus),
    statsStatus: clean(source.statsStatus),
    primaryPosition: clean(source.primaryPosition),
    positionLayer: clean(source.positionLayer),
    lineClassification: source.lineClassification && typeof source.lineClassification === 'object'
      ? { ...source.lineClassification }
      : null,
    isYoungerAgeGroup: source.isYoungerAgeGroup === true,
    playerStats: {
      games: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'games',
      })),
      goals: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'goals',
      })),
      minutes: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'minutes',
      })),
      starts: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'starts',
      })),
      substituteIn: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'substituteIn',
        legacyKeys: ['subIn'],
      })),
      substitutedOut: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'substitutedOut',
        legacyKeys: ['subOut'],
      })),
      teamMinutes: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'teamMinutes',
      })),
      teamGames: toKnownNonNegativeNumber(resolveStatValue({
        stats,
        source,
        key: 'teamGames',
      })),
    },
  }
}

export const adaptTeamBalanceInput = ({ teamPlayers = [] } = {}) => ({
  players: (Array.isArray(teamPlayers) ? teamPlayers : [])
    .map(adaptTeamBalancePlayerRow),
})
