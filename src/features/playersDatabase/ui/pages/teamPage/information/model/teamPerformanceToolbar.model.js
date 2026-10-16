// src/features/playersDatabase/ui/pages/teamPage/information/model/teamPerformanceToolbar.model.js

import { formatScore, formatValue } from '../../logic/teamPage.utils.js'
import { formatLtrNumber } from '../../../../../../../shared/format/direction.js'
import { TEAM_YEAR_METRICS, buildTeamYearMetricChange } from '../../yearDevelopment/model/teamYearDevelopment.presentation.js'

const buildChange = (delta, subject, showAmount = false) => {
  if (!Number.isFinite(delta)) return null
  return {
    iconId: delta > 0 ? 'sortUp' : delta < 0 ? 'sortDown' : 'equal',
    color: delta > 0 ? 'success' : delta < 0 ? 'danger' : 'neutral',
    label: showAmount ? formatLtrNumber(delta, { signed: true }) : '',
    ariaLabel: `${delta > 0 ? 'עלייה' : delta < 0 ? 'ירידה' : 'ללא שינוי'} ב${subject} לעומת העונה הקודמת`,
  }
}

export const buildTeamPerformanceToolbar = (view = {}) => {
  const timeline = view.developmentTimeline || []
  const season = timeline.find(item => item.seasonKey === view.selectedSeasonKey) ||
    timeline.find(item => item.isCurrent) || timeline.find(item => item.status !== 'upcoming')
  const previousSeason = season ? timeline[timeline.indexOf(season) + 1] : null
  const priorityValue = entries => entries?.[0]?.status === 'upcoming' ? '—' : formatScore(entries?.[0]?.score)
  const tableSeason = view.seasonTimeline?.[0]
  const { currentLevel, previousLevel } = view.performanceInsight?.facts || {}
  const competitionDelta = season?.status !== 'upcoming' && tableSeason?.status !== 'upcoming' &&
    Number.isFinite(currentLevel) && Number.isFinite(previousLevel)
    ? previousLevel - currentLevel
    : null
  const competitionChange = buildChange(competitionDelta, 'רמת התחרות', competitionDelta !== 0)
  const rankChange = tableSeason?.status === 'upcoming' ? null
    : buildChange(view.performanceInsight?.facts?.rankDelta, 'מיקום בטבלה', true)
  const metricKeys = ['successPercent', 'professionalProfiles', 'underuseProfiles']

  return {
    seasonKey: season?.seasonKey || view.selectedSeasonKey || '',
    kpis: [
      {
        key: 'competition', label: 'רמת תחרות', iconId: 'league', value: formatValue(currentLevel),
        change: competitionChange,
        color: competitionChange?.color || 'neutral',
      },
      {
        key: 'rank', label: 'מיקום', iconId: 'points',
        value: tableSeason?.status === 'upcoming' ? '—' : formatValue(tableSeason?.tableRank),
        change: rankChange,
        color: rankChange?.color || 'neutral',
      },
      {
        key: 'offense', label: 'ביצוע התקפי', iconId: 'stats',
        value: priorityValue(view.offensePriorityTimeline),
        priorityLevel: view.offensePriorityTimeline?.[0]?.level,
        change: buildChange(view.performanceInsight?.facts?.priorities?.offense?.delta, 'עדיפות'),
      },
      {
        key: 'defense', label: 'ביצוע הגנתי', iconId: 'defensive',
        value: priorityValue(view.defensePriorityTimeline),
        priorityLevel: view.defensePriorityTimeline?.[0]?.level,
        change: buildChange(view.performanceInsight?.facts?.priorities?.defense?.delta, 'עדיפות'),
      },
    ],
    metrics: metricKeys.map(key => {
      const metric = TEAM_YEAR_METRICS.find(item => item.key === key)
      const value = season?.[key]
      const available = value !== null && value !== undefined && value !== '' && season.status !== 'upcoming'
      const change = available ? buildTeamYearMetricChange({ metric, season, previousSeason }) : null
      const profileGroup = { professionalProfiles: 'professional', underuseProfiles: 'underuse' }[key]
      const profileFact = view.performanceInsight?.facts?.profiles?.[profileGroup]
      const insightTone = view.performanceInsight?.details?.find(detail => detail.key === key)?.tone
      const color = profileGroup
        ? profileFact?.significant
          ? { positive: 'success', negative: 'danger' }[insightTone] || 'neutral'
          : 'neutral'
        : undefined
      return {
        key,
        label: metric.label,
        iconId: metric.iconId,
        value: available ? `${value}${metric.percent ? '%' : ''}` : '—',
        color,
        change: change && color ? { ...change, color } : change,
      }
    }),
  }
}
