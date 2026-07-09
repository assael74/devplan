// features/reports/service/publicReport.firestore.js

import {
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import {
  db,
} from '../../../services/firebase/firebase.js'

import {
  PUBLIC_REPORT_STATUS,
} from '../reports.constants.js'

import {
  buildPublicReportId,
  buildPublicReportVersionId,
} from './publicReport.id.js'

import {
  publicReportRef,
  publicReportVersionRef,
} from './publicReport.refs.js'

import {
  buildPublicReportUrl,
} from './publicReport.url.js'

function ensurePublicReportInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('[publishPublicReport] input is required')
  }

  if (!input.sourceKey) {
    throw new Error('[publishPublicReport] sourceKey is required')
  }

  if (!input.reportType) {
    throw new Error('[publishPublicReport] reportType is required')
  }

  if (!input.entityType) {
    throw new Error('[publishPublicReport] entityType is required')
  }

  if (!input.entityId) {
    throw new Error('[publishPublicReport] entityId is required')
  }

  if (!input.reportContent || typeof input.reportContent !== 'object') {
    throw new Error('[publishPublicReport] reportContent is required')
  }
}

function getPublishedStatus(status) {
  return status || PUBLIC_REPORT_STATUS.PUBLISHED
}

function buildVersionDocument({ input, reportId, versionId, versionNumber }) {
  return {
    id: versionId,
    reportId,
    versionId,
    versionNumber,

    schemaVersion: input.schemaVersion || 1,
    sourceKey: input.sourceKey,
    reportType: input.reportType,
    entityType: input.entityType,
    entityId: input.entityId,

    status: getPublishedStatus(input.status),
    reportContent: input.reportContent,

    createdBy: input.createdBy || '',
    createdAt: serverTimestamp(),
    publishedAt: serverTimestamp(),
  }
}

function buildMainReportDocument({ input, reportId, versionId, versionNumber, currentData }) {
  return {
    id: reportId,

    schemaVersion: input.schemaVersion || 1,
    sourceKey: input.sourceKey,
    reportType: input.reportType,
    entityType: input.entityType,
    entityId: input.entityId,

    status: getPublishedStatus(input.status),

    currentVersionId: versionId || null,
    currentVersionNumber: versionNumber,
    reportContent: input.reportContent,

    createdBy: currentData.createdBy || input.createdBy || '',
    createdAt: currentData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: serverTimestamp(),

    viewsCount: Number(currentData.viewsCount) || 0,
  }
}

function normalizeCurrentReport({ snapshot, data }) {
  return {
    id: snapshot.id,
    reportId: snapshot.id,

    schemaVersion: data.schemaVersion || 1,
    sourceKey: data.sourceKey || '',
    reportType: data.reportType || '',
    entityType: data.entityType || '',
    entityId: data.entityId || '',

    status: data.status || '',

    currentVersionId: data.currentVersionId || '',
    currentVersionNumber: Number(data.currentVersionNumber) || 0,
    reportContent: data.reportContent || null,

    viewsCount: Number(data.viewsCount) || 0,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    publishedAt: data.publishedAt || null,
  }
}

function normalizeVersionReport({ reportId, snapshot, data }) {
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

    createdAt: data.createdAt || null,
    publishedAt: data.publishedAt || null,
  }
}

export async function publishPublicReport(input) {
  ensurePublicReportInput(input)

  const reportId = input.id || buildPublicReportId(input.sourceKey)

  if (!reportId) {
    throw new Error('[publishPublicReport] Failed to create report id')
  }

  const reportRef = publicReportRef(reportId)

  const result = await runTransaction(db, async transaction => {
    const reportSnapshot = await transaction.get(reportRef)

    const currentData = reportSnapshot.exists()
      ? reportSnapshot.data()
      : {}

    const currentVersionNumber =
      Number(currentData.currentVersionNumber) || 0

    const hasExistingReport = reportSnapshot.exists()
    const archivedVersionNumber = currentVersionNumber || 1
    const nextVersionNumber = hasExistingReport
      ? archivedVersionNumber + 1
      : 1
    const archivedVersionId = hasExistingReport
      ? buildPublicReportVersionId(archivedVersionNumber)
      : ''

    const mainDocument = buildMainReportDocument({
      input,
      reportId,
      versionId: archivedVersionId,
      versionNumber: nextVersionNumber,
      currentData,
    })

    if (hasExistingReport) {
      const versionRef = publicReportVersionRef({
        reportId,
        versionId: archivedVersionId,
      })

      const versionDocument = buildVersionDocument({
        input: {
          ...currentData,
          reportContent: currentData.reportContent || input.reportContent,
        },
        reportId,
        versionId: archivedVersionId,
        versionNumber: archivedVersionNumber,
      })

      transaction.set(versionRef, versionDocument)
    }

    transaction.set(reportRef, mainDocument, { merge: true })

    return {
      reportId,
      versionId: archivedVersionId,
      versionNumber: nextVersionNumber,
    }
  })

  return {
    ...result,
    currentUrl: buildPublicReportUrl({
      reportId: result.reportId,
    }),
    versionUrl: result.versionId
      ? buildPublicReportUrl({
        reportId: result.reportId,
        versionId: result.versionId,
      })
      : '',
  }
}

export async function publishPublicReportDocument(input) {
  return publishPublicReport(input)
}

export async function getCurrentPublicReport(reportId) {
  if (!reportId) {
    throw new Error('[getCurrentPublicReport] reportId is required')
  }

  const snapshot = await getDoc(publicReportRef(reportId))

  if (!snapshot.exists()) return null

  const data = snapshot.data()

  if (data.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  return normalizeCurrentReport({
    snapshot,
    data,
  })
}

export async function getPublicReportVersion({ reportId, versionId, }) {
  if (!reportId || !versionId) {
    throw new Error(
      '[getPublicReportVersion] reportId and versionId are required'
    )
  }

  const snapshot = await getDoc(publicReportVersionRef({
    reportId,
    versionId,
  }))

  if (!snapshot.exists()) return null

  const data = snapshot.data()

  if (data.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  return normalizeVersionReport({
    reportId,
    snapshot,
    data,
  })
}

export async function getPublicReport({ reportId, versionId = '', }) {
  if (versionId) {
    return getPublicReportVersion({
      reportId,
      versionId,
    })
  }

  return getCurrentPublicReport(reportId)
}
