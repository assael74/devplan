// src/features/playersDatabase/catalog/firestoreDocuments/clubsMaster.catalog.js
// Standalone edits stamp changed owned records and the document with one ISO updatedAt; no-op preserves timestamps.


// clubUrl projects Club.clubUrl, including explicit empty string. URL edits preserve every other Club/Master field.
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
          sourceBirthYear: 0,
          sourceTeamId: '',
          sourceTeamSlot: null,
          currentLeagueLevel: null,
          projectedNextLeagueLevel: null,
          status: 'UNKNOWN',
          source: 'AUTOMATIC',
          reason: null,
        },
      ],
      updatedAt: null,
    },
  ],
  updatedAt: null,
  lastWriteAction: '',
  lastWriteAt: null,
}
