// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/components/TeamYearMetricsSection.js
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import TableRankBadge from '../../../../components/tables/TableRankBadge.js'
import { ADEQUATE_RELIABILITY_GAMES } from '../../information/model/teamPerformanceInsight.model.js'
import { TEAM_YEAR_METRICS, buildTeamYearMetricChange } from '../model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from '../sx/teamYearDevelopmentShared.sx.js'
import { teamYearMetricsSectionSx } from '../sx/teamYearMetricsSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearMetricsSectionSx }

const displayValue = ({ value, decimal = false }) => {
  if (value === null || value === undefined) return '—'
  return decimal ? Number(value).toFixed(1) : value
}

const renderMetricValue = ({ metric, season, previousSeason }) => {
  const value = season[metric.key]
  let content = null

  if (metric.presentation === 'tableRank') {
    content = value === null || value === undefined ? '—' : <TableRankBadge value={value} />
  }
  else {
    const display = displayValue({ value, decimal: metric.decimal })
    content = display === '—' ? display : `${display}${metric.percent ? '%' : ''}`
  }

  const change = buildTeamYearMetricChange({ metric, season, previousSeason })
  const gameSampleWarning = metric.key === 'games' && season.status !== 'upcoming' &&
    value !== null && value !== undefined && Number(value) < ADEQUATE_RELIABILITY_GAMES
  return (
    <Box sx={sx.valueContent}>
      <Box sx={[sx.valueMain, gameSampleWarning && sx.valueWarning]}>{content}</Box>
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

export default function TeamYearMetricsSection({ timeline = [], contextText = '' }) {
  const columnsTemplate = `minmax(108px, 0.8fr) repeat(${timeline.length}, minmax(96px, 1fr))`

  return (
    <Box sx={sx.section}>
      <Box sx={sx.timelineWrap}>
        <Box sx={[sx.timeline, { gridTemplateColumns: columnsTemplate }]}>
          <Box sx={[sx.cell, sx.metricHead]}>
            {contextText ? (
              <Typography sx={sx.metricContext} title={contextText}>{contextText}</Typography>
            ) : null}
          </Box>
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
    </Box>
  )
}
