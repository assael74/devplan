// features/playersDatabase/ui/pages/teamPage/logic/writeFlowReport.logic.js

const clean = value => String(value || '').trim()

export const buildWriteReportFromError = ({
  error,
  flow,
} = {}) => {
  if (error?.writeReport) return error.writeReport

  const recoveryRequired = Boolean(error?.results?.recoveryRequired)

  return {
    flow,
    status: recoveryRequired ? 'partial' : 'failed',
    failedStage: clean(error?.stage) || 'unknown',
    message: recoveryRequired
      ? 'נתוני עונת הקבוצה נשמרו, אך סנכרון המסמכים הנגזרים נכשל ודורש תיקון.'
      : clean(error?.message) || 'פעולת הכתיבה נכשלה',
    recoveryRequired,
    auditScope: error?.auditScope || null,
    completedStages: Object.keys(error?.results || {}),
    failures: [{
      code: clean(error?.code) || 'WRITE_FLOW_FAILED',
      message: clean(error?.message) || 'פעולת הכתיבה נכשלה',
    }],
    duplicates: [],
    results: error?.results || {},
  }
}
