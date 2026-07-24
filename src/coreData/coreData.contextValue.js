// src/coreData/coreData.contextValue.js

const EMPTY_MAP = new Map()

export const EMPTY_CORE_DATA = {
  clubs: [],
  teams: [],
  players: [],
  privatePlayers: [],
  playersWithoutTeam: [],
  scouting: [],
  meetings: [],
  payments: [],
  roles: [],
  videos: [],
  videoAnalysis: [],
  games: [],

  clubById: EMPTY_MAP,
  teamById: EMPTY_MAP,
  playerById: EMPTY_MAP,
  meetingsById: EMPTY_MAP,
  paymentsById: EMPTY_MAP,
  meetingsByPlayerId: EMPTY_MAP,
}

const EMPTY_SHORTS = {
  clubsShorts: [],
  teamsShorts: [],
  playersShorts: [],
  privatePlayersShorts: [],
  scoutingShorts: [],
  meetingsShorts: [],
  paymentsShorts: [],
  gamesShorts: [],
  externalGamesShorts: [],
  rolesShorts: [],
  videosShorts: [],
  videoAnalysisShorts: [],
}

const buildStatusValue = ({ status, patchEntity, sourceErrors }) => ({
  loading: status.loading,
  accessLoading: status.accessLoading,
  primaryLoading: status.primaryLoading,
  secondaryLoading: status.secondaryLoading,
  summaryLoading: status.summaryLoading,
  accessReady: status.accessReady,
  primaryReady: status.primaryReady,
  secondaryReady: status.secondaryReady,
  summaryReady: status.summaryReady,
  coreReady: status.coreReady,
  readiness: status.readiness,
  sourceStatus: status.sources,
  sourceHealth: status.sourceHealth,
  failedSources: status.failedSources,
  errorCount: status.errorCount,
  error: status.error,
  sourceErrors,
  hasSourceErrors: status.hasSourceErrors,
  patchEntity,
})

export const buildCoreDataContextValue = ({
  user,
  status,
  shorts,
  sourceErrors,
  patchEntity,
  resolvedCoreData,
  accessRoles,
} = {}) => {
  const statusValue = buildStatusValue({
    status,
    patchEntity,
    sourceErrors,
  })

  if (!user) {
    return {
      ...statusValue,
      loading: false,
      accessLoading: false,
      primaryLoading: false,
      secondaryLoading: false,
      summaryLoading: false,
      accessReady: true,
      primaryReady: true,
      secondaryReady: true,
      summaryReady: true,
      coreReady: true,
      failedSources: [],
      errorCount: 0,
      error: null,
      sourceErrors: {},
      hasSourceErrors: false,
      ...EMPTY_SHORTS,
      ...EMPTY_CORE_DATA,
    }
  }

  if (status.loading) {
    return {
      ...statusValue,
      ...shorts,
      ...(resolvedCoreData || {
        ...EMPTY_CORE_DATA,
        roles: accessRoles,
      }),
    }
  }

  return {
    ...statusValue,
    loading: false,
    ...shorts,
    ...(resolvedCoreData || EMPTY_CORE_DATA),
  }
}
