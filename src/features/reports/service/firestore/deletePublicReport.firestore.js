// src/features/reports/service/firestore/deletePublicReport.firestore.js

import {
  getDocs,
  runTransaction,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  publicReportRef,
  publicReportVersionsCollectionRef,
  publicReportVersionRef,
} from '../publicReport.refs.js'
import {
  buildPublicReportIndexDocumentWithoutItem,
  getPublicReportIndexRef,
} from './publicReportIndex.firestore.js'
import { cleanPublicReportValue } from './publicReportNormalize.model.js'

export async function deletePublicReport({
  reportId,
  reportType = '',
} = {}) {
  const safeReportId = cleanPublicReportValue(reportId)
  const safeReportType = cleanPublicReportValue(reportType)

  if (!safeReportId) {
    throw new Error('[deletePublicReport] reportId is required')
  }

  const reportRef = publicReportRef(safeReportId)
  const versionsSnapshot = await getDocs(
    publicReportVersionsCollectionRef(safeReportId)
  )
  const now = new Date()

  return runTransaction(db, async transaction => {
    const reportSnapshot = await transaction.get(reportRef)
    const currentData = reportSnapshot.exists()
      ? reportSnapshot.data() || {}
      : {}
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

    if (nextReportType && indexRef) {
      transaction.set(
        indexRef,
        buildPublicReportIndexDocumentWithoutItem({
          reportType: nextReportType,
          currentData: indexData,
          reportId: safeReportId,
          now,
        }),
        { merge: true }
      )
    }

    versionsSnapshot.docs.forEach(versionSnapshot => {
      transaction.delete(
        publicReportVersionRef({
          reportId: safeReportId,
          versionId: versionSnapshot.id,
        })
      )
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
