// features/reports/service/publicReport.firestore.js

import {
  getDoc,
  getDocs,
  orderBy,
  query,
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
  publicReportVersionsCollectionRef,
  publicReportVersionRef,
} from './publicReport.refs.js'

import {
  buildPublicReportUrl,
} from './publicReport.url.js'

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

function getPublishedStatus(status) {
  return status || PUBLIC_REPORT_STATUS.PUBLISHED
}

function getReportDateFromContent(reportContent = {}) {
  return (
    reportContent?.meta?.reportDate ||
    reportContent?.reportDate ||
    ''
  )
}

function buildVersionOption({
  versionId,
  versionNumber,
  reportContent = {},
  publishedAt = null,
  isCurrent = false,
} = {}) {
  const reportDate = getReportDateFromContent(reportContent)
  const labelParts = []

  if (reportDate) labelParts.push(reportDate)
  if (Number(versionNumber) > 1) {
    labelParts.push(String(versionNumber))
  }

  return {
    value: versionId || buildPublicReportVersionId(versionNumber || 1),
    label: labelParts.join(' · '),
    reportDate,
    versionId: versionId || buildPublicReportVersionId(versionNumber || 1),
    versionNumber: Number(versionNumber) || 0,
    publishedAt: publishedAt || null,
    isCurrent: isCurrent === true,
  }
}

function buildCurrentVersionOption({
  currentData = {},
  currentVersionNumber = 0,
} = {}) {
  const versionNumber = Number(currentVersionNumber) || 0
  if (!versionNumber) return null

  return buildVersionOption({
    versionId: currentData.currentVersionId || buildPublicReportVersionId(versionNumber),
    versionNumber,
    reportContent: currentData.reportContent || {},
    publishedAt: currentData.publishedAt || null,
    isCurrent: true,
  })
}

async function loadReportVersionOptions({ reportId, currentData = {} } = {}) {
  if (!reportId) return []

  if (Array.isArray(currentData.versions) && currentData.versions.length) {
    return currentData.versions
  }

  const snapshots = await getDocs(
    query(
      publicReportVersionsCollectionRef(reportId),
      orderBy('versionNumber', 'asc')
    )
  )

  const options = snapshots.docs
    .map(snapshot => {
      const data = snapshot.data() || {}

      return buildVersionOption({
        versionId: snapshot.id,
        versionNumber: Number(data.versionNumber) || 0,
        reportContent: data.reportContent || {},
        publishedAt: data.publishedAt || null,
      })
    })
    .filter(Boolean)

  const currentVersionOption = buildCurrentVersionOption({
    currentData,
    currentVersionNumber: Number(currentData.currentVersionNumber) || 0,
  })

  if (currentVersionOption) {
    const currentIndex = options.findIndex(option => option.value === currentVersionOption.value)

    if (currentIndex >= 0) {
      options[currentIndex] = currentVersionOption
    } else {
      options.push(currentVersionOption)
    }
  }

  return options
}

