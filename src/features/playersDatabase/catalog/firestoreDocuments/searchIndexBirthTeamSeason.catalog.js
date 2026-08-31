// src/features/playersDatabase/catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js

// Firestore source of truth: birth-team-season SearchIndex document.

export const SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT = {
  id: '',
  entityType: 'birthTeamSeason',
  entityId: '',

  displayName: '',
  normalizedDisplayName: '',

  leagueId: '',
  seasonId: '',
  seasonKey: '',
  clubId: '',
  clubLevel: 0,
  clubStrengthLevel: 0,
  birthTeamId: '',
  birthTeamDocumentId: '',
  birthTeamSlot: 1,
  teamId: '',
  teamDocumentId: '',
  // Optional relation projection. Present only after a canonical Team Season
  // exists; League-only indexes intentionally leave it empty.
  teamSeasonDocumentId: '',
  teamUrl: '',
  seasonUrl: '',

  ageGroupId: '',
  ageGroupLabel: '',
  birthYear: 0,
  leagueTotalRound: 0,
  leagueLevel: 0,
  expectedLevelDelta: null,
  region: '',
  seasonDataStatus: '',
  seasonDataCompleteness: '',

  tableRank: 0,
  tableAttackRank: 0,
  tableDefenseRank: 0,

  points: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalsForPerGame: 0,
  goalsAgainstPerGame: 0,
  teamGamePlayed: 0,

  seasonStatus: '',
  normalizationStatus: '',
  normalizationVersion: 0,
  remainingTeamGames: 0,

  projectedPointsRaw: 0,
  projectedPoints: 0,
  projectedGoalsForRaw: 0,
  projectedGoalsFor: 0,
  projectedGoalsAgainstRaw: 0,
  projectedGoalsAgainst: 0,
  projectedTeamGamePlayedRaw: 0,
  projectedTeamGamePlayed: 0,

  teamPerformanceSchemaVersion: 5,

  attackScoutPriorityScore: null,
  attackPriorityLevel: '',
  attackOpportunityType: '',

  defenseScoutPriorityScore: null,
  defensePriorityLevel: '',
  defenseOpportunityType: '',

  teamScoutEngineVersion: '',
  scoutCompetitionRelation: '',
  scoutCompetitionGap: null,
  attackingNeedLevel: 'none',
  defensiveNeedLevel: 'none',
  balanceProblemLevel: 'none',
  recruitmentWindow: 'none',

  balanceDependencyKey: '',
  balancePersistenceContractVersion: '',
  balanceReliability: '',

  balanceMinutesTop5Band: '',
  balanceMinutesTop10Band: '',
  balanceMinutesTop14Band: '',

  balanceUsage70Band: '',
  balanceUsage50Band: '',
  balanceUsage30Band: '',
  balanceUsage10Band: '',

  balanceProductionTop1Band: '',
  balanceProductionTop3Band: '',

  balanceRotationStartsTop5Band: '',
  balanceRotationStartsTop10Band: '',
  balanceRotationStartsTop14Band: '',

  balanceRotationSubInTop5Band: '',
  balanceRotationSubInTop10Band: '',
  balanceRotationSubInTop14Band: '',

  playersCount: 0,
  scoutProfilesSummary: {
    total: 0,
    profileCounts: {},
  },

  sourceCollection: 'leagues',
  sourceDocumentId: '',
  sourceTarget: '',

  updatedAt: null,
};

// Birth-team-season search projection only.
// Never treat this document as the source of truth for Team Balance evidence or team history.
