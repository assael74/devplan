// src/features/reports/service/firestore/publicReportNormalize.model.js

import { buildPublicReportVersionId } from '../publicReport.id.js'
import {
  buildPublicReportShareUrl,
  buildPublicReportUrl,
} from '../publicReport.url.js'

export function cleanPublicReportValue(value) {
  return String(value ?? '').trim()
}

export function publicReportValueToMillis(value) {
  if (!value) return 0

  if (typeof value?.toMillis === 'function') {
    return value.toMillis()
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime()
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  const time = new Date(value).getTime()

  return Number.isFinite(time) ? time : 0
}

export function getReportDateFromContent(reportContent = {}) {
  return reportContent?.meta?.reportDate || reportContent?.reportDate || ''
}

export function resolveReportTitle(reportContent = {}, fallback = '') {
  const meta = reportContent?.meta || {}

  return cleanPublicReportValue(
    meta.title || reportContent.title || fallback || 'דוח'
  )
}

export function resolveReportSubtitle(reportContent = {}) {
  const meta = reportContent?.meta || {}

  return cleanPublicReportValue(
    meta.subtitle || reportContent.subtitle || ''
  )
}

export function normalizeCurrentPublicReport({ snapshot, data = {} } = {}) {
  return {
    id: snapshot.id,
    reportId: snapshot.id,

    schemaVersion: data.schemaVersion || 1,
    sourceKey: data.sourceKey || '',
    reportType: data.reportType || '',
    entityType: data.entityType || '',
    entityId: data.entityId || '',

    status: data.status || '',

    currentVersionId: data.currentVersionId || buildPublicReportVersionId(
      Number(data.currentVersionNumber) || 1
    ),
    currentVersionNumber: Number(data.currentVersionNumber) || 0,
    reportContent: data.reportContent || null,
    versions: Array.isArray(data.versions) ? data.versions : [],

    viewsCount: Number(data.viewsCount) || 0,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    publishedAt: data.publishedAt || null,
  }
}

export function normalizeVersionPublicReport({
  reportId,
  snapshot,
  data = {},
} = {}) {
  return {
    id: snapshot.id,
    reportId,
    versionId: snapshot.id,
    versionNumber: Number(data.versionNumber) || 0,

    schemaVersion: data.schemaVersion || 1,
    sourceKey: data.sourceKey || '',
    reportType: data.reportType || '',
    entityType: data.entityType || '',
    entityId: data.entityId || '',

    status: data.status || '',
    reportContent: data.reportContent || null,
    versions: Array.isArray(data.versions) ? data.versions : [],

    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    publishedAt: data.publishedAt || null,
    archivedAt: data.archivedAt || null,
  }
}

export function enrichPublicReportUrls(report = {}) {
  const reportId = report.reportId
  const versionId = report.currentVersionId || report.versionId || ''

  return {
    ...report,
    url: buildPublicReportUrl({ reportId }),
    versionUrl: versionId
      ? buildPublicReportUrl({ reportId, versionId })
      : '',
    shareUrl: buildPublicReportShareUrl({ reportId, versionId }),
  }
}