function buildArchivedVersionDocument({
  currentData,
  reportId,
  versionId,
  versionNumber,
}) {
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

function buildMainReportDocument({
  input,
  reportId,
  versionNumber,
  currentData = {},
  versions = [],
}) {
  return {
    id: reportId,

    schemaVersion: input.schemaVersion || 1,
    sourceKey: input.sourceKey,
    reportType: input.reportType,
    entityType: input.entityType,
    entityId: input.entityId,

    status: getPublishedStatus(input.status),

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

    currentVersionId: data.currentVersionId || buildPublicReportVersionId(Number(data.currentVersionNumber) || 1),
    currentVersionNumber: Number(data.currentVersionNumber) || 0,
    reportContent: data.reportContent || null,
    versions: Array.isArray(data.versions) ? data.versions : [],

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
    versions: Array.isArray(data.versions) ? data.versions : [],

    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    publishedAt: data.publishedAt || null,
    archivedAt: data.archivedAt || null,
  }
}

export async function publishPublicReport(input) {
  ensurePublicReportInput(input)

  const reportId = input.id || buildPublicReportId(input.sourceKey)

  if (!reportId) {
    throw new Error('[publishPublicReport] Failed to create report id')
  }

  if (PUBLIC_REPORT_WRITE_DISABLED) {
    console.group('[PublicReport] Firestore write disabled')
    console.log('reportId:', reportId)
    console.log('sourceKey:', input.sourceKey)
    console.log('reportType:', input.reportType)
    console.log('entityType:', input.entityType)
    console.log('entityId:', input.entityId)
    console.log('reportContent:', input.reportContent)
    console.log('input:', input)
    console.groupEnd()

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
    const reportSnapshot = await transaction.get(reportRef)
    const exists = reportSnapshot.exists()
    const currentData = exists ? reportSnapshot.data() : {}

    const currentVersionNumber = Number(currentData.currentVersionNumber) || 0
    const nextVersionNumber = exists ? currentVersionNumber + 1 : 1
    const currentVersionId = buildPublicReportVersionId(nextVersionNumber)
    const previousVersions = Array.isArray(currentData.versions) ? currentData.versions : []
    const fallbackPreviousVersion = currentVersionNumber
      ? buildCurrentVersionOption({
          currentData,
          currentVersionNumber,
        })
      : null
    const versions = [
      ...previousVersions,
      ...(previousVersions.length ? [] : fallbackPreviousVersion ? [fallbackPreviousVersion] : []),
      buildVersionOption({
        versionId: currentVersionId,
        versionNumber: nextVersionNumber,
        reportContent: input.reportContent,
        publishedAt: getReportDateFromContent(input.reportContent) || null,
        isCurrent: true,
      }),
    ].filter(Boolean)

    if (exists) {
      const archivedVersionNumber = currentVersionNumber || 1
      const archivedVersionId = buildPublicReportVersionId(archivedVersionNumber)

      const versionRef = publicReportVersionRef({
        reportId,
        versionId: archivedVersionId,
      })

      const versionDocument = buildArchivedVersionDocument({
        currentData,
        reportId,
        versionId: archivedVersionId,
        versionNumber: archivedVersionNumber,
      })

      transaction.set(versionRef, versionDocument)
    }

    const mainDocument = buildMainReportDocument({
      input,
      reportId,
      versionNumber: nextVersionNumber,
      currentData,
      versions,
    })

    transaction.set(reportRef, mainDocument, { merge: true })

    return {
      reportId,
      versionId: exists ? buildPublicReportVersionId(currentVersionNumber || 1) : '',
      versionNumber: nextVersionNumber,
      archived: exists,
    }
  })

  return {
    ...result,
    currentUrl: buildPublicReportUrl({ reportId: result.reportId }),
    versionUrl: result.versionId ? buildPublicReportUrl({ reportId: result.reportId, versionId: result.versionId }) : '',
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

  const report = normalizeCurrentReport({
    snapshot,
    data,
  })

  const versions = await loadReportVersionOptions({
    reportId,
    currentData: report,
  })

  return {
    ...report,
    versions,
    reportContent: {
      ...(report.reportContent || {}),
      versions,
    },
  }
}

export async function getPublicReportVersion({ reportId, versionId }) {
  if (!reportId || !versionId) {
    throw new Error(
      '[getPublicReportVersion] reportId and versionId are required'
    )
  }

  const [snapshot, currentSnapshot] = await Promise.all([
    getDoc(publicReportVersionRef({
      reportId,
      versionId,
    })),
    getDoc(publicReportRef(reportId)),
  ])

  if (!snapshot.exists()) return null

  const data = snapshot.data()

  if (data.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  const report = normalizeVersionReport({
    reportId,
    snapshot,
    data,
  })

  const currentData = currentSnapshot.exists() ? currentSnapshot.data() : {}
  const versions = await loadReportVersionOptions({
    reportId,
    currentData,
  })

  return {
    ...report,
    versions,
    reportContent: {
      ...(report.reportContent || {}),
      versions,
    },
  }
}

export async function getPublicReport({ reportId, versionId = '' }) {
  if (versionId) {
    return getPublicReportVersion({
      reportId,
      versionId,
    })
  }

  return getCurrentPublicReport(reportId)
}
