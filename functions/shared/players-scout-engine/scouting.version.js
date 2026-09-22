// src/shared/scouting/scouting.version.js

export const SCOUTING_MODEL_ID = 'scouting'
export const SCOUTING_MODEL_VERSION = 'scouting-v2'
export const SCOUTING_SHADOW_ENGINE_VERSION = `${SCOUTING_MODEL_VERSION}-shadow`
export const SCOUTING_MODEL_RELEASE = '2026.08.25'
export const SCOUTING_VERSION_SCHEMA = 1

export const PLAYER_SCOUT_LAYER_VERSION = 'players-v2'
export const TEAM_SCOUT_PERFORMANCE_VERSION = 'team-performance-v1'
export const TEAM_BALANCE_VERSION = 'team-balance-v13'
export const TEAM_LINE_CLASSIFICATION_VERSION = 'player-line-v7'
export const TEAM_BALANCE_OUTPUT_CONTRACT_VERSION = 'team-balance-output-v21'
export const TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION = 'team-balance-persistence-v21'


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
      engineVersion: SCOUTING_MODEL_VERSION,
      status: SCOUTING_LAYER_STATUS.ACTIVE,
    }),
    teams: Object.freeze({
      performance: Object.freeze({
        version: TEAM_SCOUT_PERFORMANCE_VERSION,
        status: SCOUTING_LAYER_STATUS.ACTIVE,
        sourceOfTruth: 'leagueDocument',
      }),
      lineClassification: Object.freeze({
        version: TEAM_LINE_CLASSIFICATION_VERSION,
        status: SCOUTING_LAYER_STATUS.IN_PROGRESS,
        sourceOfTruth: 'teamSeasonDocumentStats',
      }),
      balance: Object.freeze({
        version: TEAM_BALANCE_VERSION,
        outputContractVersion: TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
        persistenceContractVersion: TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION,
        status: SCOUTING_LAYER_STATUS.IN_PROGRESS,
        domainIntegrationStatus: 'adapter_ready',
        sourceOfTruth: 'teamSeasonDocumentStats',
      }),
    }),
  }),
})
