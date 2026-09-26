// src/features/playersDatabase/catalog/firestoreDocuments/jobActionDocument.catalog.js

// One immutable approved projection action under:
// dbPlayersDatabaseJobs/{jobId}/actions/{actionId}

export const PLAYERS_DATABASE_JOB_ACTION_DOCUMENT_CATALOG = {
  id: '',
  actionId: '',
  jobId: '',

  // Examples: teamSeasonPerformance | teamSearchIndex | playerDocument |
  // playerSearchIndex | clubProjection | leagueMetadata
  type: '',

  order: 0,

  target: {
    collection: '',
    documentId: '',
  },

  // Must match the canonical generation of the parent Job.
  sourceGeneration: '',

  // The exact projection decision approved by the client.
  approvedPayload: {},

  // Optional guard for a target that has an independent owner.
  expectedTargetFingerprint: '',

  // pending | applied | failed
  status: 'pending',

  receipt: {
    appliedAt: null,
    verifiedAt: null,
    outputFingerprint: '',
  },

  error: null,
  createdAt: null,
  updatedAt: null,
}
