// src/features/reports/teamMinutesPlan/persistence/normalizeTeamMinutesPlanDocument.js

function normalizeRows(rows) {
  return Array.isArray(rows) ? rows.filter(Boolean) : []
}

function normalizeSections(sections) {
  if (!Array.isArray(sections)) return []

  return sections.filter(Boolean).map(section => ({
    ...section,
    count: Number(section.count) || 0,
    totalMinutes: Number(section.totalMinutes) || 0,
    rows: normalizeRows(section.rows),
  }))
}

function isSchemaDocument(content = {}) {
  return (
    content.meta &&
    typeof content.meta === 'object' &&
    content.entity &&
    typeof content.entity === 'object' &&
    content.summary &&
    typeof content.summary === 'object' &&
    Array.isArray(content.sections)
  )
}

export function normalizeTeamMinutesPlanDocument(content = {}) {
  if (isSchemaDocument(content)) {
    const summary = content.summary || {}

    return {
      id: content.id || 'minutesPlan',
      type: content.type || 'minutesPlan',
      mode: content.mode || 'minutesPlan',
      documentVersion: Number(content.documentVersion) || 1,
      generatedAt: content.generatedAt || content.meta?.reportDate || '',
      legacyViewModel: {
        ...content,
        meta: content.meta || {},
        entity: content.entity || {},
        summary: {
          ...summary,
          squadRoles: Array.isArray(summary.squadRoles) ? summary.squadRoles : [],
          layers: Array.isArray(summary.layers) ? summary.layers : [],
          positions: Array.isArray(summary.positions) ? summary.positions : [],
        },
        sections: normalizeSections(content.sections),
      },
    }
  }

  return {
    id: content.id || 'minutesPlan',
    type: content.type || 'minutesPlan',
    mode: content.mode || 'minutesPlan',
    documentVersion: Number(content.documentVersion) || 2,
    generatedAt: content.generatedAt || '',
    legacyViewModel: null,
    teamSnapshot: content.teamSnapshot || {},
    playersSnapshot: normalizeRows(content.playersSnapshot),
    seasonLabel: content.seasonLabel || '',
  }
}
