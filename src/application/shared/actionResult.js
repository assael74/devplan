// src/application/shared/actionResult.js

function normalizeError(error) {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown application error',
      cause: null,
    }
  }

  return {
    code: error.code || 'APPLICATION_ERROR',
    message: error.message || String(error),
    cause: error,
    ...(error.meta ? { meta: error.meta } : {}),
  }
}

export function actionSuccess({ data = null, metadata = {} } = {}) {
  return {
    ok: true,
    data,
    error: null,
    metadata,
  }
}

export function actionFailure({ error, metadata = {} } = {}) {
  return {
    ok: false,
    data: null,
    error: normalizeError(error),
    metadata,
  }
}

export function unwrapActionResult(result) {
  if (result?.ok) return result.data

  const cause = result?.error?.cause
  if (cause instanceof Error) throw cause

  const error = new Error(result?.error?.message || 'Application action failed')
  error.code = result?.error?.code || 'APPLICATION_ERROR'
  error.meta = result?.error?.meta || result?.metadata || null
  throw error
}
