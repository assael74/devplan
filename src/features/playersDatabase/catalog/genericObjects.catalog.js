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
          profileScore: null,
          profileReliability: null,
          profileWarnings: [],
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
          profileScore: null,
          profileReliability: null,
          profileWarnings: [],
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

  primaryScoutProfileId: '',
  primaryScoutReliabilityLevel: '',
  primaryScoutScore: null,

  secondaryScoutProfileId: '',
  secondaryScoutReliabilityLevel: '',
  secondaryScoutScore: null,

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



