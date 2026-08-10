// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterOverview.js

import { Box } from '@mui/joy'

import KpiCard from '../../components/kpi/KpiCard.js'
import { leagueCenterOverviewSx as sx } from './sx/leagueCenterOverview.sx.js'

export default function LeagueCenterOverview({ summary }) {
  return (
    <Box sx={sx.statsGrid}>
      <KpiCard
        title='ליגות בהקשר'
        value={summary.totalLeagues}
        caption='לפי שנתון, רמה ועונה'
        iconId='playersDatabase'
        tone='info'
        sx={sx.summaryCard}
      />
      <KpiCard
        title='מלאות'
        value={summary.fullData}
        caption='טבלה וכיסוי קבוצות היעד'
        iconId='defensive'
        tone='success'
        sx={sx.summaryCard}
      />
      <KpiCard
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
