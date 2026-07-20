// src/features/reports/service/firestore/publicReportVersions.model.js

import { serverTimestamp } from 'firebase/firestore'

import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import { buildPublicReportVersionId } from '../publicReport.id.js'
import {
  cleanPublicReportValue,
  getReportDateFromContent,
} from './publicReportNormalize.model.js'

export function buildPublicReportVersionOption({
  versionId,
  versionNumber,
  reportContent = {},
  publishedAt = null,
  isCurrent = false,
} = {}) {
  const reportDate = getReportDateFromContent(reportContent)
  const labelParts = []

  if (reportDate) {
    labelParts.push(reportDate)
  }

  if (Number(versionNumber) > 1) {
    labelParts.push(String(versionNumber))
  }

  const resolvedVersionId = versionId || buildPublicReportVersionId(
    versionNumber || 1
  )

  return {
    value: resolvedVersionId,
    label: labelParts.join(' · '),
    reportDate,
    versionId: resolvedVersionId,
    versionNumber: Number(versionNumber) || 0,
    publishedAt: publishedAt || null,
    isCurrent: isCurrent === true,
  }
}

export function buildCurrentPublicReportVersionOption({
  currentData = {},
  currentVersionNumber = 0,
} = {}) {
  const versionNumber = Number(currentVersionNumber) || 0

  if (!versionNumber) return null

  return buildPublicReportVersionOption({
    versionId: currentData.currentVersionId || buildPublicReportVersionId(
      versionNumber
    ),
    versionNumber,
    reportContent: currentData.reportContent || {},
    publishedAt: currentData.publishedAt || null,
    isCurrent: true,
  })
}

export function buildArchivedPublicReportVersionDocument({
  currentData = {},
  reportId,
  versionId,
  versionNumber,
} = {}) {
  return {
    id: versionId,
    reportId,
    versionId,
    versionNumber,

    schemaVersion: currentData.schemaVersion || 1,
    sourceKey: currentData.sourceKey || '',
    reportType: currentData.reportType || '',
    entityType: currentData.entityType || '',
    entityId: currentData.entityId || '',

    status: currentData.status || PUBLIC_REPORT_STATUS.PUBLISHED,
    reportContent: currentData.reportContent || null,

    createdBy: currentData.createdBy || '',
    createdAt: currentData.createdAt || serverTimestamp(),
    updatedAt: currentData.updatedAt || null,
    publishedAt: currentData.publishedAt || null,
    archivedAt: serverTimestamp(),
  }
}

export function collectPublicReportVersionIds(currentData = {}) {
  const versionIds = new Set()
  const currentVersionId = cleanPublicReportValue(
    currentData.currentVersionId || currentData.versionId || ''
  )

  if (currentVersionId) {
    versionIds.add(currentVersionId)
  }

  if (Array.isArray(currentData.versions)) {
    currentData.versions.forEach(version => {
      const versionId = cleanPublicReportValue(
        version?.versionId || version?.value || version?.id || ''
      )

      if (versionId) {
        versionIds.add(versionId)
      }
    })
  }

  return Array.from(versionIds)
}
