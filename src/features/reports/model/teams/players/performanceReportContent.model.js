// features/reports/model/teams/players/performanceReportContent.model.js

function buildPerformanceReportMeta(model = {}) {
  return {
    title: model.title,
    subtitle: model.subtitle,
    reportDate: model.reportDate,
    items: model.metaItems,
  }
}

function buildPerformanceReportSections(model = {}) {
  const rows = Array.isArray(model.rows) ? model.rows : []

  if (!rows.length) return []

  return [
    {
      id: 'performance',
      title: model.title,
      subtitle: model.subtitle,
      rows,
    },
  ]
}

export function buildPerformanceReportContent({ model = {} } = {}) {
  return {
    id: 'performance',
    type: 'performance',
    mode: 'performance',
    meta: buildPerformanceReportMeta(model),
    entity: model.entity,
    sections: buildPerformanceReportSections(model),
  }
}
