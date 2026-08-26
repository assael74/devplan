// src/shared/scouting/scouting.version.js

export const SCOUTING_MODEL_ID = 'scouting'
export const SCOUTING_MODEL_VERSION = 'scouting-v2'
export const SCOUTING_MODEL_RELEASE = '2026.08.25'
export const SCOUTING_VERSION_SCHEMA = 1

export const PLAYER_SCOUT_LAYER_VERSION = 'players-v2'
export const TEAM_SCOUT_PERFORMANCE_VERSION = 'team-performance-v1'
export const TEAM_BALANCE_VERSION = 'team-balance-v1'
export const TEAM_BALANCE_OUTPUT_CONTRACT_VERSION = 'team-balance-output-v1'
export const TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION = 'team-balance-persistence-v1'

export const TEAM_BALANCE_MINUTES_BENCHMARK_VERSION = 'minutes-distribution-v1'
export const TEAM_BALANCE_PRODUCTION_BENCHMARK_VERSION = 'production-distribution-v1'
export const TEAM_BALANCE_ROTATION_BENCHMARK_VERSION = 'rotation-distribution-v1'

export const SCOUTING_LAYER_STATUS = Object.freeze({
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
})

export const SCOUTING_MODEL_REGISTRY = Object.freeze({
  modelId: SCOUTING_MODEL_ID,
  modelVersion: SCOUTING_MODEL_VERSION,
  releaseVersion: SCOUTING_MODEL_RELEASE,
  schemaVersion: SCOUTING_VERSION_SCHEMA,
  updatedAt: '2026-08-25',
  layers: Object.freeze({
    players: Object.freeze({
      version: PLAYER_SCOUT_LAYER_VERSION,
      engineVersion: 'scouting-v2',
      status: SCOUTING_LAYER_STATUS.ACTIVE,
    }),
    teams: Object.freeze({
      performance: Object.freeze({
        version: TEAM_SCOUT_PERFORMANCE_VERSION,
        status: SCOUTING_LAYER_STATUS.ACTIVE,
        sourceOfTruth: 'leagueDocument',
      }),
      balance: Object.freeze({
        version: TEAM_BALANCE_VERSION,
        outputContractVersion: TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
        persistenceContractVersion: TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION,
        status: SCOUTING_LAYER_STATUS.IN_PROGRESS,
        domainIntegrationStatus: 'adapter_ready',
        sourceOfTruth: 'teamDocumentStats',
        benchmarks: Object.freeze({
          minutesDistribution: Object.freeze({
            version: TEAM_BALANCE_MINUTES_BENCHMARK_VERSION,
            status: 'initial_sample',
          }),
          productionDistribution: Object.freeze({
            version: TEAM_BALANCE_PRODUCTION_BENCHMARK_VERSION,
            status: 'descriptive_only',
          }),
          rotationDistribution: Object.freeze({
            version: TEAM_BALANCE_ROTATION_BENCHMARK_VERSION,
            status: 'initial_sample',
          }),
        }),
      }),
    }),
  }),
})
