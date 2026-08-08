// features/playersDatabase/catalog/genericObjects.catalog.js

// Firestore schema contracts.
// These objects represent the real document shapes written to Firestore.
// Keep their fields and nested structures aligned with the active write builders.
// The four active contracts below must not be treated as UI catalogs or examples:
// PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG,
// BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG,
// SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
// SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT.

export const PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG = {
  id: 'all',
  docType: 'leagues_master',
  updatedAt: null,

  summary: {
    leaguesCount: 0,
    seasonsCount: 0,
    teamsCount: 0,
    playersCount: 0,
    playersWithScoutProfileCount: 0,
    scoutProfilesCount: 0,
  },

  leagues: [
    {
      leagueId: '',
      leagueDocumentId: '',
      leagueName: '',
      leagueUrl: '',
      region: '',
      ageGroupId: '',
      ageGroupLabel: '',
      active: true,
      updatedAt: null,

      seasons: [
        {
          seasonId: '',
          seasonKey: '',
          leagueDocumentId: '',
          leagueName: '',
          leagueUrl: '',
          ageGroupId: '',
          ageGroupLabel: '',
          birthYear: 0,
          teamsCount: 0,
          playersCount: 0,
          playersWithScoutProfileCount: 0,
          scoutProfilesCount: 0,
          tableRankCount: 0,
          currentDocRef: '',
          historyDocRef: '',
          updatedAt: null,
        },
      ],
    },
  ],
};

export const LEAGUES_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  leagueId: '',
  region: '',
  ageGroupId: '',
  ageGroupLabel: '',

  current: {
    seasonId: '',
    seasonKey: '',
    seasonUrl: '',
    birthYear: 0, // חובה
    leagueTotalRound: 0,
    tableRank: [
      {
        rank: 0,
        clubId: '',
        birthTeamId: '',
        birthTeamSlot: 1,
        teamId: '',
        teamUrl: '',
        teamStats: {
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          teamGamePlayed: 0,
        },
        scoutProfilesSummary: {
          total: 0,
          profileCounts: {},
        },
        updatedAt: null,
      },
    ],
    updatedAt: null,
  },

  history: [
    {
      seasonId: '',
      seasonKey: '',
      seasonUrl: '',
      birthYear: 0, // חובה
      leagueTotalRound: 0,
      tableRank: [
        {
          rank: 0,
          clubId: '',
          birthTeamId: '',
          birthTeamSlot: 1,
          teamId: '',
          teamUrl: '',
          teamStats: {
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            teamGamePlayed: 0,
          },
          scoutProfilesSummary: {
            total: 0,
            profileCounts: {},
          },
          updatedAt: null,
        },
      ],
      updatedAt: null,
    },
  ],

  updatedAt: null,
};

export const BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  clubId: '',
  birthTeamId: '',
  birthYear: 0,
  birthTeamSlot: 1,
  displayName: '',
  teamId: '',
  createdAt: null,

  current: [
    {
      seasonId: '',
      ageGroupId: '',
      seasonStatus: '',
      leagueId: '',
      teamUrl: '',
      birthYear: 0,
      leagueTotalRound: 0,
      seasonKey: '',
      playersCount: 0,
      playerSeasonIndexCount: 0,
      scoutProfiledPlayersCount: 0,
      scoutProfilesSummary: {
        total: 0,
        profileCounts: {},
      },
      teamPlayers: [
        {
          playerId: '',
          externalPlayerId: '',
          playerDocumentId: '',
          identityKey: '',
          fullName: '',
          normalizedName: '',
          aliases: [],
          playerUrl: '',
          notes: '',
          numShirt: '',
          statsStatus: 'missing',

          rosterStatus: 'regular',
          isYoungerAgeGroup: false,

          primaryPosition: '',
          positionLayer: '',

          playerStats: {
            games: 0,
            goals: 0,
            yellowCards: 0,
            minutes: 0,
            starts: 0,
            substituteIn: 0,
            substitutedOut: 0,
            teamMinutes: 0,
            teamGames: 0,
            teamRank: null,
            teamGoalsFor: 0,
            teamGoalsAgainst: 0,
            teamAttackPerformance: null,
            teamDefensePerformance: null,
            minutesPerGame: 0,
            goalsPer90: 0,
          },

          scoutProfiles: [],
          scoutCombinations: [],
          updatedAt: null,
        },
      ],
      scoutProfiles: [],
      teamStats: {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        teamGamePlayed: 0,
      },
      updatedAt: null,
    },
  ],

  history: [
    {
      seasonId: '',
      ageGroupId: '',
      seasonStatus: '',
      seasonKey: '',
      leagueId: '',
      teamUrl: '',
      birthYear: 0,
      leagueTotalRound: 0,
      playersCount: 0,
      playerSeasonIndexCount: 0,
      scoutProfiledPlayersCount: 0,
      scoutProfilesSummary: {
        total: 0,
        profileCounts: {},
      },
      teamPlayers: [
        {
          playerId: '',
          externalPlayerId: '',
          playerDocumentId: '',
          identityKey: '',
          fullName: '',
          normalizedName: '',
          aliases: [],
          playerUrl: '',
          notes: '',
          numShirt: '',
          statsStatus: 'missing',

          rosterStatus: 'regular',
          isYoungerAgeGroup: false,

          primaryPosition: '',
          positionLayer: '',

          playerStats: {
            games: 0,
            goals: 0,
            yellowCards: 0,
            minutes: 0,
            starts: 0,
            substituteIn: 0,
            substitutedOut: 0,
            teamMinutes: 0,
            teamGames: 0,
            teamRank: null,
            teamGoalsFor: 0,
            teamGoalsAgainst: 0,
            teamAttackPerformance: null,
            teamDefensePerformance: null,
            minutesPerGame: 0,
            goalsPer90: 0,
          },

          scoutProfiles: [],
          scoutCombinations: [],
          updatedAt: null,
        },
      ],
      scoutProfiles: [],
      teamStats: {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        teamGamePlayed: 0,
      },
      updatedAt: null,
    },
  ],

  updatedAt: null,
};

