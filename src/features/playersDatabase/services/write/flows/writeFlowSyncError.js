export const buildWriteFlowSyncError = ({
  stage,
  cause,
  results = {},
  name = 'WriteFlowSyncError',
  fallbackMessage = 'Write flow sync failed',
} = {}) => {
  const error = new Error(cause?.message || `${fallbackMessage} at ${stage}`)

  error.name = name
  error.stage = stage
  error.cause = cause
  error.results = results
  error.reason = cause?.reason || ''
  error.completion = cause?.completion || null
  error.recoveryScope = cause?.recoveryScope || null

  return error
}
