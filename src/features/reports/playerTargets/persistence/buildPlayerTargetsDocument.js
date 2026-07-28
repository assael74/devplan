// src/features/reports/playerTargets/persistence/buildPlayerTargetsDocument.js

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

function resolveGeneratedAt(value) {
  const date = value instanceof Date
    ? value
    : new Date(value || Date.now())

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

export function buildPlayerTargetsDocument({
  player = {},
  team = {},
  generatedAt = new Date(),
} = {}) {
  return sanitizeReportValue({
    documentVersion: 2,
    generatedAt: resolveGeneratedAt(generatedAt),
    playerSnapshot: player,
    teamSnapshot: team || player?.team || {},
  })
}
