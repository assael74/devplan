import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { formatLtrNumber } from '../../../../../shared/format/direction.js'
import ScoutBadge from '../../components/scout/shared/ScoutBadge.js'
import TableRankBadge from '../../components/tables/TableRankBadge.js'
import { TEAM_YEAR_METRICS } from './model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from './sx/teamYearDevelopmentShared.sx.js'
import { teamYearMetricsSectionSx } from './sx/teamYearMetricsSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearMetricsSectionSx }

const displayValue = ({ value, decimal = false }) => {
  if (value === null || value === undefined) return '—'
  return decimal ? Number(value).toFixed(1) : value
}

const SCOUT_PRIORITY_ORDER = Object.freeze({
  low: 0,
  neutral: 1,
  positive: 2,
  high: 3,
  elite: 4,
})

const comparableMetricValue = ({ metric, season }) => {
  if (metric.priorityKey) {
    const priority = String(season?.[metric.priorityKey] || '').trim()
    return Object.hasOwn(SCOUT_PRIORITY_ORDER, priority)
      ? SCOUT_PRIORITY_ORDER[priority]
      : null
  }

  return season?.[metric.key]
}

const valueChange = ({ metric, season, previousSeason }) => {
  const rawValue = comparableMetricValue({ metric, season })
  const rawPreviousValue = comparableMetricValue({ metric, season: previousSeason })
  if (rawValue === null || rawValue === undefined || rawValue === '' ||
    rawPreviousValue === null || rawPreviousValue === undefined || rawPreviousValue === '') {
    return null
  }

  const value = Number(rawValue)
  const previousValue = Number(rawPreviousValue)
  if (!Number.isFinite(value) || !Number.isFinite(previousValue)) return null

  const delta = value - previousValue
  const direction = delta === 0 ? 'same' : delta > 0 ? 'up' : 'down'
  const isImproved = direction === 'same'
    ? null
    : metric.betterDirection === 'lower'
      ? direction === 'down'
      : direction === 'up'
  return {
    direction,
    color: isImproved === null ? 'neutral' : isImproved ? 'success' : 'danger',
    iconId: direction === 'up' ? 'sortUp' : direction === 'down' ? 'sortDown' : 'remove',
    label: formatLtrNumber(
      metric.decimal ? Number(delta.toFixed(1)) : delta,
      { signed: true }
    ),
  }
}

const renderMetricValue = ({ metric, season, previousSeason }) => {
  const value = season[metric.key]
  let content = null

  if (metric.presentation === 'tableRank') {
    content = value === null || value === undefined ? '—' : <TableRankBadge value={value} />
  }
  else if (metric.priorityKey) {
    const priority = String(season[metric.priorityKey] || '').trim()
    const priorityLabel = ({
      elite: 'יעד מוביל',
      high: 'עדיפות גבוהה',
      positive: 'חיובי',
      neutral: 'רגיל',
      low: 'עדיפות נמוכה',
    })[priority] || 'רגיל'
    content = priority ? (
      <ScoutBadge
        value={priority}
        short
        fontSize={12}
        tooltip={`${metric.label}: ${priorityLabel}${value ? ` · מקום ${value} ביחס לליגה` : ''}`}
      />
    ) : '—'
  }
  else {
    content = displayValue({ value, decimal: metric.decimal })
  }

  const change = valueChange({ metric, season, previousSeason })
  return (
    <Box sx={sx.valueContent}>
      <Box sx={sx.valueMain}>{content}</Box>
      {change ? (
        <Chip
          size='sm'
          variant='soft'
          color={change.color}
          startDecorator={iconUi({ id: change.iconId, size: 'sm' })}
          sx={sx.valueChangeChip}
        >
          {change.label}
        </Chip>
      ) : null}
    </Box>
  )
}

export default function TeamYearMetricsSection({ timeline = [], overview = {} }) {
  const columnsTemplate = `minmax(108px, 0.8fr) repeat(${timeline.length}, minmax(96px, 1fr))`

  return <>
    <TeamYearSection iconId='trend' title='התפתחות השנתון לאורך עונות'>
      <Box sx={sx.timelineWrap}>
        <Box sx={[sx.timeline, { gridTemplateColumns: columnsTemplate }]}>
          <Box sx={[sx.cell, sx.metricHead]} />
          {timeline.map(season => (
            <Box key={season.seasonKey} sx={[sx.cell, sx.seasonHead, season.isCurrent && sx.currentSeasonHead]}>
              <SeasonSummaryChip season={season} />
            </Box>
          ))}
          {TEAM_YEAR_METRICS.map(metric => (
            <Box key={metric.key} sx={sx.metricGroup}>
              <Box sx={[sx.cell, sx.metricLabel]}>
                <Box sx={sx.metricIcon}>{iconUi({ id: metric.iconId, size: 'sm' })}</Box>
                <Typography sx={sx.metricText}>{metric.label}</Typography>
              </Box>
              {timeline.map((season, index) => (
                <Box key={`${metric.key}-${season.seasonKey}`} sx={[sx.cell, sx.valueCell, season.isCurrent && sx.currentValueCell]}>
                  <Box sx={sx.value}>
                    {renderMetricValue({ metric, season, previousSeason: timeline[index + 1] })}
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </TeamYearSection>

    <TeamYearSection iconId='league' title={`מסלול שנתון${overview.birthYear ? ` ${overview.birthYear}` : ''}`}>
      <Box sx={sx.leaguePath}>
        {(overview.leaguePath || []).map(season => (
          <Box key={season.seasonKey} sx={[sx.leagueCard, season.isCurrent && sx.leagueCardCurrent]}>
            <Box sx={sx.leagueCardHead}><SeasonSummaryChip season={season} /></Box>
          </Box>
        ))}
      </Box>
    </TeamYearSection>
  </>
}
