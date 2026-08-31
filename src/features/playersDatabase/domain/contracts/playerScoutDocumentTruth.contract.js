// src/features/playersDatabase/domain/contracts/playerScoutDocumentTruth.contract.js

export const PLAYER_SCOUT_DOCUMENT_ROLE = Object.freeze({
  TEAM_SEASON: 'team_season_source',
  PLAYER_DOCUMENT: 'player_document_source',
  SEARCH_INDEX: 'search_index_projection',
})

export const PLAYER_SCOUT_TEAM_SEASON_FIELDS = Object.freeze([
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'professionalScoutProfileIds',
  'preliminaryScoutProfileIds',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
])

export const PLAYER_SCOUT_PLAYER_ROOT_FIELDS = Object.freeze([
  'tracking',
  'playerReview',
  'manualImmediacyDecision',
  'manualImmediacyHistory',
  'verification',
  'events',
  'scoutNarrative',
])

export const PLAYER_SCOUT_PLAYER_SEASON_FIELDS = Object.freeze([
  'scoutProfiles',
  'scoutCombinationIds',
  'scoutOpportunity',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutPlayerInterest',
  'scoutEngineVersion',
])

export const PLAYER_SCOUT_SEARCH_INDEX_FIELDS = Object.freeze([
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'primaryScoutWarnings',
  'primaryScoutScore',
  'primaryScoutTeamGateMode',
  'secondaryScoutProfileId',
  'secondaryScoutProfileStrengthDepthPct',
  'secondaryScoutWarnings',
  'secondaryScoutScore',
  'nearScoutProfileId',
  'nearScoutProfileDistancePct',
  'nearScoutProfileTrend',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
  'scoutProfileIds',
  'scoutPreliminaryProfileIds',
  'scoutCombinationIds',
  'scoutProfileSearchIds',
])

export const PLAYER_SCOUT_LEGACY_FIELDS = Object.freeze([
  'reliability',
  'reliabilityScore',
  'reliabilityLevel',
  'matchedRules',
  'primaryScoutOpportunityStatus',
  'primaryScoutProfileDepthPct',
  'secondaryScoutProfileDepthPct',
])

export const PLAYER_SCOUT_DOCUMENT_TRUTH = Object.freeze({
  teamSeason: {
    role: PLAYER_SCOUT_DOCUMENT_ROLE.TEAM_SEASON,
    description: 'Operational source of truth for one team-season and its current player scout state.',
    scoutFields: PLAYER_SCOUT_TEAM_SEASON_FIELDS,
  },
  playerDocument: {
    role: PLAYER_SCOUT_DOCUMENT_ROLE.PLAYER_DOCUMENT,
    description: 'Source of truth for tracked-player history and human scouting state.',
    rootFields: PLAYER_SCOUT_PLAYER_ROOT_FIELDS,
    seasonScoutFields: PLAYER_SCOUT_PLAYER_SEASON_FIELDS,
  },
  searchIndex: {
    role: PLAYER_SCOUT_DOCUMENT_ROLE.SEARCH_INDEX,
    description: 'Search and list projection only. Never a source of truth for evidence, review or history.',
    scoutFields: PLAYER_SCOUT_SEARCH_INDEX_FIELDS,
  },
})
