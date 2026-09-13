// Firestore projection contract: compact all-clubs first-look document.

export const CLUBS_MASTER_DOCUMENT_ID = 'all'

export const CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG = {
  projectionVersion: 1,
  clubs: [
    {
      clubId: '',
      externalClubId: '',
      clubUrl: '',
      name: '',
      shortName: '',
      clubLevel: 0,
      clubStrengthLevel: 0,
      ageGroups: [
        {
          ageGroupId: '',
          ageGroupLabel: '',
          current: [],
          previous: [],
        },
      ],
      competitionPaths: [
        {
          birthYear: 0,
          currentLeagueLevel: null,
          projectedNextLeagueLevel: null,
          status: 'UNKNOWN',
          source: 'AUTOMATIC',
        },
      ],
      updatedAt: null,
    },
  ],
  updatedAt: null,
  lastWriteAction: '',
  lastWriteAt: null,
}
