// features/playersDatabase/services/write/flows/writeFlowReport.js

const clean = value => String(value || '').trim()

export const buildWriteFlowFailure = ({
  stage = '',
  cause = null,
  results = {},
  flow = '',
} = {}) => {
  const nestedFailures = Object.values(results)
    .flatMap(result => Array.isArray(result?.failures) ? result.failures : [])
  const nestedDuplicates = Object.values(results)
    .flatMap(result => Array.isArray(result?.duplicates) ? result.duplicates : [])

  return {
    flow,
    status: 'failed',
    failedStage: stage,
    message: clean(cause?.message) || `Write flow failed at ${stage}`,
    completedStages: Object.keys(results),
    failures: nestedFailures.length
      ? nestedFailures
      : [{
        code: clean(cause?.code) || 'WRITE_FLOW_FAILED',
        message: clean(cause?.message) || 'פעולת הכתיבה נכשלה',
      }],
    duplicates: nestedDuplicates,
    results,
  }
}

export const attachWriteFlowReport = ({
  error,
  stage,
  results,
  flow,
} = {}) => {
  const targetError = error instanceof Error
    ? error
    : new Error(clean(error?.message) || 'Write flow failed')

  targetError.stage = stage
  targetError.results = results
  targetError.writeReport = buildWriteFlowFailure({
    stage,
    cause: targetError,
    results,
    flow,
  })

  return targetError
}

export const assertWriteResultClean = ({
  result = {},
  stage = '',
} = {}) => {
  if (!result?.failedCount && !result?.duplicateCount) return

  const error = new Error(
    result.failedCount
      ? `${result.failedCount} פעולות כתיבה נכשלו`
      : `${result.duplicateCount} כפילויות מלאות נמצאו`
  )

  error.code = result.failedCount
    ? 'WRITE_RESULT_PARTIAL_FAILURE'
    : 'WRITE_RESULT_DUPLICATES_FOUND'
  error.stage = stage
  error.result = result

  throw error
}
