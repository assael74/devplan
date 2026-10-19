// src/features/playersDatabase/ui/pages/teamPage/performance/components/TeamKpiOverview.js
import { Box, Tooltip, Typography } from '@mui/joy'

import KpiRow from '../../../../components/kpi/KpiRow.js'
import TeamPriorityBadge from '../../../../components/scout/shared/TeamPriorityBadge.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import TeamKpiCard from './TeamKpiCard.js'
import {
  formatRate,
  formatScore,
  formatValue,
} from '../../logic/teamPage.utils.js'
import { teamKpiOverviewSx as sx } from '../sx/teamKpiOverview.sx.js'

import { pickDefinedValue } from '../../../../../model/shared/value.model.js'

const resolveSide = (team, side) => (
  team?.performanceView?.[side] || {}
)

const CompetitionTimeline = ({
  currentLevel,
  previousLevel,
}) => (
  <Box sx={sx.positionTimeline}>
    <Typography component='span' sx={sx.competitionCurrent}>
      {currentLevel === null || currentLevel === undefined ? 'רמה לא ידועה' : `רמה ${currentLevel}`}
    </Typography>
    {previousLevel !== null && previousLevel !== undefined ? (
      <>
        <Box sx={sx.positionTimelineArrow}>{iconUi({ id: 'back', size: 'sm' })}</Box>
        <Typography component='span' sx={sx.competitionPrevious}>
          {previousLevel}
        </Typography>
      </>
    ) : null}
  </Box>
)

const CompetitionAgeGroups = ({ currentAgeGroup, previousAgeGroup, hasPreviousSeason }) => (
  <Box sx={sx.competitionAgeGroups}>
    <Typography component='span' sx={sx.competitionAgeGroup} title={currentAgeGroup}>
      {currentAgeGroup || 'קבוצת גיל לא ידועה'}
    </Typography>
    {hasPreviousSeason ? (
      <>
        <Box sx={sx.competitionAgeGroupArrow}>{iconUi({ id: 'back', size: 'sm' })}</Box>
        <Typography component='span' sx={sx.competitionAgeGroup} title={previousAgeGroup}>
          {previousAgeGroup || 'קבוצת גיל לא ידועה'}
        </Typography>
      </>
    ) : null}
  </Box>
)

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
              : season.tableRank === undefined || season.tableRank === null ? '-' : season.tableRank}
          </Box>
        </Tooltip>
      </Box>
    ))}
  </Box>
)

const PriorityTimeline = ({
  seasons = [],
  side,
  view,
  team,
}) => (
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
                {index === 0 ? (
                  <TeamPriorityBadge side={side} view={view} team={team} teamName={team.name} fontSize={12} />
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
  competitionLevels = {},
  leaguePath = [],
  tablePositionTimeline = [],
  offensePriorityTimeline = [],
  defensePriorityTimeline = [],
  insightDetails = {},
}) {
  const offense = resolveSide(team, 'offense')
  const defense = resolveSide(team, 'defense')
  const ageGroupFor = seasonKey => leaguePath.find(season => season.seasonKey === seasonKey)?.ageGroupLabel || ''
  const currentSeasonKey = tablePositionTimeline[0]?.seasonKey
  const previousSeasonKey = tablePositionTimeline[1]?.seasonKey
  return (
    <KpiRow sx={sx.kpiRow}>
        <TeamKpiCard
          performance
          title='רמת התחרות'
          valueContent={<CompetitionTimeline
            currentLevel={competitionLevels.currentLevel}
            previousLevel={competitionLevels.previousLevel}
          />}
          detailsContent={<CompetitionAgeGroups
            currentAgeGroup={ageGroupFor(currentSeasonKey)}
            previousAgeGroup={ageGroupFor(previousSeasonKey)}
            hasPreviousSeason={Boolean(previousSeasonKey)}
          />}
          iconId='league'
          insightNotes={[insightDetails.competition].filter(detail => detail?.text)}
        />

        <TeamKpiCard
          performance
          title='מצב בטבלה'
          valueContent={<TablePositionTimeline seasons={tablePositionTimeline} />}
          iconId='points'
          insightNotes={[insightDetails.rank].filter(detail => detail?.text)}
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
          title='ביצוע התקפי'
          valueContent={<PriorityTimeline seasons={offensePriorityTimeline} side='offense' view={offense} team={team} />}
          iconId='stats'
          insightNotes={[insightDetails.offense].filter(detail => detail?.text)}
          iconPriority={offensePriorityTimeline[0]?.level}
          details={[
            {
              label: 'איכות ביצוע',
              value: formatRate(offense.quality?.rate),
              tooltip: 'איכות הכיבוש המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: 'דירוג ביחס למיקום',
              value: formatRate(pickDefinedValue(offense.ranking?.normalized, offense.ranking?.rate)),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה בכיבוש שערים.',
            },
          ]}
        />

        <TeamKpiCard
          performance
          title='ביצוע הגנתי'
          valueContent={<PriorityTimeline seasons={defensePriorityTimeline} side='defense' view={defense} team={team} />}
          iconId='defensive'
          insightNotes={[insightDetails.defense].filter(detail => detail?.text)}
          iconPriority={defensePriorityTimeline[0]?.level}
          details={[
            {
              label: 'איכות ביצוע',
              value: formatRate(defense.quality?.rate),
              tooltip: 'איכות מניעת השערים המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: 'דירוג ביחס למיקום',
              value: formatRate(pickDefinedValue(defense.ranking?.normalized, defense.ranking?.rate)),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה במניעת שערים.',
            },
          ]}
        />
    </KpiRow>
  )
}





