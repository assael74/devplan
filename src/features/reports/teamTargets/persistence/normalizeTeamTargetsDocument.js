// src/features/reports/teamTargets/persistence/normalizeTeamTargetsDocument.js

function normalizeLegacySections(sections) {
  if (!Array.isArray(sections)) return []

  return sections.filter(Boolean).map(section => ({
    ...section,
    rows: Array.isArray(section.rows) ? section.rows.filter(Boolean) : [],
  }))
}

function isCurrentDocument(content = {}) {
  return (
    Number(content.documentVersion) >= 2 &&
    content.teamSnapshot &&
    typeof content.teamSnapshot === 'object'
  )
}

export function normalizeTeamTargetsDocument(content = {}) {
  if (isCurrentDocument(content)) {
    return {
      id: content.id || 'teamTargets',
      type: content.type || 'teamTargets',
      mode: content.mode || 'teamTargets',
      documentVersion: Number(content.documentVersion) || 2,
      generatedAt: content.generatedAt || '',
      teamSnapshot: content.teamSnapshot || {},
      draftSnapshot: content.draftSnapshot || {},
      legacyViewModel: null,
    }
  }

  return {
    id: content.id || 'teamTargets',
    type: content.type || 'teamTargets',
    mode: content.mode || 'teamTargets',
    documentVersion: 1,
    generatedAt: content.generatedAt || content.meta?.reportDate || '',
    teamSnapshot: {},
    draftSnapshot: {},
    legacyViewModel: {
      ...content,
      meta: content.meta || {},
      entity: content.entity || {},
      state: content.state || {},
      target: content.target || null,
      metrics: Array.isArray(content.metrics) ? content.metrics : [],
      sections: normalizeLegacySections(content.sections),
    },
  }
}
