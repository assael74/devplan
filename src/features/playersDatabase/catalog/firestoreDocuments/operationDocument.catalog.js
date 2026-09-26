// src/features/playersDatabase/catalog/firestoreDocuments/operationDocument.catalog.js

// Durable global gate for the single-user major-operation contract.

export const PLAYERS_DATABASE_ACTIVE_OPERATION_DOCUMENT_CATALOG = {
  id: 'active',
  jobId: '',
  jobType: '',
  status: 'queued',
  scope: {
    leagueId: '',
    seasonKey: '',
    teamSeasonDocumentId: '',
  },
  sourceGeneration: '',
  createdAt: null,
  updatedAt: null,
}
