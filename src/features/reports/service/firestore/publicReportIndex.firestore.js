// src/features/reports/service/firestore/publicReportIndex.firestore.js

import {
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import { PUBLIC_REPORT_INDEXES_COLLECTION } from '../publicReport.constants.js'
import { buildPublicReportId, buildPublicReportVersionId } from '../publicReport.id.js'
import { publicReportIndexesCollectionRef } from '../publicReport.refs.js'
import { buildPublicReportUrl } from '../publicReport.url.js'
import {
  cleanPublicReportValue,
  getReportDateFromContent,
  publicReportValueToMillis,
  resolveReportSubtitle,
  resolveReportTitle,
} from './publicReportNormalize.model.js'

const PUBLIC_REPORT_INDEX_SCHEMA_VERSION = 1

function ensurePublicReportIndexInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('[updatePublicReportIndexDocument] input is required')
  }

  if (!input.sourceKey) {
    throw new Error('[updatePublicReportIndexDocument] sourceKey is required')
  }

  if (!input.reportType) {
    throw new Error('[updatePublicReportIndexDocument] reportType is required')
  }

  if (!input.entityType) {
    throw new Error('[updatePublicReportIndexDocument] entityType is required')
  }

  if (!input.entityId) {
    throw new Error('[updatePublicReportIndexDocument] entityId is required')
  }

  if (!input.reportContent || typeof input.reportContent !== 'object') {
    throw new Error('[updatePublicReportIndexDocument] reportContent is required')
  }
}

function resolvePublicReportUrlForIndex({ reportId, versionId = '' } = {}) {
  return buildPublicReportUrl({ reportId, versionId })
}

export function sortPublicReportIndexItems(items = []) {
  return items
    .slice()
    .sort((left, right) => {
      const leftTime = Math.max(
        publicReportValueToMillis(left.updatedAt),
        publicReportValueToMillis(left.publishedAt),
        publicReportValueToMillis(left.createdAt)
      )
      const rightTime = Math.max(
        publicReportValueToMillis(right.updatedAt),
        publicReportValueToMillis(right.publishedAt),
        publicReportValueToMillis(right.createdAt)
      )

      return rightTime - leftTime
    })
}

function buildPublicReportIndexItem({
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
  const resolvedVersionId = cleanPublicReportValue(currentVersionId || versionId)
  const effectivePublishedAt = publishedAt || now

  return {
    reportId,
    reportType,
    entityType,
    entityId,
    sourceKey,
    status,
    title: resolveReportTitle(reportContent, reportType),
    subtitle: resolveReportSubtitle(reportContent),
    reportDate: cleanPublicReportValue(getReportDateFromContent(reportContent)),
    currentVersionId: resolvedVersionId,
    versionId: resolvedVersionId,
    versionNumber: Number(versionNumber) || 0,
    url: resolvePublicReportUrlForIndex({ reportId }),
    versionUrl: resolvedVersionId
      ? resolvePublicReportUrlForIndex({
          reportId,
          versionId: resolvedVersionId,
        })
      : '',
    publishedAt: effectivePublishedAt,
    updatedAt: updatedAt || now,
    createdAt: createdAt || effectivePublishedAt,
  }
}

function buildPublicReportIndexDocument({
  reportType,
  currentData = {},
  item,
  now = new Date(),
} = {}) {
  const existingItems = Array.isArray(currentData.items)
    ? currentData.items
    : []

  const nextItems = sortPublicReportIndexItems([
    ...existingItems.filter(currentItem => currentItem?.reportId !== item.reportId),
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

export function buildPublicReportIndexDocumentWithoutItem({
  reportType,
  currentData = {},
  reportId,
  now = new Date(),
} = {}) {
  const existingItems = Array.isArray(currentData.items)
    ? currentData.items
    : []

  const nextItems = sortPublicReportIndexItems(
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

export function getPublicReportIndexRef(reportType) {
  const safeReportType = cleanPublicReportValue(reportType)

  if (!safeReportType) {
    throw new Error('[getPublicReportIndexRef] reportType is required')
  }

  return doc(db, PUBLIC_REPORT_INDEXES_COLLECTION, safeReportType)
}

export function upsertPublicReportIndexDocumentInTransaction({
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
  const currentVersionId = buildPublicReportVersionId(versionNumber)

  const indexItem = buildPublicReportIndexItem({
    reportId,
    reportType: input.reportType,
    entityType: input.entityType,
    entityId: input.entityId,
    sourceKey: input.sourceKey,
    status: input.status || PUBLIC_REPORT_STATUS.PUBLISHED,
    reportContent: input.reportContent,
    versionId,
    currentVersionId,
    versionNumber,
    publishedAt: currentData.publishedAt || now,
    updatedAt: now,
    createdAt: currentData.createdAt || now,
    now,
  })

  const nextDocument = buildPublicReportIndexDocument({
    reportType: input.reportType,
    currentData: indexData,
    item: indexItem,
    now,
  })

  transaction.set(indexRef, nextDocument, { merge: true })

  return {
    indexRef,
    indexData,
    indexItem,
    nextDocument,
    versions,
  }
}

export async function updatePublicReportIndexDocument(input) {
  ensurePublicReportIndexInput(input)

  const reportId = input.reportId || input.id || buildPublicReportId(input.sourceKey)
  const now = input.now instanceof Date ? input.now : new Date()
  const versionNumber = Number(input.versionNumber) || 1
  const versionId = cleanPublicReportValue(
    input.currentVersionId ||
    input.versionId ||
    buildPublicReportVersionId(versionNumber)
  )

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
