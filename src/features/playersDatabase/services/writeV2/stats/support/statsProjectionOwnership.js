// src/features/playersDatabase/services/writeV2/stats/support/statsProjectionOwnership.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const STATS_PLAYER_INDEX_OWNED_FIELDS = new Set([
  'playerDocumentId',
  'primaryPosition',
  'positionLayer',
  'lineClassificationLine',
  'lineClassificationPosition',
  'lineClassificationSource',
  'lineClassificationEvidenceLevel',
  'lineClassificationModelVersion',
  'numShirt',
  'statsStatus',
  'teamTableRank',
  'teamTableAttackRank',
  'teamTableDefenseRank',
  'teamGoalsFor',
  'teamGoalsAgainst',
  'teamGoalsForPerGame',
  'teamGamePlayed',
  'games',
  'goals',
  'yellowCards',
  'minutes',
  'starts',
  'substituteIn',
  'substitutedOut',
  'teamMinutes',
  'teamGames',
  'minutesPerGame',
  'goalsPer90',
  'goalsPerGameDuration',
  'statsSnapshots',
  'gameMinutes',
  'seasonStatus',
  'normalizationStatus',
  'normalizationVersion',
  'remainingTeamGames',
  'teamMinutesPlayed',
  'minutesShareRate',
  'projectedRemainingMinutes',
  'projectedMinutesRaw',
  'projectedMinutes',
  'projectedGoalsRaw',
  'projectedGoals',
  'projectedGamesRaw',
  'projectedGames',
  'projectedStartsRaw',
  'projectedStarts',
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'primaryScoutWarnings',
  'primaryScoutScore',
  'primaryScoutTeamGateMode',
  'nearScoutProfileId',
  'nearScoutProfileDistancePct',
  'nearScoutProfileTrend',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
  'secondaryScoutProfileId',
  'secondaryScoutProfileStrengthDepthPct',
  'secondaryScoutWarnings',
  'secondaryScoutScore',
  'scoutProfileIds',
  'scoutPreliminaryProfileIds',
  'scoutCombinationIds',
  'scoutProfileSearchIds',
  'sourceCollection',
  'sourceDocumentId',
  'sourceTarget',
])

export const STATS_TEAM_INDEX_OWNED_FIELDS = new Set([
  'teamSeasonDocumentId',
  'playersCount',
  'scoutProfilesSummary',
  'attackScoutPriorityScore',
  'attackPriorityLevel',
  'attackOpportunityType',
  'defenseScoutPriorityScore',
  'defensePriorityLevel',
  'defenseOpportunityType',
  'teamScoutEngineVersion',
  'scoutCompetitionRelation',
  'scoutCompetitionGap',
  'attackingNeedLevel',
  'defensiveNeedLevel',
  'balanceProblemLevel',
  'recruitmentWindow',
  'balanceDependencyKey',
  'balancePersistenceContractVersion',
  'scoutInterpretationModelVersion',
  'scoutInterpretationAvailability',
  'scoutInterpretationAvailabilityReason',
  'scoutOffenseFinding',
  'scoutDefenseFinding',
  'teamInterest',
  'squadInterestReason',
])

export const STATS_LEAGUE_TEAM_OWNED_FIELDS = new Set([
  'playersCount',
  'hasPlayers',
  'hasStats',
  'statsComplete',
  'scoutProfilesSummary',
  'teamTaskSignals',
])

export const pickOwnedFields = ({ fields = {}, allowed = new Set(), code = 'STATS_PATCH_SCOPE_INVALID' } = {}) => {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    const error = new Error('Approved Stats patch must be an object')
    error.code = code
    throw error
  }

  const entries = Object.entries(fields)
  const forbidden = entries.find(([key]) => !allowed.has(clean(key)))

  if (forbidden) {
    const error = new Error(`Stats V2 cannot write field outside ownership: ${forbidden[0]}`)
    error.code = code
    throw error
  }

  return Object.fromEntries(entries)
}
