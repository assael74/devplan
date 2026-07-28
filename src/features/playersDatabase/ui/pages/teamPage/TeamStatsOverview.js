// src/features/playersDatabase/ui/pages/teamPage/TeamStatsOverview.js

import { Box } from '@mui/joy'

import TeamKpiCard from './TeamKpiCard.js'
import { formatRate, formatValue } from './logic/teamPage.utils.js'
import { teamPageSx as sx } from './sx/teamPage.sx.js'

const resolveSide = (team, side) => (
  team?.performanceView?.[side] || {}
)

export default function TeamStatsOverview({ team }) {
  const successPercent = team.successPercent === null
    ? '-'
    : `${team.successPercent}%`
  const offense = resolveSide(team, 'offense')
  const defense = resolveSide(team, 'defense')

  return (
    <Box sx={sx.statsSection}>
      <Box sx={sx.statsGrid}>
        <TeamKpiCard
          title='מצב בטבלה'
          value={team.tableRank}
          iconId='points'
          details={[
            { label: 'נקודות', value: formatValue(team.points) },
            { label: 'הצלחה', value: successPercent },
            { label: 'משחקים', value: formatValue(team.games) },
          ]}
        />

        <TeamKpiCard
          performance
          title='עדיפות התקפית'
          value={formatRate(offense.priority?.rate)}
          iconId='stats'
          level={offense.priority?.level}
          primaryDetails={[
            { label: 'שערים', value: formatValue(team.goalsFor) },
            { label: 'למשחק', value: team.attackPerGame },
          ]}
          details={[
            {
              label: 'איכות',
              value: formatRate(offense.quality?.rate),
              tooltip: 'איכות הכיבוש המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: 'ביצוע מול יעד',
              value: formatRate(offense.target?.rate),
              tooltip: 'ביצוע הכיבוש בפועל ביחס ליעד שנקבע לפי מיקום הקבוצה.',
            },
            {
              label: 'חריגה מהמיקום',
              value: formatRate(offense.ranking?.rate),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה בכיבוש שערים.',
            },
            {
              label: 'אנומליה',
              value: formatRate(offense.anomaly?.rate),
              tooltip: 'השילוב בין ביצוע מול היעד לבין החריגה מהמיקום.',
            },
          ]}
        />

        <TeamKpiCard
          performance
          title='עדיפות הגנתית'
          value={formatRate(defense.priority?.rate)}
          iconId='defensive'
          level={defense.priority?.level}
          primaryDetails={[
            { label: 'ספיגות', value: formatValue(team.goalsAgainst) },
            { label: 'למשחק', value: team.defensePerGame },
          ]}
          details={[
            {
              label: 'איכות',
              value: formatRate(defense.quality?.rate),
              tooltip: 'איכות מניעת השערים המוחלטת ביחס לכל קבוצות הליגה.',
            },
            {
              label: 'ביצוע מול יעד',
              value: formatRate(defense.target?.rate),
              tooltip: 'ביצוע הספיגה בפועל ביחס ליעד שנקבע לפי מיקום הקבוצה.',
            },
            {
              label: 'חריגה מהמיקום',
              value: formatRate(defense.ranking?.rate),
              tooltip: 'הפער בין מיקום הקבוצה בטבלה לבין דירוגה במניעת שערים.',
            },
            {
              label: 'אנומליה',
              value: formatRate(defense.anomaly?.rate),
              tooltip: 'השילוב בין ביצוע מול היעד לבין החריגה מהמיקום.',
            },
          ]}
        />
      </Box>
    </Box>
  )
}
