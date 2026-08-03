// features/playersDatabase/report/team/buildTeamReport.js

import {
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../../../reports/publicApi.js'

function formatReportDate(value = new Date()) {
  return new Intl.DateTimeFormat('he-IL').format(value)
}

export function buildTeamReport({
  team = {},
  players = [],
  seasonKey = '',
} = {}) {
  const teamId = String(team.birthTeamId || team.id || '').trim()
  const resolvedSeasonKey = String(seasonKey || '').trim()
  const entityId = `${teamId}:${resolvedSeasonKey}`

  return {
    sourceKey: `externalTeamDetails:${entityId}`,
    reportType: REPORT_TYPES.EXTERNAL_TEAM_DETAILS,
    entityType: REPORT_ENTITY_TYPES.BIRTH_TEAM_SEASON,
    entityId,
    reportContent: {
      schemaVersion: 1,
      reportType: REPORT_TYPES.EXTERNAL_TEAM_DETAILS,
      entity: {
        type: REPORT_ENTITY_TYPES.BIRTH_TEAM_SEASON,
        id: entityId,
        name: team.name || 'קבוצה',
        avatarUrl: team.logoUrl || team.avatarUrl || '',
      },
      meta: {
        title: 'מפרט קבוצה',
        subtitle: team.leagueName || '',
        reportDate: formatReportDate(),
        columns: 2,
        items: [
          { id: 'season', label: 'עונה', value: resolvedSeasonKey || '—' },
          { id: 'birthYear', label: 'שנתון', value: String(team.birthYear || '—') },
          { id: 'league', label: 'ליגה', value: team.leagueName || '—' },
          { id: 'players', label: 'שחקנים', value: String(players.length) },
        ],
      },
      content: {
        title: 'מפרט שנתון קבוצתי',
        description: 'תוכן הסגל, הסטטיסטיקה והפרופילים ייבנה בשלב התוכן.',
      },
      snapshot: {
        team,
        players,
      },
    },
  }
}
