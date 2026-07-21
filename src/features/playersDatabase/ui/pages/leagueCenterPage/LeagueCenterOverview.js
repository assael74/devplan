// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterOverview.js

import { Box } from '@mui/joy'

import StatCard from '../../components/cards/StatCard.js'
import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterOverview({ summary }) {
  return (
    <Box sx={sx.statsGrid}>
      <StatCard
        title='ליגות במערכת'
        value={summary.totalLeagues}
        caption='כל הליגות הפעילות'
        iconId='playersDatabase'
        tone='info'
      />
      <StatCard
        title='ליגות עם טבלה מלאה'
        value={summary.fullTables}
        caption='מוכנות לחישוב ביצועי קבוצות'
        iconId='defensive'
        tone='success'
      />
      <StatCard
        title='ליגות חלקיות'
        value={summary.partialTeams}
        caption='חסר סגל או סטטיסטיקות'
        iconId='warning'
        tone='warning'
      />
      <StatCard
        title='שחקנים מסומנים'
        value={summary.profiledPlayers}
        caption='עם פרופיל סקאוט'
        iconId='players'
        tone='neutral'
      />
    </Box>
  )
}
