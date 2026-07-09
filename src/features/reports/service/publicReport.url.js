// features/reports/service/publicReport.url.js

import {
  PUBLIC_REPORT_ROUTE,
} from './publicReport.constants.js'

function resolveOrigin(origin) {
  if (origin) return origin

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

export function buildPublicReportUrl({ reportId, versionId = '', origin = '', }) {
  const baseOrigin = resolveOrigin(origin)

  const path = versionId
    ? `${PUBLIC_REPORT_ROUTE}/${reportId}/${versionId}`
    : `${PUBLIC_REPORT_ROUTE}/${reportId}`

  return `${baseOrigin}${path}`
}
