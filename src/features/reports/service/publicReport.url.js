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

export function buildPublicReportShareUrl({ reportId, versionId = '', origin = '', }) {
  const baseOrigin = resolveOrigin(origin)

  const path = versionId
    ? `/share/reports/${reportId}/${versionId}`
    : `/share/reports/${reportId}`

  return `${baseOrigin}${path}`
}

function clean(value) {
  return String(value ?? '').trim()
}

function formatMetaItem(item = {}) {
  const label = clean(item.label)
  const value = clean(item.value ?? item.text ?? item.count ?? item.shortLabel)

  if (label && value) {
    return `${label}: ${value}`
  }

  return label || value
}

export function buildPublicReportShareText({
  report = {},
  url = '',
} = {}) {
  const reportContent = report.reportContent || {}
  const meta = reportContent.meta || {}
  const entity = reportContent.entity || {}

  const title = clean(meta.title || reportContent.title || report.reportType || 'דוח')
  const subtitle = clean(meta.subtitle || reportContent.subtitle || '')
  const entityName = clean(
    entity.teamName ||
    entity.name ||
    reportContent.entityName ||
    ''
  )
  const reportDate = clean(meta.reportDate || reportContent.reportDate || '')
  const metaItems = Array.isArray(meta.items) ? meta.items : []

  const lines = [title]

  if (entityName) {
    lines.push(`ל: ${entityName}`)
  }

  if (subtitle) {
    lines.push(subtitle)
  }

  if (reportDate) {
    lines.push(`תאריך: ${reportDate}`)
  }

  const formattedMetaItems = metaItems
    .map(formatMetaItem)
    .filter(Boolean)

  if (formattedMetaItems.length) {
    lines.push('')
    lines.push(...formattedMetaItems)
  }

  if (url) {
    lines.push('')
    lines.push(url)
  }

  return lines.join('\n')
}
