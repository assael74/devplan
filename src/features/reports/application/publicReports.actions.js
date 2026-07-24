// src/features/reports/application/publicReports.actions.js

import {
  deletePublicReport as deletePublicReportDocument,
  getCurrentPublicReport as readCurrentPublicReport,
  getPublicReport as readPublicReport,
  getPublicReportVersion as readPublicReportVersion,
  getPublishedPublicReports as readPublishedPublicReports,
  publishPublicReport as publishPublicReportDocument,
  revokePublicReport as revokePublicReportDocument,
} from '../repository/publicReports.repository.js'

export function publishPublicReport(input) {
  return publishPublicReportDocument(input)
}

export function revokePublicReport(input) {
  return revokePublicReportDocument(input)
}

export function deletePublicReport(input) {
  return deletePublicReportDocument(input)
}

export function getPublishedPublicReports(input) {
  return readPublishedPublicReports(input)
}

export function getCurrentPublicReport(input) {
  return readCurrentPublicReport(input)
}

export function getPublicReportVersion(input) {
  return readPublicReportVersion(input)
}

export function getPublicReport(input) {
  return readPublicReport(input)
}
