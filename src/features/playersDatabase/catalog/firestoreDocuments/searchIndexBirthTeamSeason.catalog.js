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
  searchPoints: 0,
  projectedGoalsForRaw: 0,
  projectedGoalsFor: 0,
  searchGoalsFor: 0,
  projectedGoalsAgainstRaw: 0,
  projectedGoalsAgainst: 0,
  searchGoalsAgainst: 0,
  projectedTeamGamePlayedRaw: 0,
  projectedTeamGamePlayed: 0,
  searchTeamGamePlayed: 0,

  teamPerformanceSchemaVersion: 5,

  attackQualityRate: null,
  attackTargetRate: null,
  attackTargetNormalized: null,
  attackTargetLevel: '',
  attackRankingRate: null,
  attackRankingNormalized: null,
  attackRankingLevel: '',
  attackAnomalyRate: null,
  attackAnomalyLevel: '',
  attackScoutPriorityScore: null,
  attackPriorityLevel: '',
  attackOpportunityType: '',

  defenseQualityRate: null,
  defenseTargetRate: null,
  defenseTargetNormalized: null,
  defenseTargetLevel: '',
  defenseRankingRate: null,
  defenseRankingNormalized: null,
  defenseRankingLevel: '',
  defenseAnomalyRate: null,
  defenseAnomalyLevel: '',
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

  playersCount: 0,
  playerSeasonIndexCount: 0,
  scoutProfiledPlayersCount: 0,
  scoutProfilesSummary: {
    total: 0,
    profileCounts: {},
  },

  sourceCollection: 'leagues',
  sourceDocumentId: '',
  sourceTarget: '',

  updatedAt: null,
};

// Player Season search projection only.
// Never treat this document as the source of truth for profile evidence or player history.
