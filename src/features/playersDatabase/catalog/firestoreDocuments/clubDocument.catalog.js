// Firestore projection contract: one multi-age-group Club document.
// Canonical facts remain owned by League / Team Season documents.

export const CLUBS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  clubId: '',
  externalClubId: '',
  name: '',
  shortName: '',
  sourceName: '',
  clubUrl: '',
  clubLevel: 0,
  clubStrengthLevel: 0,
  aliases: [],
  searchAliases: [],

  ageGroups: [
    {
      ageGroupId: '',
      ageGroupLabel: '',
      seasons: [
        {
          teamId: '',
          seasonId: '',
          seasonKey: '',
          seasonStatus: '',
          birthYear: 0,
          league: {
            leagueId: '',
            leagueName: '',
            region: '',
            leagueLevel: null,
          },
          performance: {
            tableRank: null,
            tableAttackRank: null,
            tableDefenseRank: null,
            points: 0,
            teamGamePlayed: 0,
            goalsFor: 0,
            goalsAgainst: 0,
          },
          playersCount: 0,
          teamTaskSignals: {
            offense: false,
            defense: false,
          },
          lineStructure: {
            lines: {
              attack: { playersCount: 0 },
              defense: { playersCount: 0 },
              midfield: { playersCount: 0 },
            },
          },
          scoutProfilesSummary: {
            total: 0,
            profileCounts: {},
          },
          transfers: {
            coverageStatus: 'NOT_LOADED',
            in: {
              total: 0,
              up: 0,
              lateral: 0,
              down: 0,
              unknown: 0,
            },
            out: {
              total: 0,
              up: 0,
              lateral: 0,
              down: 0,
              unknown: 0,
            },
          },
          updatedAt: null,
        },
      ],
    },
  ],

  competitionPaths: [
    {
      birthYear: 0,
      seasons: [
        {
          teamId: '',
          seasonId: '',
          seasonKey: '',
          seasonStatus: '',
          ageGroupId: '',
          leagueId: '',
          leagueName: '',
          leagueLevel: null,
          competitionProjection: {
            automatic: {
              projectedNextLeagueLevel: null,
              status: 'UNKNOWN',
            },
            manual: null,
            effective: {
              projectedNextLeagueLevel: null,
              status: 'UNKNOWN',
              source: 'AUTOMATIC',
            },
          },
          updatedAt: null,
        },
      ],
      nextCompetitionPath: {
        sourceBirthYear: 0,
        projectedNextLeagueLevel: null,
        status: 'UNKNOWN',
        source: 'AUTOMATIC',
        reason: null,
        updatedAt: null,
      },
    },
  ],

  projectionVersion: 1,
  createdAt: null,
  updatedAt: null,
  lastWriteAction: '',
  lastWriteAt: null,
}
