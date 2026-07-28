// src/features/reports/playerTargets/persistence/normalizePlayerTargetsDocument.js

function isCurrentDocument(content = {}) {
  return (
    Number(content.documentVersion) >= 2 &&
    content.playerSnapshot &&
    typeof content.playerSnapshot === 'object'
  )
}

export function normalizePlayerTargetsDocument(content = {}) {
  if (isCurrentDocument(content)) {
    return {
      documentVersion: Number(content.documentVersion) || 2,
      generatedAt: content.generatedAt || '',
      playerSnapshot: content.playerSnapshot || {},
      teamSnapshot: content.teamSnapshot || {},
      legacyViewModel: null,
    }
  }

  return {
    documentVersion: 1,
    generatedAt: content.reportDate || '',
    playerSnapshot: content.player || {},
    teamSnapshot: content.team || {},
    legacyViewModel: content,
  }
}
