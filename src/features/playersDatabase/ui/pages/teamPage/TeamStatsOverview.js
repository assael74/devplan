// features/playersDatabase/ui/pages/teamPage/TeamStatsOverview.js

import { Box } from '@mui/joy'

import KpiRow from '../../components/kpi/KpiRow.js'
import TeamKpiCard from './TeamKpiCard.js'
import {
  formatRate,
  formatScore,
  formatValue,
} from './logic/teamPage.utils.js'
import { teamStatsOverviewSx as sx } from './sx/teamStatsOverview.sx.js'

import { pickDefinedValue } from '../../../model/value.model.js'
const resolveSide = (team, side) => (
  team?.performanceView?.[side] || {}
)

export default function TeamStatsOverview({ team }) {
  const offense = resolveSide(team, 'offense')
  const defense = resolveSide(team, 'defense')

  return (
    <Box sx={sx.statsSection}>
      <KpiRow sx={sx.kpiRow}>
        <TeamKpiCard
          performance
          title='מצב בטבלה'
          value={team.tableRank}
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
          title='עדיפות התקפית'
          value={formatScore(pickDefinedValue(offense.priority?.score, offense.priority?.rate))}
          iconId='stats'
          level={offense.priority?.level}
          details={[
            {
              label: 'איכות',
              value: formatRate(offense.quality?.rate),
              tooltip: 'איכות הכיבוש המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: 'חריגה למיקום',
              value: formatRate(pickDefinedValue(offense.ranking?.normalized, offense.ranking?.rate)),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה בכיבוש שערים.',
            },
          ]}
        />

        <TeamKpiCard
          performance
          title='עדיפות הגנתית'
          value={formatScore(pickDefinedValue(defense.priority?.score, defense.priority?.rate))}
          iconId='defensive'
          level={defense.priority?.level}
          details={[
            {
              label: 'איכות',
              value: formatRate(defense.quality?.rate),
              tooltip: 'איכות מניעת השערים המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: 'חריגה למיקום',
              value: formatRate(pickDefinedValue(defense.ranking?.normalized, defense.ranking?.rate)),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה במניעת שערים.',
            },
          ]}
        />
      </KpiRow>
    </Box>
  )
}
