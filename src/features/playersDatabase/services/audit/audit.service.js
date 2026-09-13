import { runPlayerDatabaseAuditChecks } from './audit.checks.js'

// Public orchestration entry point. Reads, domain detection, and active-finding
// reconciliation remain ordered inside the audit pipeline.
export async function runPlayerDatabaseAudit(options = {}) {
  return runPlayerDatabaseAuditChecks(options)
}
