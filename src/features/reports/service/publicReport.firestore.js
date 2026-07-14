// features/reports/service/publicReport.firestore.js

import {
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../services/firebase/firebase.js'
import { PUBLIC_REPORT_STATUS } from '../reports.constants.js'
import {
  PUBLIC_REPORT_INDEXES_COLLECTION,
} from './publicReport.constants.js'
import {
  buildPublicReportId,
  buildPublicReportVersionId,
} from './publicReport.id.js'
import {
  publicReportRef,
  publicReportIndexesCollectionRef,
  publicReportVersionsCollectionRef,
  publicReportVersionRef,
} from './publicReport.refs.js'
import {
  buildPublicReportShareUrl,
  buildPublicReportUrl,
} from './publicReport.url.js'

const PUBLIC_REPORT_WRITE_DISABLED = false
const PUBLIC_REPORT_INDEX_SCHEMA_VERSION = 1

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

function ensurePublicReportIndexInput(input) {
  ensurePublicReportInput(input)

  if (!input.reportType) {
    throw new Error('[updatePublicReportIndexDocument] reportType is required')
  }
}

function getPublishedStatus(status) {
  return status || PUBLIC_REPORT_STATUS.PUBLISHED
}

function getReportDateFromContent(reportContent = {}) {
  return reportContent?.meta?.reportDate || reportContent?.reportDate || ''
}

function clean(value) {
  return String(value ?? '').trim()
}

function toMillis(value) {
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

function resolveReportTitle(reportContent = {}, fallback = '') {
  const meta = reportContent?.meta || {}

  return clean(meta.title || reportContent.title || fallback || '׳“׳•׳—')
}

function resolveReportSubtitle(reportContent = {}) {
  const meta = reportContent?.meta || {}

  return clean(meta.subtitle || reportContent.subtitle || '')
}

function resolveReportVersionNumber(report = {}) {
  const versionNumber = Number(
    report.currentVersionNumber ||
    report.versionNumber ||
    0
  )

  return Number.isFinite(versionNumber) ? versionNumber : 0
}

function resolveReportVersionId(report = {}) {
  return clean(
    report.currentVersionId ||
    report.versionId ||
    ''
  )
}

function resolvePublicReportUrlForIndex({ reportId, versionId = '' } = {}) {
  return buildPublicReportUrl({
    reportId,
    versionId,
  })
}

function resolvePublicReportVersionUrlForIndex({
  reportId,
  versionId = '',
} = {}) {
  return versionId
    ? buildPublicReportUrl({
        reportId,
        versionId,
      })
    : ''
}

function buildReportIndexItem({
  reportId,
  reportType,
  entityType,
  entityId,
  sourceKey = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
  reportContent = {},
  versionId = '',
  currentVersionId = '',
  versionNumber = 0,
  publishedAt = null,
  updatedAt = null,
  createdAt = null,
  now = new Date(),
} = {}) {
  const resolvedVersionId = clean(currentVersionId || versionId)
  const reportDate = clean(getReportDateFromContent(reportContent))
  const title = resolveReportTitle(reportContent, reportType)
  const subtitle = resolveReportSubtitle(reportContent)
  const effectiveUpdatedAt = updatedAt || now
  const effectivePublishedAt = publishedAt || now

  return {
    reportId,
    reportType,
    entityType,
    entityId,
    sourceKey,
    status,
    title,
    subtitle,
    reportDate,
    currentVersionId: resolvedVersionId,
    versionId: resolvedVersionId,
    versionNumber: Number(versionNumber) || 0,
    url: resolvePublicReportUrlForIndex({
      reportId,
    }),
    versionUrl: resolvePublicReportVersionUrlForIndex({
      reportId,
      versionId: resolvedVersionId,
    }),
    publishedAt: effectivePublishedAt,
    updatedAt: effectiveUpdatedAt,
    createdAt: createdAt || effectivePublishedAt,
  }
}

function sortReportIndexItems(items = []) {
  return items
    .slice()
    .sort((left, right) => {
      const leftTime = Math.max(
        toMillis(left.updatedAt),
        toMillis(left.publishedAt),
        toMillis(left.createdAt)
      )
      const rightTime = Math.max(
        toMillis(right.updatedAt),
        toMillis(right.publishedAt),
        toMillis(right.createdAt)
      )

      return rightTime - leftTime
    })
}

function buildReportIndexDocument({
  reportType,
  currentData = {},
  item,
  now = new Date(),
} = {}) {
  const existingItems = Array.isArray(currentData.items)
    ? currentData.items
    : []

  const nextItems = sortReportIndexItems([
    ...existingItems.filter(currentItem => (
      currentItem?.reportId !== item.reportId
    )),
    item,
  ])

  return {
    id: reportType,
    schemaVersion: currentData.schemaVersion || PUBLIC_REPORT_INDEX_SCHEMA_VERSION,
    reportType,
    count: nextItems.length,
    latestReportId: nextItems[0]?.reportId || item.reportId || '',
    latestUpdatedAt: nextItems[0]?.updatedAt || now,
    items: nextItems,
    updatedAt: serverTimestamp(),
  }
}

function getPublicReportIndexRef(reportType) {
  const safeReportType = clean(reportType)

  if (!safeReportType) {
    throw new Error('[updatePublicReportIndexDocument] reportType is required')
  }

  return doc(
    db,
    PUBLIC_REPORT_INDEXES_COLLECTION,
    safeReportType
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

  if (reportDate) {
    labelParts.push(reportDate)
  }

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

async function loadReportVersionOptions({
  reportId,
  currentData = {},
} = {}) {
  if (!reportId) return []

  if (Array.isArray(currentData.versions) && currentData.versions.length) {
    return currentData.versions
  }

  const versionsQuery = query(
    publicReportVersionsCollectionRef(reportId),
    orderBy('versionNumber', 'asc')
  )

  const snapshots = await getDocs(versionsQuery)

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
    const currentIndex = options.findIndex(option => (
      option.value === currentVersionOption.value
    ))

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

function normalizeCurrentReport({
  snapshot,
  data,
}) {
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

function normalizeVersionReport({
  reportId,
  snapshot,
  data,
}) {
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

function enrichPublicReportUrls(report) {
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

function collectReportVersionIds(currentData = {}) {
  const versionIds = new Set()
  const currentVersionId = clean(currentData.currentVersionId || currentData.versionId || '')

  if (currentVersionId) {
    versionIds.add(currentVersionId)
  }

  if (Array.isArray(currentData.versions)) {
    currentData.versions.forEach(version => {
      const versionId = clean(
        version?.versionId ||
        version?.value ||
        version?.id ||
        ''
      )

      if (versionId) {
        versionIds.add(versionId)
      }
    })
  }

  return Array.from(versionIds)
}

function buildIndexItemFromCurrentData({
  reportId,
  currentData = {},
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
  now = new Date(),
} = {}) {
  const reportType = clean(currentData.reportType || '')
  const currentVersionId = clean(currentData.currentVersionId || '')
  const versionNumber = Number(currentData.currentVersionNumber) || 0
  const reportContent = currentData.reportContent || {}

  return {
    reportId,
    reportType,
    entityType: clean(currentData.entityType || ''),
    entityId: clean(currentData.entityId || ''),
    sourceKey: clean(currentData.sourceKey || ''),
    status,
    title: resolveReportTitle(reportContent, reportType),
    subtitle: resolveReportSubtitle(reportContent),
    reportDate: clean(getReportDateFromContent(reportContent)),
    currentVersionId,
    versionId: currentVersionId,
    versionNumber,
    url: resolvePublicReportUrlForIndex({ reportId }),
    versionUrl: currentVersionId
      ? resolvePublicReportVersionUrlForIndex({
          reportId,
          versionId: currentVersionId,
        })
      : '',
    publishedAt: currentData.publishedAt || now,
    updatedAt: now,
    createdAt: currentData.createdAt || now,
  }
}

function buildIndexDocumentWithoutItem({
  reportType,
  currentData = {},
  reportId,
  now = new Date(),
} = {}) {
  const existingItems = Array.isArray(currentData.items)
    ? currentData.items
    : []

  const nextItems = sortReportIndexItems(
    existingItems.filter(item => item?.reportId !== reportId)
  )

  return {
    id: reportType,
    schemaVersion: currentData.schemaVersion || PUBLIC_REPORT_INDEX_SCHEMA_VERSION,
    reportType,
    count: nextItems.length,
    latestReportId: nextItems[0]?.reportId || '',
    latestUpdatedAt: nextItems[0]?.updatedAt || now,
    items: nextItems,
    updatedAt: now,
  }
}

function upsertPublicReportIndexDocumentInTransaction({
  transaction,
  indexData = {},
  input,
  reportId,
  versionId,
  versionNumber,
  currentData = {},
  versions = [],
  now = new Date(),
} = {}) {
  const indexRef = getPublicReportIndexRef(input.reportType)
  const indexItem = buildReportIndexItem({
    reportId,
    reportType: input.reportType,
    entityType: input.entityType,
    entityId: input.entityId,
    sourceKey: input.sourceKey,
    status: getPublishedStatus(input.status),
    reportContent: input.reportContent,
    versionId,
    currentVersionId: buildPublicReportVersionId(versionNumber),
    versionNumber,
    publishedAt: currentData.publishedAt || now,
    updatedAt: now,
    createdAt: currentData.createdAt || now,
    now,
  })

  const mainUrl = resolvePublicReportUrlForIndex({
    reportId,
  })
  const versionUrl = resolvePublicReportVersionUrlForIndex({
    reportId,
    versionId,
  })

  const enrichedIndexItem = {
    ...indexItem,
    url: mainUrl,
    versionUrl,
    currentVersionId: buildPublicReportVersionId(versionNumber),
    versionId: versionId || buildPublicReportVersionId(versionNumber),
  }

  const nextDocument = buildReportIndexDocument({
    reportType: input.reportType,
    currentData: indexData,
    item: enrichedIndexItem,
    now,
  })

  transaction.set(indexRef, nextDocument, { merge: true })

  return {
    indexRef,
    indexData,
    indexItem: enrichedIndexItem,
    nextDocument,
    versions,
  }
}

export async function updatePublicReportIndexDocument(input) {
  ensurePublicReportIndexInput(input)

  const reportId = input.reportId || input.id || buildPublicReportId(input.sourceKey)
  const now = input.now instanceof Date ? input.now : new Date()
  const versionId = clean(
    input.currentVersionId ||
    input.versionId ||
    buildPublicReportVersionId(Number(input.versionNumber) || 1)
  )
  const versionNumber = Number(input.versionNumber) || 1

  if (!reportId) {
    throw new Error('[updatePublicReportIndexDocument] reportId is required')
  }

  return runTransaction(db, async transaction => {
    const indexRef = getPublicReportIndexRef(input.reportType)
    const indexSnapshot = await transaction.get(indexRef)
    const indexData = indexSnapshot.exists()
      ? indexSnapshot.data() || {}
      : {}

    return upsertPublicReportIndexDocumentInTransaction({
      transaction,
      indexData,
      input,
      reportId,
      versionId,
      versionNumber,
      currentData: input.currentData || {},
      versions: Array.isArray(input.versions) ? input.versions : [],
      now,
    })
  })
}

export async function getPublishedPublicReports() {
  const snapshots = await getDocs(
    query(
      publicReportIndexesCollectionRef(),
      orderBy('latestUpdatedAt', 'desc')
    )
  )

  return snapshots.docs.flatMap(snapshot => {
    const data = snapshot.data() || {}
    const items = Array.isArray(data.items) ? data.items : []

    return items
      .map(item => ({
        ...item,
        id: item.reportId || item.id || '',
        reportId: item.reportId || item.id || '',
        reportType: item.reportType || data.reportType || snapshot.id || '',
        reportContent: item.reportContent || {},
        versions: Array.isArray(item.versions) ? item.versions : [],
      }))
      .filter(item => item.reportId)
  })
}

export async function revokePublicReport({
  reportId,
  reportType = '',
}) {
  const safeReportId = clean(reportId)
  const safeReportType = clean(reportType)

  if (!safeReportId) {
    throw new Error('[revokePublicReport] reportId is required')
  }

  const reportRef = publicReportRef(safeReportId)
  const now = new Date()

  return runTransaction(db, async transaction => {
    const reportSnapshot = await transaction.get(reportRef)

    if (!reportSnapshot.exists()) {
      return null
    }

    const currentData = reportSnapshot.data() || {}
    const nextReportType = safeReportType || clean(currentData.reportType || '')
    const indexRef = nextReportType ? getPublicReportIndexRef(nextReportType) : null
    const indexSnapshot = indexRef
      ? await transaction.get(indexRef)
      : null
    const indexData = indexSnapshot && indexSnapshot.exists()
      ? indexSnapshot.data() || {}
      : {}

    collectReportVersionIds(currentData).forEach(versionId => {
      transaction.set(publicReportVersionRef({
        reportId: safeReportId,
        versionId,
      }), {
        status: PUBLIC_REPORT_STATUS.REVOKED,
        updatedAt: serverTimestamp(),
        revokedAt: serverTimestamp(),
      }, { merge: true })
    })

    if (nextReportType && indexRef) {
      const existingItems = Array.isArray(indexData.items)
        ? indexData.items
        : []

      const nextItems = sortReportIndexItems(
        existingItems.map(item => (
          item?.reportId === safeReportId
            ? {
                ...item,
                status: PUBLIC_REPORT_STATUS.REVOKED,
                updatedAt: now,
              }
            : item
        ))
      )

      transaction.set(indexRef, {
        ...indexData,
        id: nextReportType,
        reportType: nextReportType,
        count: nextItems.length,
        latestReportId: nextItems[0]?.reportId || '',
        latestUpdatedAt: nextItems[0]?.updatedAt || now,
        items: nextItems,
        updatedAt: now,
      }, { merge: true })
    }

    transaction.set(reportRef, {
      status: PUBLIC_REPORT_STATUS.REVOKED,
      updatedAt: serverTimestamp(),
      revokedAt: serverTimestamp(),
    }, { merge: true })

    return {
      reportId: safeReportId,
      reportType: nextReportType,
      status: PUBLIC_REPORT_STATUS.REVOKED,
    }
  })
}

export async function deletePublicReport({
  reportId,
  reportType = '',
}) {
  const safeReportId = clean(reportId)
  const safeReportType = clean(reportType)

  if (!safeReportId) {
    throw new Error('[deletePublicReport] reportId is required')
  }

  const reportRef = publicReportRef(safeReportId)
  const versionsSnapshot = await getDocs(publicReportVersionsCollectionRef(safeReportId))
  const now = new Date()

  return runTransaction(db, async transaction => {
    const reportSnapshot = await transaction.get(reportRef)
    const currentData = reportSnapshot.exists()
      ? reportSnapshot.data() || {}
      : {}
    const nextReportType = safeReportType || clean(currentData.reportType || '')
    const indexRef = nextReportType ? getPublicReportIndexRef(nextReportType) : null
    const indexSnapshot = indexRef
      ? await transaction.get(indexRef)
      : null
    const indexData = indexSnapshot && indexSnapshot.exists()
      ? indexSnapshot.data() || {}
      : {}

    if (nextReportType && indexRef) {
      const nextDocument = buildIndexDocumentWithoutItem({
        reportType: nextReportType,
        currentData: indexData,
        reportId: safeReportId,
        now,
      })

      transaction.set(indexRef, nextDocument, { merge: true })
    }

    versionsSnapshot.docs.forEach(versionSnapshot => {
      transaction.delete(publicReportVersionRef({
        reportId: safeReportId,
        versionId: versionSnapshot.id,
      }))
    })

    if (reportSnapshot.exists()) {
      transaction.delete(reportRef)
    }

    return {
      reportId: safeReportId,
      reportType: nextReportType,
      deleted: reportSnapshot.exists(),
    }
  })
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
    const indexRef = getPublicReportIndexRef(input.reportType)
    const indexSnapshot = await transaction.get(indexRef)
    const exists = reportSnapshot.exists()
    const currentData = exists ? reportSnapshot.data() : {}
    const indexData = indexSnapshot.exists()
      ? indexSnapshot.data() || {}
      : {}

    const currentVersionNumber = Number(currentData.currentVersionNumber) || 0
    const nextVersionNumber = exists ? currentVersionNumber + 1 : 1
    const currentVersionId = buildPublicReportVersionId(nextVersionNumber)
    const previousVersions = Array.isArray(currentData.versions)
      ? currentData.versions
      : []

    const fallbackPreviousVersion = currentVersionNumber
      ? buildCurrentVersionOption({
          currentData,
          currentVersionNumber,
        })
      : null

    const versions = [
      ...previousVersions,
      ...(
        previousVersions.length
          ? []
          : fallbackPreviousVersion
            ? [fallbackPreviousVersion]
            : []
      ),
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

    await upsertPublicReportIndexDocumentInTransaction({
      transaction,
      indexData,
      input,
      reportId,
      versionId: exists
        ? buildPublicReportVersionId(currentVersionNumber || 1)
        : currentVersionId,
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

export async function getPublicReportVersion({
  reportId,
  versionId,
}) {
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

  const currentData = currentSnapshot.exists()
    ? currentSnapshot.data()
    : {}

  if (
    currentSnapshot.exists() &&
    currentData.currentVersionId &&
    currentData.currentVersionId === versionId
  ) {
    if (currentData.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
      return null
    }

    const report = normalizeCurrentReport({
      snapshot: currentSnapshot,
      data: currentData,
    })

    const versions = await loadReportVersionOptions({
      reportId,
      currentData: report,
    })

    return {
      ...report,
      versionId,
      versions,
      reportContent: {
        ...(report.reportContent || {}),
        versions,
      },
    }
  }

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
