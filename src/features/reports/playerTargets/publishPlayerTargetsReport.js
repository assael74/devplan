// src/features/reports/playerTargets/publishPlayerTargetsReport.js

import {
  publishPublicReport,
} from '../service/index.js'

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../reports.constants.js'

import {
  buildPublicReportSourceKey,
} from '../service/index.js'

import {
  asReportText,
} from '../service/reportValue.js'

import {
  buildPlayerTargetsDocument,
} from './persistence/buildPlayerTargetsDocument.js'

function resolvePlayerId(player = {}) {
  return (
    player.id ||
    player.playerId ||
    player.entityId ||
    player?.player?.id ||
    ''
  )
}

export function buildPlayerTargetsPublicReportInput({
  player = {},
  team = {},
  reportDate = new Date(),
  createdBy = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
} = {}) {
  const entityType = REPORT_ENTITY_TYPES.PLAYER
  const entityId = resolvePlayerId(player)
  const reportType = REPORT_TYPES.PLAYER_TARGETS

  if (!entityId) {
    throw new Error('[buildPlayerTargetsPublicReportInput] entityId is required')
  }

  return {
    schemaVersion: PUBLIC_REPORT_SCHEMA_VERSION,
    sourceKey: buildPublicReportSourceKey({
      entityType,
      entityId,
      reportType,
    }),
    reportType,
    entityType,
    entityId,
    status,
    createdBy: asReportText(createdBy),
    generatedAt: reportDate,
    reportContent: buildPlayerTargetsDocument({
      player,
      team,
      generatedAt: reportDate,
    }),
  }
}

export async function publishPlayerTargetsReport(options = {}) {
  const input = buildPlayerTargetsPublicReportInput(options)
  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
