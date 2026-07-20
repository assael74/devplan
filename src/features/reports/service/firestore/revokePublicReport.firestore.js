// src/features/reports/service/firestore/revokePublicReport.firestore.js

import {
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import {
  publicReportRef,
  publicReportVersionRef,
} from '../publicReport.refs.js'
import {
  getPublicReportIndexRef,
  sortPublicReportIndexItems,
} from './publicReportIndex.firestore.js'
import { cleanPublicReportValue } from './publicReportNormalize.model.js'
import { collectPublicReportVersionIds } from './publicReportVersions.model.js'

export async function revokePublicReport({
  reportId,
  reportType = '',
} = {}) {
  const safeReportId = cleanPublicReportValue(reportId)
  const safeReportType = cleanPublicReportValue(reportType)

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
    const nextReportType = safeReportType || cleanPublicReportValue(
      currentData.reportType
    )
    const indexRef = nextReportType
      ? getPublicReportIndexRef(nextReportType)
      : null
    const indexSnapshot = indexRef
      ? await transaction.get(indexRef)
      : null
    const indexData = indexSnapshot?.exists()
      ? indexSnapshot.data() || {}
      : {}

    collectPublicReportVersionIds(currentData).forEach(versionId => {
      transaction.set(
        publicReportVersionRef({
          reportId: safeReportId,
          versionId,
        }),
        {
          status: PUBLIC_REPORT_STATUS.REVOKED,
          updatedAt: serverTimestamp(),
          revokedAt: serverTimestamp(),
        },
        { merge: true }
      )
    })

    if (nextReportType && indexRef) {
      const existingItems = Array.isArray(indexData.items)
        ? indexData.items
        : []

      const nextItems = sortPublicReportIndexItems(
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

      transaction.set(
        indexRef,
        {
          ...indexData,
          id: nextReportType,
          reportType: nextReportType,
          count: nextItems.length,
          latestReportId: nextItems[0]?.reportId || '',
          latestUpdatedAt: nextItems[0]?.updatedAt || now,
          items: nextItems,
          updatedAt: now,
        },
        { merge: true }
      )
    }

    transaction.set(
      reportRef,
      {
        status: PUBLIC_REPORT_STATUS.REVOKED,
        updatedAt: serverTimestamp(),
        revokedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      reportId: safeReportId,
      reportType: nextReportType,
      status: PUBLIC_REPORT_STATUS.REVOKED,
    }
  })
}
