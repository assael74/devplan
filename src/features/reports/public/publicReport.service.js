// features/reports/public/publicReport.service.js

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../services/firebase/firebase.js'

import {
  PUBLIC_REPORT_STATUS,
} from '../reports.constants.js'

import {
  PUBLIC_REPORTS_COLLECTION,
  PUBLIC_REPORT_VERSIONS_COLLECTION,
} from './publicReport.constants.js'

import {
  buildPublicReportUrl,
  buildPublicReportVersionId,
} from './publicReport.model.js'

function ensurePublishInput(input) {
  if (!input?.sourceKey) {
    throw new Error('[publishPublicReport] sourceKey is required')
  }

  if (!input?.reportType) {
    throw new Error('[publishPublicReport] reportType is required')
  }

  if (!input?.entityId) {
    throw new Error('[publishPublicReport] entityId is required')
  }

  if (!input?.payload || typeof input.payload !== 'object') {
    throw new Error('[publishPublicReport] payload is required')
  }
}

function createReportId(sourceKey) {
  return String(sourceKey)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, '-')
    .replace(/:+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function publishPublicReport(input) {
  ensurePublishInput(input)

  const reportId = createReportId(input.sourceKey)

  if (!reportId) {
    throw new Error('[publishPublicReport] Failed to create report id')
  }

  const reportRef = doc(
    db,
    PUBLIC_REPORTS_COLLECTION,
    reportId
  )

  const result = await runTransaction(db, async transaction => {
    const reportSnapshot = await transaction.get(reportRef)
    const currentData = reportSnapshot.exists()
      ? reportSnapshot.data()
      : {}

    const currentVersionNumber =
      Number(currentData.currentVersionNumber) || 0

    const nextVersionNumber = currentVersionNumber + 1
    const versionId = buildPublicReportVersionId(nextVersionNumber)

    const versionRef = doc(
      reportRef,
      PUBLIC_REPORT_VERSIONS_COLLECTION,
      versionId
    )

    transaction.set(versionRef, {
      schemaVersion: input.schemaVersion,
      reportType: input.reportType,
      status: PUBLIC_REPORT_STATUS.PUBLISHED,
      versionId,
      versionNumber: nextVersionNumber,
      payload: input.payload,
      createdBy: input.createdBy || '',
      createdAt: serverTimestamp(),
    })

    transaction.set(
      reportRef,
      {
        schemaVersion: input.schemaVersion,
        reportType: input.reportType,
        status: PUBLIC_REPORT_STATUS.PUBLISHED,
        sourceKey: input.sourceKey,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        title: input.title,
        currentVersionId: versionId,
        currentVersionNumber: nextVersionNumber,
        currentPayload: input.payload,
        allowPrint: input.allowPrint !== false,
        createdBy: currentData.createdBy || input.createdBy || '',
        createdAt: currentData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      reportId,
      versionId,
      versionNumber: nextVersionNumber,
    }
  })

  return {
    ...result,
    currentUrl: buildPublicReportUrl({
      reportId: result.reportId,
    }),
    versionUrl: buildPublicReportUrl({
      reportId: result.reportId,
      versionId: result.versionId,
    }),
  }
}

export async function getCurrentPublicReport(reportId) {
  if (!reportId) {
    throw new Error('[getCurrentPublicReport] reportId is required')
  }

  const reportRef = doc(
    db,
    PUBLIC_REPORTS_COLLECTION,
    reportId
  )

  const snapshot = await getDoc(reportRef)

  if (!snapshot.exists()) return null

  const data = snapshot.data()

  if (data.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  return {
    id: snapshot.id,
    reportId: snapshot.id,
    versionId: data.currentVersionId,
    versionNumber: data.currentVersionNumber,
    reportType: data.reportType,
    status: data.status,
    title: data.title,
    entityName: data.entityName,
    allowPrint: data.allowPrint !== false,
    payload: data.currentPayload,
  }
}

export async function getPublicReportVersion({
  reportId,
  versionId,
}) {
  if (!reportId || !versionId) {
    throw new Error(
      '[getPublicReportVersion] reportId and versionId are required'
    )
  }

  const versionRef = doc(
    db,
    PUBLIC_REPORTS_COLLECTION,
    reportId,
    PUBLIC_REPORT_VERSIONS_COLLECTION,
    versionId
  )

  const snapshot = await getDoc(versionRef)

  if (!snapshot.exists()) return null

  const data = snapshot.data()

  if (data.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  return {
    id: snapshot.id,
    reportId,
    versionId: snapshot.id,
    versionNumber: data.versionNumber,
    reportType: data.reportType,
    status: data.status,
    allowPrint: true,
    payload: data.payload,
  }
}

export async function getPublicReport({
  reportId,
  versionId = '',
}) {
  if (versionId) {
    return getPublicReportVersion({
      reportId,
      versionId,
    })
  }

  return getCurrentPublicReport(reportId)
}
