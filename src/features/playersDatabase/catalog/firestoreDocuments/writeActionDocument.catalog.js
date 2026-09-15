// Firestore write-action journal. Records the operation that last touched a scope.
export const WRITE_ACTION_DOCUMENT_GENERIC_OBJECT = {
  id: '',
  actionType: '',
  status: 'completed', // completed | failed_after_canonical_commit
  completedAt: null,
  failedAt: null,
  auditScope: null,
  failedStage: '',
  errorMessage: '',
  recoveryRequired: false,
  recoveredAt: null,
  recoveryAction: '',
}
