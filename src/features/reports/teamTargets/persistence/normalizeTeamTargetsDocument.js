// src/features/reports/teamTargets/persistence/normalizeTeamTargetsDocument.js

function normalizeSections(sections) {
  if (!Array.isArray(sections)) return []

  return sections.filter(Boolean).map(section => ({
    ...section,
    rows: Array.isArray(section.rows) ? section.rows.filter(Boolean) : [],
  }))
}

function isSchemaDocument(content = {}) {
  return (
    content.meta &&
    typeof content.meta === 'object' &&
    content.entity &&
    typeof content.entity === 'object' &&
    Array.isArray(content.sections)
  )
}

export function normalizeTeamTargetsDocument(content = {}) {
  if (isSchemaDocument(content)) {
    return {
      id: content.id || 'teamTargets',
      type: content.type || 'teamTargets',
      mode: content.mode || 'teamTargets',
      documentVersion: Number(content.documentVersion) || 1,
      generatedAt: content.generatedAt || content.meta?.reportDate || '',
      legacyViewModel: {
        ...content,
        meta: content.meta || {},
        entity: content.entity || {},
        state: content.state || {},
        target: content.target || null,
        metrics: Array.isArray(content.metrics) ? content.metrics : [],
        sections: normalizeSections(content.sections),
      },
    }
  }

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
