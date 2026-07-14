// src/shared/reports/reports.publications.js

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

  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function resolveEntityName(reportContent = {}) {
  const entity = reportContent.entity || {}

  return clean(entity.teamName || entity.name || reportContent.entityName || '')
}

function resolveReportTitle(report = {}) {
  const reportContent = report.reportContent || {}
  const meta = reportContent.meta || {}

  return clean(meta.title || reportContent.title || report.reportType || 'דוח')
}

function resolveReportDate(reportContent = {}) {
  const meta = reportContent.meta || {}

  return clean(meta.reportDate || reportContent.reportDate || '')
}

export function normalizeReportPublication(report = {}) {
  const reportContent = report.reportContent || {}
  const meta = reportContent.meta || {}
  const reportId = report.reportId || report.id || ''
  const versionId = report.currentVersionId || report.versionId || ''

  return {
    ...report,
    id: reportId,
    reportId,
    versionId,
    title: resolveReportTitle(report),
    subtitle: clean(meta.subtitle || reportContent.subtitle || ''),
    entityName: resolveEntityName(reportContent),
    reportDate: resolveReportDate(reportContent),
    versions: Array.isArray(report.versions) ? report.versions : [],
    reportContent,
  }
}

export function sortReportPublications(publications = []) {
  return publications
    .slice()
    .sort((left, right) => {
      const leftTime = Math.max(
        toMillis(left.publishedAt),
        toMillis(left.updatedAt),
        toMillis(left.createdAt)
      )
      const rightTime = Math.max(
        toMillis(right.publishedAt),
        toMillis(right.updatedAt),
        toMillis(right.createdAt)
      )

      return rightTime - leftTime
    })
}

export function groupReportPublications(publications = []) {
  return publications.reduce((accumulator, publication) => {
    const key = publication.reportType || publication.id

    if (!key) return accumulator

    if (!accumulator[key]) {
      accumulator[key] = []
    }

    accumulator[key].push(publication)
    return accumulator
  }, {})
}

export function mergeReportsWithPublications(reports = [], publications = []) {
  const publicationMap = groupReportPublications(publications)

  return reports.map(report => ({
    ...report,
    publications: sortReportPublications(publicationMap[report.id] || []),
  }))
}

export function buildReportCategoriesWithReports(categories = [], reports = []) {
  return categories.map(category => ({
    ...category,
    reports: reports.filter(report => report.categoryId === category.id),
  }))
}
