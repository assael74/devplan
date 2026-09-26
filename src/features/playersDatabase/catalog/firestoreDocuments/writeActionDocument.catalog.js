// src/features/playersDatabase/catalog/firestoreDocuments/writeActionDocument.catalog.js

// WriteAction V2 is a small receipt only.
// It does not persist recovery state, jobs, retries, approved payloads,
// expected state, actual state, or full Audit findings.
export const WRITE_ACTION_DOCUMENT_GENERIC_OBJECT = {
  id: '',
  flowType: '',
  label: '',
  auditTarget: {},
  canonicalStatus: 'pending', // pending | reported | failed_or_unknown
  lastAuditAt: null,
  lastAuditSummary: null, // { ranAt, coverage, findingsCount, checkedDomains }
  status: 'open', // open | closed | abandoned
  createdAt: null,
  updatedAt: null,
}
