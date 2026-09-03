// features/playersDatabase/ui/pages/teamPage/logic/writeFlowReport.logic.js

const clean = value => String(value || '').trim()

export const buildWriteReportFromError = ({
  error,
  flow,
} = {}) => {
  if (error?.writeReport) return error.writeReport

  return {
    flow,
    status: 'failed',
    failedStage: clean(error?.stage) || 'unknown',
    message: clean(error?.message) || 'פעולת הכתיבה נכשלה',
    completedStages: Object.keys(error?.results || {}),
    failures: [{
      code: clean(error?.code) || 'WRITE_FLOW_FAILED',
      message: clean(error?.message) || 'פעולת הכתיבה נכשלה',
    }],
    duplicates: [],
    results: error?.results || {},
  }
}
