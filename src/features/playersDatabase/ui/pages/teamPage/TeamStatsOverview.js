// features/playersDatabase/ui/pages/teamPage/TeamStatsOverview.js

import { Box } from '@mui/joy'

import TeamKpiCard from './TeamKpiCard.js'
import { formatRate, formatValue } from './logic/teamPage.utils.js'
import { teamPageSx as sx } from './sx/teamPage.sx.js'

export default function TeamStatsOverview({ team }) {
  const successPercent = team.successPercent === null
    ? '-'
    : `${team.successPercent}%`
  const offense = team.offense || {}
  const defense = team.defense || {}

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
          title='ביצוע התקפי'
          value={formatRate(offense.priorityRate)}
          iconId='stats'
          priorityLevel={offense.priorityLevel}
          details={[
            {
              label: 'איכות',
              value: formatRate(offense.qualityRate),
              tooltip: 'ציון איכות התקפית לפי דירוג שערי הזכות בליגה.',
            },
            {
              label: 'חריגות',
              value: formatRate(offense.anomalyRate),
              tooltip: 'ציון חריגות התקפית ביחס למיקום בטבלה ולנתון הייחוס.',
            },
            { label: 'שערים', value: formatValue(team.goalsFor) },
            { label: 'למשחק', value: team.attackPerGame },
          ]}
        />

        <TeamKpiCard
          title='ביצוע הגנתי'
          value={formatRate(defense.priorityRate)}
          iconId='defensive'
          priorityLevel={defense.priorityLevel}
          details={[
            {
              label: 'איכות',
              value: formatRate(defense.qualityRate),
              tooltip: 'ציון איכות הגנתית לפי דירוג שערי הספיגה בליגה.',
            },
            {
              label: 'חריגות',
              value: formatRate(defense.anomalyRate),
              tooltip: 'ציון חריגות הגנתית ביחס למיקום בטבלה ולנתון הייחוס.',
            },
            { label: 'ספיגות', value: formatValue(team.goalsAgainst) },
            { label: 'למשחק', value: team.defensePerGame },
          ]}
        />
      </Box>
    </Box>
  )
}
