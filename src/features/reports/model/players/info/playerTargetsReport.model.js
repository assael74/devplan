// features/reports/model/players/info/playerTargetsReport.model.js

import {
  PUBLIC_REPORT_SCHEMA_VERSION,
  PUBLIC_REPORT_STATUS,
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../../../reports.constants.js'

import {
  buildPublicReportSourceKey,
} from '../../../service/index.js'

import {
  asReportText,
  sanitizeReportValue,
} from '../../reportValue.shared.js'

import {
  buildPlayerTargetsReportContent,
} from './playerTargetsReportContent.model.js'

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
  player,
  team,
  reportDate = new Date(),
  createdBy = '',
  status = PUBLIC_REPORT_STATUS.PUBLISHED,
} = {}) {
  const entityType = REPORT_ENTITY_TYPES.PLAYER
  const entityId = resolvePlayerId(player)
  const reportType = REPORT_TYPES.PLAYER_TARGETS

  if (!entityId) {
    throw new Error(
      '[buildPlayerTargetsPublicReportInput] entityId is required'
    )
  }

  const sourceKey = buildPublicReportSourceKey({
    entityType,
    entityId,
    reportType,
  })

  const reportContent = buildPlayerTargetsReportContent({
    player,
    team,
    reportDate,
  })

  return {
    schemaVersion: PUBLIC_REPORT_SCHEMA_VERSION,
    sourceKey,
    reportType,
    entityType,
    entityId,
    status,
    createdBy: asReportText(createdBy),
    reportContent: sanitizeReportValue(reportContent),
  }
}
