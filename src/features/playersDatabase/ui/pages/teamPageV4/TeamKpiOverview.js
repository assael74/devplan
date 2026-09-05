import { Box, Tooltip, Typography } from '@mui/joy'

import KpiRow from '../../components/kpi/KpiRow.js'
import ScoutPriority from '../../../../../ui/patterns/scout/ScoutPriority.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import TeamKpiCard from './TeamKpiCard.js'
import {
  formatRate,
  formatScore,
  formatValue,
} from './logic/teamPage.utils.js'
import { teamKpiOverviewSx as sx } from './sx/teamKpiOverview.sx.js'

import { pickDefinedValue } from '../../../model/value.model.js'

const resolveSide = (team, side) => (
  team?.performanceView?.[side] || {}
)

export const TEAM_PERFORMANCE_PRESENTATION = Object.freeze({
  CANONICAL: 'canonical',
  LEGACY: 'legacy',
})

const TablePositionTimeline = ({ seasons = [] }) => (
  <Box sx={sx.positionTimeline}>
    {seasons.map((season, index) => (
      <Box key={season.seasonKey || index} sx={sx.positionTimelineEntry}>
        {index > 0 ? (
          <Box sx={sx.positionTimelineArrow}>
            {iconUi({ id: 'back', size: 'sm' })}
          </Box>
        ) : null}
        <Tooltip title={season.status === 'upcoming' ? 'העונה טרם החלה' : `עונת ${season.seasonKey}`}>
          <Box sx={index === 0 ? sx.positionCurrent : sx.positionPrevious}>
            {season.status === 'upcoming'
              ? iconUi({ id: 'calendar', size: index === 0 ? 'md' : 'sm', style: { fontSize: index === 0 ? 30 : 20 }, sx: { color: 'primary.700' } })
              : season.tableRank ?? '-'}
          </Box>
        </Tooltip>
      </Box>
    ))}
  </Box>
)

const PriorityTimeline = ({ seasons = [] }) => (
  <Box>
    <Box sx={sx.priorityTimeline}>
      {seasons.map((season, index) => (
        <Box key={season.seasonKey || index} sx={sx.positionTimelineEntry}>
          {index > 0 ? (
            <Box sx={sx.positionTimelineArrow}>{iconUi({ id: 'back', size: 'sm' })}</Box>
          ) : null}
          <Box sx={index === 0 ? sx.priorityCurrentGroup : sx.priorityPrevious}>
            {season.status === 'upcoming' ? (
              <Tooltip title='העונה טרם החלה'>
                <Box>{iconUi({ id: 'calendar', size: 'md', style: { fontSize: 30 }, sx: { color: 'primary.700' } })}</Box>
              </Tooltip>
            ) : (
              <>
                <Tooltip title={`עונת ${season.seasonKey}`}>
                  <Typography component='span' sx={index === 0 ? sx.priorityCurrentScore : sx.priorityPreviousScore}>
                    {formatScore(season.score)}
                  </Typography>
                </Tooltip>
                {index === 0 && season.level && season.level !== 'unavailable' ? (
                  <ScoutPriority value={season.level} fontSize={12} />
                ) : null}
              </>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
)
export default function TeamKpiOverview({
  team,
  title = 'ביצוע הקבוצה',
  tablePositionTimeline = [],
  offensePriorityTimeline = [],
  defensePriorityTimeline = [],
  presentation = TEAM_PERFORMANCE_PRESENTATION.CANONICAL,
}) {
  const offense = resolveSide(team, 'offense')
  const defense = resolveSide(team, 'defense')
  const isLegacy = presentation === TEAM_PERFORMANCE_PRESENTATION.LEGACY

  return (
    <Box sx={sx.performanceSection}>
      <Box sx={sx.performanceHeader}>
        <Box sx={sx.performanceTitleRow}>
          <Box sx={sx.performanceTitleIcon}>{iconUi({ id: 'stats', size: 'sm' })}</Box>
          <Typography sx={sx.performanceTitle}>{title}</Typography>
        </Box>
      </Box>
      <KpiRow sx={sx.kpiRow}>
        <TeamKpiCard
          performance
          title='מצב בטבלה'
          valueContent={<TablePositionTimeline seasons={tablePositionTimeline} />}
          iconId='points'
          details={[
            {
              label: 'שערי זכות',
              value: formatValue(team.goalsFor),
            },
            {
              label: 'שערי חובה',
              value: formatValue(team.goalsAgainst),
            },
          ]}
        />

        <TeamKpiCard
          performance
          title={isLegacy ? 'עדיפות התקפית' : 'ביצוע התקפי'}
          valueContent={<PriorityTimeline seasons={offensePriorityTimeline} />}
          iconId='stats'
          iconPriority={offensePriorityTimeline[0]?.level}
          details={[
            {
              label: isLegacy ? 'איכות' : 'איכות ביצוע',
              value: formatRate(offense.quality?.rate),
              tooltip: 'איכות הכיבוש המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: isLegacy ? 'חריגה למיקום' : 'דירוג ביחס למיקום',
              value: formatRate(pickDefinedValue(offense.ranking?.normalized, offense.ranking?.rate)),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה בכיבוש שערים.',
            },
          ]}
        />

        <TeamKpiCard
          performance
          title={isLegacy ? 'עדיפות הגנתית' : 'ביצוע הגנתי'}
          valueContent={<PriorityTimeline seasons={defensePriorityTimeline} />}
          iconId='defensive'
          iconPriority={defensePriorityTimeline[0]?.level}
          details={[
            {
              label: isLegacy ? 'איכות' : 'איכות ביצוע',
              value: formatRate(defense.quality?.rate),
              tooltip: 'איכות מניעת השערים המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: isLegacy ? 'חריגה למיקום' : 'דירוג ביחס למיקום',
              value: formatRate(pickDefinedValue(defense.ranking?.normalized, defense.ranking?.rate)),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה במניעת שערים.',
            },
          ]}
        />
      </KpiRow>
    </Box>
  )
}







