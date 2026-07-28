// src/features/reports/teamMinutesPlan/persistence/normalizeTeamMinutesPlanDocument.js

function normalizeRows(rows) {
  return Array.isArray(rows) ? rows.filter(Boolean) : []
}

function normalizeLegacySections(sections) {
  if (!Array.isArray(sections)) return []

  return sections.filter(Boolean).map(section => ({
    ...section,
    count: Number(section.count) || 0,
    totalMinutes: Number(section.totalMinutes) || 0,
    rows: normalizeRows(section.rows),
  }))
}

function isCurrentDocument(content = {}) {
  return (
    Number(content.documentVersion) >= 2 &&
    content.teamSnapshot &&
    typeof content.teamSnapshot === 'object' &&
    Array.isArray(content.playersSnapshot)
  )
}

export function normalizeTeamMinutesPlanDocument(content = {}) {
  if (isCurrentDocument(content)) {
    return {
      id: content.id || 'minutesPlan',
      type: content.type || 'minutesPlan',
      mode: content.mode || 'minutesPlan',
      documentVersion: Number(content.documentVersion) || 2,
      generatedAt: content.generatedAt || '',
      seasonLabel: content.seasonLabel || '',
      teamSnapshot: content.teamSnapshot || {},
      playersSnapshot: normalizeRows(content.playersSnapshot),
      legacyViewModel: null,
    }
  }

  const summary = content.summary || {}

  return {
    id: content.id || 'minutesPlan',
    type: content.type || 'minutesPlan',
    mode: content.mode || 'minutesPlan',
    documentVersion: 1,
    generatedAt: content.generatedAt || content.meta?.reportDate || '',
    seasonLabel: '',
    teamSnapshot: {},
    playersSnapshot: [],
    legacyViewModel: {
      ...content,
      meta: content.meta || {},
      entity: content.entity || {},
      summary: {
        ...summary,
        squadRoles: Array.isArray(summary.squadRoles)
          ? summary.squadRoles
          : [],
        layers: Array.isArray(summary.layers)
          ? summary.layers
          : [],
        positions: Array.isArray(summary.positions)
          ? summary.positions
          : [],
      },
      sections: normalizeLegacySections(content.sections),
    },
  }
}
