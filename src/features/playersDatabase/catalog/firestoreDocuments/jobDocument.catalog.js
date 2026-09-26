// src/features/playersDatabase/catalog/firestoreDocuments/jobDocument.catalog.js

// Durable execution contract for League, Roster and Stats imports.
// The Job owns operational state. Canonical and projection documents do not.

export const PLAYERS_DATABASE_JOB_DOCUMENT_CATALOG = {
  id: '',
  jobId: '',

  // league | roster | stats
  type: '',

  // queued | processing | completed | failed
  status: 'queued',

  scope: {
    leagueId: '',
    seasonId: '',
    seasonKey: '',
    teamId: '',
    teamSeasonDocumentId: '',
  },

  // The canonical generation approved by the user and committed with this Job.
  sourceGeneration: '',

  // A compact immutable reference to the approved client decision.
  // Large sync operations belong in the Job actions subcollection.
  approvedPlan: {
    version: 1,
    fingerprint: '',
    actionCount: 0,
  },

  actionsSummary: {
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
  },

  attempt: {
    token: null,
    leaseExpiresAt: null,
    count: 0,
    claimedAt: null,
  },

  verification: {
    status: 'pending',
    verifiedAt: null,
    error: null,
  },

  retryCount: 0,
  error: null,

  requestedAt: null,
  startedAt: null,
  completedAt: null,
  failedAt: null,
  updatedAt: null,
}
