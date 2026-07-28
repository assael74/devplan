// src/features/reports/playerTargets/persistence/buildPlayerTargetsDocument.js

import {
  sanitizeReportValue,
} from '../../service/reportValue.js'

import {
  buildPlayerTargetsPrintModel,
} from '../presentation/playerTargetsPrintModel.js'

export const PLAYER_TARGETS_DOCUMENT_VERSION = 2

function resolveGeneratedAt(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now())

  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString()
}

export function buildPlayerTargetsDocument({
  player = {},
  team = {},
  generatedAt = new Date(),
} = {}) {
  const reportDate = resolveGeneratedAt(generatedAt)
  const model = buildPlayerTargetsPrintModel({
    player,
    team,
    reportDate,
  })

  const documentContent = { ...model }

  delete documentContent.player
  delete documentContent.team

  return sanitizeReportValue({
    ...documentContent,
    documentVersion: PLAYER_TARGETS_DOCUMENT_VERSION,
    generatedAt: reportDate,
    reportDate,
  })
}
