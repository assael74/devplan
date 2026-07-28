// features/playersDatabase/report/search/buildSearchReport.js

import {
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../../../reports/reports.constants.js'

function formatReportDate(value = new Date()) {
  return new Intl.DateTimeFormat('he-IL').format(value)
}

function createSearchReportId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `search-${Date.now()}`
}

export function buildSearchReport({
  searchReportId = '',
  rows = [],
  queryFilters = {},
  summary = {},
} = {}) {
  const reportId = searchReportId || createSearchReportId()

  return {
    sourceKey: `externalPlayerSearchResults:${reportId}`,
    reportType: REPORT_TYPES.EXTERNAL_PLAYER_SEARCH_RESULTS,
    entityType: REPORT_ENTITY_TYPES.PLAYER_SEARCH,
    entityId: reportId,
    reportContent: {
      schemaVersion: 1,
      reportType: REPORT_TYPES.EXTERNAL_PLAYER_SEARCH_RESULTS,
      entity: {
        type: REPORT_ENTITY_TYPES.PLAYER_SEARCH,
        id: reportId,
        name: 'תוצאות חיפוש שחקנים',
        avatarUrl: '',
      },
      meta: {
        title: 'תוצאות חיפוש שחקנים',
        subtitle: 'צילום רשומות שנבחרו במאגר',
        reportDate: formatReportDate(),
        columns: 2,
        items: [
          { id: 'results', label: 'רשומות', value: String(rows.length) },
          { id: 'entityType', label: 'סוג חיפוש', value: 'שחקנים' },
        ],
      },
      content: {
        title: 'צילום תוצאות החיפוש',
        description: 'מבנה הרשומות והפילטרים שיוצגו בדוח ייבנה בשלב התוכן.',
      },
      snapshot: {
        queryFilters,
        summary,
        rows,
      },
    },
  }
}
