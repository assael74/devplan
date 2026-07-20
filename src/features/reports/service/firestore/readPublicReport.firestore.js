// src/features/reports/service/firestore/readPublicReport.firestore.js

import {
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'

import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import {
  publicReportRef,
  publicReportVersionsCollectionRef,
  publicReportVersionRef,
} from '../publicReport.refs.js'
import {
  normalizeCurrentPublicReport,
  normalizeVersionPublicReport,
} from './publicReportNormalize.model.js'
import {
  buildCurrentPublicReportVersionOption,
  buildPublicReportVersionOption,
} from './publicReportVersions.model.js'

async function loadPublicReportVersionOptions({
  reportId,
  currentData = {},
} = {}) {
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

      return buildPublicReportVersionOption({
        versionId: snapshot.id,
        versionNumber: Number(data.versionNumber) || 0,
        reportContent: data.reportContent || {},
        publishedAt: data.publishedAt || null,
      })
    })
    .filter(Boolean)

  const currentVersionOption = buildCurrentPublicReportVersionOption({
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

export async function getCurrentPublicReport(reportId) {
  if (!reportId) {
    throw new Error('[getCurrentPublicReport] reportId is required')
  }

  const snapshot = await getDoc(publicReportRef(reportId))

  if (!snapshot.exists()) return null

  const data = snapshot.data() || {}

  if (data.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  const report = normalizeCurrentPublicReport({ snapshot, data })
  const versions = await loadPublicReportVersionOptions({
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

export async function getPublicReportVersion({ reportId, versionId } = {}) {
  if (!reportId || !versionId) {
    throw new Error(
      '[getPublicReportVersion] reportId and versionId are required'
    )
  }

  const [versionSnapshot, currentSnapshot] = await Promise.all([
    getDoc(publicReportVersionRef({ reportId, versionId })),
    getDoc(publicReportRef(reportId)),
  ])

  const currentData = currentSnapshot.exists()
    ? currentSnapshot.data() || {}
    : {}

  if (
    currentSnapshot.exists() &&
    currentData.currentVersionId &&
    currentData.currentVersionId === versionId
  ) {
    if (currentData.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
      return null
    }

    const report = normalizeCurrentPublicReport({
      snapshot: currentSnapshot,
      data: currentData,
    })

    const versions = await loadPublicReportVersionOptions({
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

  if (!versionSnapshot.exists()) return null

  const versionData = versionSnapshot.data() || {}

  if (versionData.status !== PUBLIC_REPORT_STATUS.PUBLISHED) {
    return null
  }

  const report = normalizeVersionPublicReport({
    reportId,
    snapshot: versionSnapshot,
    data: versionData,
  })

  const versions = await loadPublicReportVersionOptions({
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
} = {}) {
  if (versionId) {
    return getPublicReportVersion({ reportId, versionId })
  }

  return getCurrentPublicReport(reportId)
}
