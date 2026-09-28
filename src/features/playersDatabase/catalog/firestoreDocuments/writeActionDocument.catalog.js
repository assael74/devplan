// src/features/playersDatabase/catalog/firestoreDocuments/writeActionDocument.catalog.js

// WriteAction V2 is a small receipt only.
// It does not persist recovery state, jobs, retries, approved payloads,
// expected state, actual state, or full Audit findings.
export const WRITE_ACTION_DOCUMENT_GENERIC_OBJECT = {
  id: '',
  flowType: '',
  operationType: '', // import | clear | delete; older receipts may omit it
  label: '',
  auditTarget: {},
  canonicalStatus: 'pending', // pending | reported | failed_or_unknown
  lastAuditAt: null,
  lastAuditSummary: null, // { ranAt, coverage, findingsCount, checkedDomains }
  status: 'open', // open | closed | abandoned
  createdAt: null,
  updatedAt: null,
}

// Optional Clear Roster execution summary; no plan or resume payload.
export const CLEAR_ROSTER_RECEIPT_EXECUTION_FIELDS = {
  executionStatus: 'running', // running | failed | succeeded
  lastCompletedStep: null, // teamSeason | playerIndex | teamSearchIndex | league | club | clubsMaster | leaguesMaster | audit
  failedStep: null,
  failedTarget: null, // { targetType, documentId }; writeAction for receipt-write failure
}

// Existing Clear Stats metadata is included in the initial atomic receipt write.
export const CLEAR_STATS_RECEIPT_EXECUTION_FIELDS = {
  executionStatus: 'running',
  identity: { birthTeamDocumentId: '', seasonKey: '', leagueId: '', clubId: '' },
  approvedAt: null,
  startedAt: null,
  completedAt: null,
  currentStatsState: '',
  canonicalWrite: { status: 'pending', writeSkipped: false, playersAffected: 0 },
  projectionWrite: { writesAttempted: 0, writesCompleted: 0, writesSkipped: 0, targets: [], failedTarget: null },
  audit: { status: 'pending', failuresCount: 0 },
  failedStep: null,
  error: null,
}
