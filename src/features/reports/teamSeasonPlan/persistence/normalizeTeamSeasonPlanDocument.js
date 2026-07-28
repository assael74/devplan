// src/features/reports/teamSeasonPlan/persistence/normalizeTeamSeasonPlanDocument.js

function normalizeRows(rows) {
  return Array.isArray(rows) ? rows.filter(Boolean) : []
}

function normalizeLegacySections(sections) {
  if (!Array.isArray(sections)) return []

  return sections.filter(Boolean).map(section => ({
    ...section,
    rows: normalizeRows(section.rows),
    statusValues: Array.isArray(section.statusValues)
      ? section.statusValues
      : [],
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

export function normalizeTeamSeasonPlanDocument(content = {}) {
  if (isCurrentDocument(content)) {
    return {
      id: content.id || 'seasonPlan',
      type: content.type || 'seasonPlan',
      mode: content.mode || 'seasonPlan',
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
    id: content.id || 'seasonPlan',
    type: content.type || 'seasonPlan',
    mode: content.mode || 'seasonPlan',
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
        status: Array.isArray(summary.status) ? summary.status : [],
        layers: Array.isArray(summary.layers) ? summary.layers : [],
      },
      sections: normalizeLegacySections(content.sections),
    },
  }
}
