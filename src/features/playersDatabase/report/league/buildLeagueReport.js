// features/playersDatabase/report/league/buildLeagueReport.js

import {
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../../../reports/publicApi.js'
import { buildTeamPerformanceSideViewModel } from '../../model/teamPerformance.viewModel.js'

function clean(value) {
  return String(value || '').trim()
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function toCount(value) {
  const number = toNumber(value)
  return number === null ? 0 : number
}

function formatReportDate(value = new Date()) {
  return new Intl.DateTimeFormat('he-IL').format(value)
}

function normalizePerformanceSide(side = {}) {
  return buildTeamPerformanceSideViewModel(side)
}

function calculateSuccessRate({ games, points }) {
  if (!games) return 0
  return Math.round((points / (games * 3)) * 1000) / 10
}

function buildLeagueRow(team = {}) {
  const performance = team.performance || {}
  const games = toCount(team.games)
  const points = toCount(team.points)

  return {
    id: clean(team.id || team.birthTeamId || team.teamId),
    clubId: clean(team.clubId),
    clubLevel: toCount(team.clubLevel),
    teamId: clean(team.teamId || team.birthTeamId),
    name: clean(team.name) || 'קבוצה',
    tableRank: toCount(team.tableRank),
    games,
    goalsFor: toCount(team.goalsFor),
    goalsAgainst: toCount(team.goalsAgainst),
    points,
    successRate: toNumber(team.successRate) !== null
      ? toNumber(team.successRate)
      : calculateSuccessRate({
        games,
        points,
      }),
    playersCount: toCount(team.playersCount),
    profilesCount: toCount(team.profilesCount),
    offense: normalizePerformanceSide(performance.offense),
    defense: normalizePerformanceSide(performance.defense),
  }
}

const RECOMMENDED_LEVELS = ['elite', 'high']

function isRecommended(level) {
  return RECOMMENDED_LEVELS.includes(clean(level))
}

function buildDistribution(rows = []) {
  return {
    offensePriorityRecommended: rows.filter(row => (
      isRecommended(row.offense.priority.level)
    )).length,
    defensePriorityRecommended: rows.filter(row => (
      isRecommended(row.defense.priority.level)
    )).length,
    offenseAnomalyRecommended: rows.filter(row => (
      isRecommended(row.offense.anomaly.level)
    )).length,
    defenseAnomalyRecommended: rows.filter(row => (
      isRecommended(row.defense.anomaly.level)
    )).length,
  }
}

export function buildLeagueReport({
  league = {},
  teams = [],
  summary = {},
  seasonKey = '',
} = {}) {
  const leagueId = clean(league.id)
  const resolvedSeasonKey = clean(seasonKey)
  const entityId = `${leagueId}:${resolvedSeasonKey}`
  const rows = teams
    .map(buildLeagueRow)
    .sort((first, second) => first.tableRank - second.tableRank)
  const distribution = buildDistribution(rows)
  const goalsCount = rows.reduce((total, row) => total + row.goalsFor, 0)

  return {
    sourceKey: `externalLeagueTable:${entityId}`,
    reportType: REPORT_TYPES.EXTERNAL_LEAGUE_TABLE,
    entityType: REPORT_ENTITY_TYPES.LEAGUE_SEASON,
    entityId,
    reportContent: {
      schemaVersion: 1,
      reportType: REPORT_TYPES.EXTERNAL_LEAGUE_TABLE,
      entity: {
        type: REPORT_ENTITY_TYPES.LEAGUE_SEASON,
        id: entityId,
        name: league.name || 'ליגה',
        avatarUrl: league.logoUrl || '',
      },
      meta: {
        title: 'טבלת ליגה',
        subtitle: league.name || '',
        reportDate: formatReportDate(),
        columns: 2,
        showEntity: false,
        items: [
          {
            id: 'season',
            label: 'עונה',
            value: resolvedSeasonKey || '—',
          },
          {
            id: 'league',
            label: 'ליגה',
            value: clean(league.name) || '—',
          },
          {
            id: 'ageGroup',
            label: 'קבוצת גיל',
            value: league.ageGroup || '—',
          },
          {
            id: 'level',
            label: 'רמת ליגה',
            value: league.levelLabel || '—',
          },
        ],
      },
      content: {
        type: 'leagueTable',
        title: 'מפת ביצועי הקבוצות',
        description: 'צילום מצב הליגה ומדדי הביצוע בזמן פרסום הדוח.',
      },
      snapshot: {
        league: {
          id: leagueId,
          name: clean(league.name),
          seasonKey: resolvedSeasonKey,
          ageGroup: clean(league.ageGroup),
          levelLabel: clean(league.levelLabel),
        },
        summary: {
          teamsCount: rows.length,
          goalsCount: toCount(summary.goalsCount) || goalsCount,
          profilesCount: toCount(summary.profilesCount),
          ...distribution,
        },
        rows,
      },
    },
  }
}
