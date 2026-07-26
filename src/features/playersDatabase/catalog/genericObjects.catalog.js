// features/playersDatabase/catalog/genericObjects.catalog.js

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

  current: [
    {
      seasonId: '',
      leagueId: '',
      teamUrl: '',
      birthYear: 0,
      leagueTotalRound: 0,
      seasonKey: '',
      teamPlayers: [
        {
          playerId: '',
          externalPlayerId: '',
          playerDocumentId: '',
          fullName: '',
          normalizedName: '',
          aliases: [],
          playerUrl: '',
          numShirt: '',

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
          },

          scoutProfiles: [],
          updatedAt: null,
        },
      ],
      scoutProfiles: [],
      teamStats: {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        attackPerformance: null,
        defensePerformance: null,
      },
      updatedAt: null,
    },
  ],

  history: [
    {
      seasonId: '',
      seasonKey: '',
      leagueId: '',
      teamUrl: '',
      birthYear: 0,
      leagueTotalRound: 0,
      teamPlayers: [
        {
          playerId: '',
          externalPlayerId: '',
          playerDocumentId: '',
          fullName: '',
          normalizedName: '',
          aliases: [],
          playerUrl: '',
          numShirt: '',

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
          },

          scoutProfiles: [],
          updatedAt: null,
        },
      ],
      scoutProfiles: [],
      teamStats: {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        attackPerformance: null,
        defensePerformance: null,
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

  ageGroupId: '',
  ageGroupLabel: '',
  birthYear: 0,
  leagueTotalRound: 0,
  leagueLevel: 0,
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

  attackPerformance: null,
  attackPerformanceRate: null,
  attackPerformanceLevel: '',
  attackRankingRate: null,
  attackRankingLevel: '',
  attackCombinedRate: null,
  attackCombinedLevel: '',
  attackQualityRate: null,
  attackScoutPriorityRate: null,
  attackPriorityRate: null,
  attackPriorityLevel: '',
  attackAnomalyLevel: '',
  defensePerformance: null,
  defensePerformanceRate: null,
  defensePerformanceLevel: '',
  defenseRankingRate: null,
  defenseRankingLevel: '',
  defenseCombinedRate: null,
  defenseCombinedLevel: '',
  defenseQualityRate: null,
  defenseScoutPriorityRate: null,
  defensePriorityRate: null,
  defensePriorityLevel: '',
  defenseAnomalyLevel: '',
  teamScoutPriorityLevels: [],
  playersCount: 0,
  playerSeasonIndexCount: 0,
  scoutProfiledPlayersCount: 0,

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

  playerId: '',
  playerDocumentId: '',
  externalPlayerId: '',
  playerUrl: '',
  favorite: false,
  notes: '',

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
  region: '',

  primaryPosition: '',
  positionLayer: '',
  numShirt: '',
  seasonNotes: '',

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



