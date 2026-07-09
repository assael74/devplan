// features/reports/service/publicReport.refs.js

import {
  collection,
  doc,
} from 'firebase/firestore'

import {
  db,
} from '../../../services/firebase/firebase.js'

import {
  PUBLIC_REPORTS_COLLECTION,
  PUBLIC_REPORT_VERSIONS_COLLECTION,
  PUBLIC_REPORT_VIEWS_COLLECTION,
} from './publicReport.constants.js'

export function publicReportsCollectionRef() {
  return collection(
    db,
    PUBLIC_REPORTS_COLLECTION
  )
}

export function publicReportRef(reportId) {
  return doc(db, PUBLIC_REPORTS_COLLECTION, reportId)
}

export function publicReportVersionsCollectionRef(reportId) {
  return collection(
    db,
    PUBLIC_REPORTS_COLLECTION,
    reportId,
    PUBLIC_REPORT_VERSIONS_COLLECTION
  )
}

export function publicReportVersionRef({ reportId, versionId, }) {
  return doc(
    db,
    PUBLIC_REPORTS_COLLECTION,
    reportId,
    PUBLIC_REPORT_VERSIONS_COLLECTION,
    versionId
  )
}

export function publicReportViewsCollectionRef(reportId) {
  return collection(
    db,
    PUBLIC_REPORTS_COLLECTION,
    reportId,
    PUBLIC_REPORT_VIEWS_COLLECTION
  )
}
