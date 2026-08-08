// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterOverview.js

import { Box } from '@mui/joy'

import StatCard from '../../components/cards/StatCard.js'
import { leagueCenterOverviewSx as sx } from './sx/leagueCenterOverview.sx.js'

export default function LeagueCenterOverview({ summary }) {
  return (
    <Box sx={sx.statsGrid}>
      <StatCard
        title='ליגות בהקשר'
        value={summary.totalLeagues}
        caption='לפי שנתון, רמה ועונה'
        iconId='playersDatabase'
        tone='info'
        sx={sx.summaryCard}
      />
      <StatCard
        title='מלאות'
        value={summary.fullData}
        caption='טבלה, שחקנים וסטטיסטיקות'
        iconId='defensive'
        tone='success'
        sx={sx.summaryCard}
      />
      <StatCard
        title='חלקיות'
        value={summary.partialData}
        caption='מידע קיים אך חלקי'
        iconId='warning'
        tone='warning'
        sx={sx.summaryCard}
      />
    </Box>
  )
}
