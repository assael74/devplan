// src/features/reports/playerTargets/persistence/normalizePlayerTargetsDocument.js

function isSchemaDocument(content = {}) {
  return (
    content.entity &&
    typeof content.entity === 'object' &&
    (
      content.hasTargets !== undefined ||
      content.profile ||
      content.targets ||
      content.primarySection ||
      content.usageSection
    )
  )
}

export function normalizePlayerTargetsDocument(content = {}) {
  if (isSchemaDocument(content)) {
    return {
      documentVersion: Number(content.documentVersion) || 1,
      generatedAt: content.generatedAt || content.reportDate || '',
      legacyViewModel: content,
      playerSnapshot: {},
      teamSnapshot: {},
    }
  }

  return {
    documentVersion: Number(content.documentVersion) || 2,
    generatedAt: content.generatedAt || '',
    playerSnapshot: content.playerSnapshot || {},
    teamSnapshot: content.teamSnapshot || {},
    legacyViewModel: null,
  }
}