export const PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  externalPlayerId: '',
  fullName: '',
  normalizedName: '',
  birthYear: null,
  birthDate: null,
  status: '',
  favorite: false,
  notes: '',
  createdAt: null,
  updatedAt: null,

  current: [
    {
      seasonId: '',
      seasonKey: '',
      leagueId: '',
      clubId: '',
      birthTeamId: '',
      birthTeamDocumentId: '',
      birthTeamSlot: 1,
      teamId: '',
      playerUrl: '',
      notes: '',
      primaryPosition: '',
      positionLayer: '',
      numShirt: '',
      statsStatus: 'missing',
      playerStats: {
        games: 0,
        goals: 0,
        yellowCards: 0,
        minutes: 0,
        starts: 0,
        substituteIn: 0,
        substitutedOut: 0,
        teamMinutes: 0,
        teamGames: 0,
        teamRank: null,
        teamGoalsFor: 0,
        teamGoalsAgainst: 0,
        teamAttackPerformance: null,
        teamDefensePerformance: null,
      },
      scoutProfiles: [
        {
          profileId: '',
          positionContext: '',
          reliability: {
            level: '',
            score: null,
          },
          score: null,
        }
      ],
      scoutCombinations: [],
      updatedAt: null,
    },
  ],

  history: [
    {
      seasonId: '',
      seasonKey: '',
      leagueId: '',
      clubId: '',
      birthTeamId: '',
      birthTeamDocumentId: '',
      birthTeamSlot: 1,
      teamId: '',
      playerUrl: '',
      notes: '',
      primaryPosition: '',
      positionLayer: '',
      numShirt: '',
      statsStatus: 'missing',
      playerStats: {
        games: 0,
        goals: 0,
        yellowCards: 0,
        minutes: 0,
        starts: 0,
        substituteIn: 0,
        substitutedOut: 0,
        teamMinutes: 0,
        teamGames: 0,
        teamRank: null,
        teamGoalsFor: 0,
        teamGoalsAgainst: 0,
        teamAttackPerformance: null,
        teamDefensePerformance: null,
      },
      scoutProfiles: [
        {
          profileId: '',
          positionContext: '',
          reliability: {
            level: '',
            score: null,
          },
          score: null,
        }
      ],
      scoutCombinations: [],
      closedAt: null,
    },
  ],

  updatedAt: null,
};

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

  teamPerformanceSchemaVersion: 4,

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

export const SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT = {
  id: '',
  entityType: 'playerSeason',
  entityId: '',

  displayName: '',
  normalizedDisplayName: '',
  aliases: [],
  identityKey: '',
  identityBirthYear: 0,

  playerId: '',
  playerDocumentId: '',
  externalPlayerId: '',
  playerUrl: '',
  notes: '',
  rosterStatus: 'regular',
  isYoungerAgeGroup: false,

  leagueId: '',
  seasonId: '',
  seasonKey: '',
  clubId: '',
  clubLevel: 0,
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

  primaryPosition: '',
  positionLayer: '',
  numShirt: '',
  seasonNotes: '',
  statsStatus: 'missing',

  teamTableRank: 0,
  teamTableAttackRank: 0,
  teamTableDefenseRank: 0,
  teamGoalsFor: 0,
  teamGoalsAgainst: 0,
  teamGoalsForPerGame: 0,
  teamGamePlayed: 0,

  games: 0,
  goals: 0,
  yellowCards: 0,
  minutes: 0,
  starts: 0,
  substituteIn: 0,
  substitutedOut: 0,
  teamMinutes: 0,
  teamGames: 0,
  minutesPerGame: 0,
  goalsPer90: 0,
  goalsPerGameDuration: 0,

  gameMinutes: 0,
  seasonStatus: '',
  normalizationStatus: '',
  normalizationVersion: 0,
  remainingTeamGames: 0,
  teamMinutesPlayed: 0,
  minutesShareRate: 0,
  projectedRemainingMinutes: 0,

  projectedMinutesRaw: 0,
  projectedMinutes: 0,
  searchMinutes: 0,
  projectedGoalsRaw: 0,
  projectedGoals: 0,
  searchGoals: 0,
  projectedGamesRaw: 0,
  projectedGames: 0,
  searchGames: 0,
  projectedStartsRaw: 0,
  projectedStarts: 0,
  searchStarts: 0,

  primaryScoutProfileId: '',
  primaryScoutReliabilityLevel: '',
  primaryScoutScore: null,

  secondaryScoutProfileId: '',
  secondaryScoutReliabilityLevel: '',
  secondaryScoutScore: null,
  scoutProfileIds: [],
  scoutCombinationIds: [],
  scoutProfileSearchIds: [],

  sourceCollection: 'players',
  sourceDocumentId: '',
  sourceTarget: '',

  updatedAt: null,
};

export const TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG = BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG

export const SEARCHINDEX_DATABASE_GENERIC_OBJECTS_CATALOG = {
  birthTeamSeason: SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
  playerSeason: SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
};
