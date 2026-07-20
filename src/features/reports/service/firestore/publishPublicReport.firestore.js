// src/features/reports/service/firestore/publishPublicReport.firestore.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import { buildPublicReportId, buildPublicReportVersionId } from '../publicReport.id.js'
import {
  publicReportRef,
  publicReportVersionRef,
} from '../publicReport.refs.js'
import { buildPublicReportUrl } from '../publicReport.url.js'
import { buildMainPublicReportDocument } from './publicReportDocuments.model.js'
import {
  getPublicReportIndexRef,
  upsertPublicReportIndexDocumentInTransaction,
} from './publicReportIndex.firestore.js'
import {
  buildArchivedPublicReportVersionDocument,
  buildCurrentPublicReportVersionOption,
  buildPublicReportVersionOption,
} from './publicReportVersions.model.js'

const PUBLIC_REPORT_WRITE_DISABLED = false

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

function normalizePublishInput(input) {
  return {
    ...input,
    status: input.status || PUBLIC_REPORT_STATUS.PUBLISHED,
  }
}

export async function publishPublicReport(rawInput) {
  ensurePublicReportInput(rawInput)

  const input = normalizePublishInput(rawInput)
  const reportId = input.id || buildPublicReportId(input.sourceKey)

  if (!reportId) {
    throw new Error('[publishPublicReport] Failed to create report id')
  }

  if (PUBLIC_REPORT_WRITE_DISABLED) {
    return {
      reportId,
      versionId: '',
      versionNumber: 0,
      archived: false,
      writeSkipped: true,
      currentUrl: '',
      versionUrl: '',
    }
  }

  const reportRef = publicReportRef(reportId)

  const result = await runTransaction(db, async transaction => {
    const indexRef = getPublicReportIndexRef(input.reportType)
    const reportSnapshot = await transaction.get(reportRef)
    const indexSnapshot = await transaction.get(indexRef)
    const exists = reportSnapshot.exists()
    const currentData = exists ? reportSnapshot.data() || {} : {}
    const indexData = indexSnapshot.exists()
      ? indexSnapshot.data() || {}
      : {}

    const currentVersionNumber = Number(currentData.currentVersionNumber) || 0
    const nextVersionNumber = exists ? currentVersionNumber + 1 : 1
    const nextVersionId = buildPublicReportVersionId(nextVersionNumber)
    const previousVersions = Array.isArray(currentData.versions)
      ? currentData.versions
      : []

    const fallbackPreviousVersion = currentVersionNumber
      ? buildCurrentPublicReportVersionOption({
          currentData,
          currentVersionNumber,
        })
      : null

    const versions = [
      ...previousVersions,
      ...(previousVersions.length || !fallbackPreviousVersion
        ? []
        : [fallbackPreviousVersion]),
      buildPublicReportVersionOption({
        versionId: nextVersionId,
        versionNumber: nextVersionNumber,
        reportContent: input.reportContent,
        publishedAt: input.reportContent?.meta?.reportDate || null,
        isCurrent: true,
      }),
    ].filter(Boolean)

    if (exists) {
      const archivedVersionNumber = currentVersionNumber || 1
      const archivedVersionId = buildPublicReportVersionId(archivedVersionNumber)

      transaction.set(
        publicReportVersionRef({
          reportId,
          versionId: archivedVersionId,
        }),
        buildArchivedPublicReportVersionDocument({
          currentData,
          reportId,
          versionId: archivedVersionId,
          versionNumber: archivedVersionNumber,
        })
      )
    }

    transaction.set(
      reportRef,
      buildMainPublicReportDocument({
        input,
        reportId,
        versionNumber: nextVersionNumber,
        currentData,
        versions,
      }),
      { merge: true }
    )

    upsertPublicReportIndexDocumentInTransaction({
      transaction,
      indexData,
      input,
      reportId,
      versionId: nextVersionId,
      versionNumber: nextVersionNumber,
      currentData,
      versions,
      now: new Date(),
    })

    return {
      reportId,
      versionId: exists
        ? buildPublicReportVersionId(currentVersionNumber || 1)
        : '',
      versionNumber: nextVersionNumber,
      archived: exists,
    }
  })

  return {
    ...result,
    currentUrl: buildPublicReportUrl({ reportId: result.reportId }),
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
