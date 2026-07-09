// features/reports/service/publicReport.id.js

import {
  PUBLIC_REPORT_VERSION_PADDING,
  PUBLIC_REPORT_VERSION_PREFIX,
} from './publicReport.constants.js'

function hashText(value) {
  let hash = 0x811c9dc5
  const text = String(value || '').trim()

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

function cleanIdPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildPublicReportSourceKey({ entityType, entityId, reportType }) {
  return [ entityType, entityId, reportType, ]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(':')
}

export function buildPublicReportId(sourceKey) {
  const text = String(sourceKey || '').trim()

  if (!text) return ''

  const readable = text
    .split(':')
    .map(cleanIdPart)
    .filter(Boolean)
    .join('-')
    .slice(0, 80)

  const hash = hashText(text)

  return `${readable || 'report'}-${hash}`
}

export function buildPublicReportVersionId(versionNumber) {
  const number = Math.max(1, Number(versionNumber) || 1)

  return `${PUBLIC_REPORT_VERSION_PREFIX}${String(number).padStart(
    PUBLIC_REPORT_VERSION_PADDING,
    '0'
  )}`
}
