// src/features/reports/performance/presentation/buildPerformanceViewModel.js

import {
  PERFORMANCE_PRINT_COLUMNS,
} from '../performance.constants.js'

function getMeta(content = {}) {
  return content.meta || {}
}

function getSections(content = {}) {
  return Array.isArray(content.sections) ? content.sections : []
}

export function buildPerformanceViewModel(content = {}, options = {}) {
  const meta = getMeta(content)
  const sections = getSections(content)
  const sectionRows = sections[0] && Array.isArray(sections[0].rows)
    ? sections[0].rows
    : []
  const rows = Array.isArray(content.rows) ? content.rows : sectionRows

  return {
    ...content,
    mode: 'performance',
    title: content.title || meta.title || 'דוח יעדים וביצועי שחקנים',
    subtitle: content.subtitle || meta.subtitle || 'השוואת יעדים לביצוע בפועל',
    reportDate: content.reportDate || meta.reportDate || '',
    metaItems: Array.isArray(content.metaItems)
      ? content.metaItems
      : Array.isArray(meta.items)
        ? meta.items
        : [],
    entity: content.entity || {},
    columns: Array.isArray(content.columns) && content.columns.length
      ? content.columns
      : PERFORMANCE_PRINT_COLUMNS,
    rows,
    sections: sections.length
      ? sections
      : rows.length
        ? [{ id: 'performance', rows }]
        : [],
    presentation: options.presentation || 'url',
    isMobile: options.isMobile === true,
  }
}
