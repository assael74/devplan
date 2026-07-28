// features/playersDatabase/report/player/buildPlayerReport.js

import {
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../../../reports/reports.constants.js'

function formatReportDate(value = new Date()) {
  return new Intl.DateTimeFormat('he-IL').format(value)
}

export function buildPlayerReport({
  player = {},
  historyRows = [],
} = {}) {
  const playerId = String(player.id || player.playerId || '').trim()

  return {
    sourceKey: `externalPlayerDetails:${playerId}`,
    reportType: REPORT_TYPES.EXTERNAL_PLAYER_DETAILS,
    entityType: REPORT_ENTITY_TYPES.EXTERNAL_PLAYER,
    entityId: playerId,
    reportContent: {
      schemaVersion: 1,
      reportType: REPORT_TYPES.EXTERNAL_PLAYER_DETAILS,
      entity: {
        type: REPORT_ENTITY_TYPES.EXTERNAL_PLAYER,
        id: playerId,
        name: player.fullName || player.name || 'שחקן',
        avatarUrl: player.avatarUrl || player.imageUrl || '',
      },
      meta: {
        title: 'מפרט שחקן',
        subtitle: player.positionLabel || player.position || '',
        reportDate: formatReportDate(),
        columns: 2,
        items: [
          { id: 'birthYear', label: 'שנתון', value: String(player.birthYear || '—') },
          { id: 'position', label: 'עמדה', value: player.positionLabel || player.position || '—' },
          { id: 'team', label: 'קבוצה נוכחית', value: player.teamName || '—' },
          { id: 'seasons', label: 'עונות בדוח', value: String(historyRows.length) },
        ],
      },
      content: {
        title: 'מפרט שחקן רב־עונתי',
        description: 'תוכן הסטטיסטיקה, ההיסטוריה ופרופילי הסקאוט ייבנה בשלב התוכן.',
      },
      snapshot: {
        player,
        historyRows,
      },
    },
  }
}
