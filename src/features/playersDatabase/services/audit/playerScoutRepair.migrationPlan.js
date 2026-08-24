// src/features/playersDatabase/services/audit/playerScoutRepair.migrationPlan.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

export const buildPlayerScoutMigrationPlan = ({
  issues = [],
} = {}) => {
  const migrationIssues = (Array.isArray(issues) ? issues : [])
    .filter(issue => clean(issue?.issueKind) === 'migration')

  const byAction = migrationIssues.reduce((result, issue) => {
    const action = clean(
      issue?.repair?.migrationAction ||
      issue?.migrationAction
    ) || 'unclassified'

    if (!result[action]) result[action] = []
    result[action].push(clean(issue.issueId))
    return result
  }, {})

  return {
    issuesCount: migrationIssues.length,
    issueIds: unique(migrationIssues.map(issue => issue.issueId)),
    repairTypes: unique(
      migrationIssues.map(issue => issue?.repair?.repairType)
    ),
    actions: Object.keys(byAction)
      .sort()
      .reduce((result, action) => {
        result[action] = {
          issuesCount: byAction[action].length,
          issueIds: unique(byAction[action]),
        }
        return result
      }, {}),
    hasAutoRepair: Boolean(byAction.auto_repair?.length),
    hasSafeDelete: Boolean(byAction.safe_delete?.length),
    hasReportOnly: Boolean(byAction.report_only?.length),
  }
}
