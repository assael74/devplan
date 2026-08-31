// src/features/playersDatabase/catalog/firestoreDocuments/birthTeamDocument.catalog.js

// Firestore source of truth: stable birth-team root document.
// All season-owned state lives in dbBirthTeamSeasons.

export const BIRTH_TEAM_DOCUMENT_OPTIONAL_SCHEMA_PATHS = Object.freeze([])

export const BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  clubId: '',
  birthTeamId: '',
  birthTeamDocumentId: '',
  birthYear: 0,
  birthTeamSlot: 1,
  displayName: '',
  seasons: [
    {
      seasonKey: '',
      seasonDocumentId: '',
      seasonStatus: '',
    },
  ],
  createdAt: null,
  updatedAt: null,
}
