import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import LeagueName from '../../components/entities/LeagueName.js'
import ScoutBadge from '../../components/scout/shared/ScoutBadge.js'
import TableRankBadge from '../../components/tables/TableRankBadge.js'
import { TEAM_YEAR_METRICS } from './model/teamYearDevelopment.presentation.js'
import { TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from './sx/teamYearDevelopmentShared.sx.js'
import { teamYearMetricsSectionSx } from './sx/teamYearMetricsSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearMetricsSectionSx }

const displayValue = ({ value, decimal = false }) => {
  if (value === null || value === undefined) return '—'
  return decimal ? Number(value).toFixed(1) : value
}

const renderMetricValue = ({ metric, season }) => {
  const value = season[metric.key]

  if (metric.presentation === 'tableRank') {
    return value === null || value === undefined ? '—' : <TableRankBadge value={value} />
  }

  if (metric.priorityKey) {
    const priority = String(season[metric.priorityKey] || '').trim()
    const priorityLabel = ({
      elite: 'יעד מוביל',
      high: 'עדיפות גבוהה',
      positive: 'חיובי',
      neutral: 'רגיל',
      low: 'עדיפות נמוכה',
    })[priority] || 'רגיל'
    return priority ? (
      <ScoutBadge
        value={priority}
        short
        fontSize={12}
        tooltip={`${metric.label}: ${priorityLabel}${value ? ` · מקום ${value} ביחס לליגה` : ''}`}
      />
    ) : '—'
  }

  return displayValue({ value, decimal: metric.decimal })
}

export default function TeamYearMetricsSection({ timeline = [], overview = {} }) {
  const columnsTemplate = `minmax(126px, 1.1fr) repeat(${timeline.length}, minmax(96px, 1fr))`

  return <>
    <TeamYearSection iconId='trend' title='התפתחות השנתון לאורך עונות'>
      <Box sx={sx.timelineWrap}>
        <Box sx={[sx.timeline, { gridTemplateColumns: columnsTemplate }]}>
          <Box sx={[sx.cell, sx.metricHead]} />
          {timeline.map(season => (
            <Box key={season.seasonKey} sx={[sx.cell, sx.seasonHead, season.isCurrent && sx.currentSeasonHead]}>
              <Typography sx={sx.seasonTitle}>{season.seasonKey}</Typography>
            </Box>
          ))}
          {TEAM_YEAR_METRICS.map(metric => (
            <Box key={metric.key} sx={sx.metricGroup}>
              <Box sx={[sx.cell, sx.metricLabel]}>
                <Box sx={sx.metricIcon}>{iconUi({ id: metric.iconId, size: 'sm' })}</Box>
                <Typography sx={sx.metricText}>{metric.label}</Typography>
              </Box>
              {timeline.map(season => (
                <Box key={`${metric.key}-${season.seasonKey}`} sx={[sx.cell, sx.valueCell, season.isCurrent && sx.currentValueCell]}>
                  <Box sx={sx.value}>{renderMetricValue({ metric, season })}</Box>
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
            <Box sx={sx.leagueCardHead}>
              <Typography sx={sx.cardSeason}>{season.seasonKey}</Typography>
              {season.ageGroupLabel ? <Typography sx={sx.ageGroup}>{season.ageGroupLabel}</Typography> : null}
            </Box>
            <LeagueName value={season.leagueName} level={season.leagueLevel} showLevel fontSize={12} levelFontSize={9} />
          </Box>
        ))}
      </Box>
    </TeamYearSection>
  </>
}
