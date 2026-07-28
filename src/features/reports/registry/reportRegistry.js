// src/features/reports/registry/reportRegistry.js

import {
  REPORT_DEFINITIONS,
} from './reportDefinitions.registry.js'

export function getReportDefinition(reportType) {
  return REPORT_DEFINITIONS[reportType] || null
}

export function isReportTypeSupported(reportType) {
  return Boolean(getReportDefinition(reportType))
}

export function renderReport(reportType, payload, options = {}) {
  const definition = getReportDefinition(reportType)

  if (!definition || typeof definition.render !== 'function') return null

  return definition.render(payload, options)
}
