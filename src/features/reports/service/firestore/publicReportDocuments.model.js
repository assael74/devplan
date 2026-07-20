// src/features/reports/service/firestore/publicReportDocuments.model.js

import { serverTimestamp } from 'firebase/firestore'

import { buildPublicReportVersionId } from '../publicReport.id.js'

export function buildMainPublicReportDocument({
  input,
  reportId,
  versionNumber,
  currentData = {},
  versions = [],
} = {}) {
  return {
    id: reportId,

    schemaVersion: input.schemaVersion || 1,
    sourceKey: input.sourceKey,
    reportType: input.reportType,
    entityType: input.entityType,
    entityId: input.entityId,

    status: input.status,

    currentVersionId: buildPublicReportVersionId(versionNumber),
    currentVersionNumber: versionNumber,
    versions,
    reportContent: {
      ...input.reportContent,
      versions,
    },

    createdBy: currentData.createdBy || input.createdBy || '',
    createdAt: currentData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: serverTimestamp(),

    viewsCount: Number(currentData.viewsCount) || 0,
  }
}
