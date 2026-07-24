// src/coreData/coreData.status.js

const SOURCE_KEYS = [
  'clubs',
  'teams',
  'players',
  'privatePlayers',
  'scouting',
  'meetings',
  'payments',
  'games',
  'externalGames',
  'roles',
  'videos',
  'videoAnalysis',
]

const isLoaded = value => Array.isArray(value)

const buildSources = shorts => ({
  clubs: isLoaded(shorts?.clubsShorts),
  teams: isLoaded(shorts?.teamsShorts),
  players: isLoaded(shorts?.playersShorts),
  privatePlayers: isLoaded(shorts?.privatePlayersShorts),
  scouting: isLoaded(shorts?.scoutingShorts),
  meetings: isLoaded(shorts?.meetingsShorts),
  payments: isLoaded(shorts?.paymentsShorts),
  games: isLoaded(shorts?.gamesShorts),
  externalGames: isLoaded(shorts?.externalGamesShorts),
  roles: isLoaded(shorts?.rolesShorts),
  videos: isLoaded(shorts?.videosShorts),
  videoAnalysis: isLoaded(shorts?.videoAnalysisShorts),
})

const buildSourceHealth = ({ authenticated, sources, sourceErrors }) =>
  SOURCE_KEYS.reduce((health, source) => {
    if (sourceErrors[source]) {
      health[source] = 'error'
      return health
    }

    if (sources[source]) {
      health[source] = 'ready'
      return health
    }

    health[source] = authenticated ? 'loading' : 'idle'
    return health
  }, {})

export const buildCoreDataStatus = ({ user, shorts, sourceErrors = {} } = {}) => {
  const authenticated = Boolean(user)
  const sources = buildSources(shorts)
  const failedSources = SOURCE_KEYS.filter(source => Boolean(sourceErrors[source]))
  const sourceHealth = buildSourceHealth({
    authenticated,
    sources,
    sourceErrors,
  })

  const accessLoading = authenticated && !sources.roles
  const primaryLoading =
    authenticated &&
    (!sources.clubs || !sources.teams || !sources.players || !sources.roles)
  const secondaryLoading =
    authenticated &&
    (!sources.privatePlayers || !sources.scouting)
  const summaryLoading =
    authenticated &&
    (!sources.meetings ||
      !sources.payments ||
      !sources.games ||
      !sources.externalGames ||
      !sources.videos ||
      !sources.videoAnalysis)

  const loading =
    authenticated &&
    (primaryLoading || secondaryLoading || summaryLoading)

  const readiness = {
    access: !accessLoading,
    primary: !primaryLoading,
    secondary: !secondaryLoading,
    summary: !summaryLoading,
    core: !primaryLoading,
  }

  return {
    authenticated,
    sources,
    sourceHealth,
    failedSources,
    errorCount: failedSources.length,
    hasSourceErrors: failedSources.length > 0,
    error: failedSources.length > 0 ? sourceErrors[failedSources[0]] : null,
    loading,
    accessLoading,
    primaryLoading,
    secondaryLoading,
    summaryLoading,
    accessReady: readiness.access,
    primaryReady: readiness.primary,
    secondaryReady: readiness.secondary,
    summaryReady: readiness.summary,
    coreReady: readiness.core,
    readiness,
  }
}
