// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterKpiOverview.js

import { Box } from '@mui/joy'

import KpiCard from '../../components/kpi/KpiCard.js'
import { leagueCenterKpiOverviewSx as sx } from './sx/leagueCenterKpiOverview.sx.js'

export default function LeagueCenterKpiOverview({ summary }) {
  return (
    <Box sx={sx.kpiGrid}>
      <KpiCard
        title='ליגות פעילות'
        value={summary.activeLeagues}
        caption='נדרשת בהן עבודה שוטפת'
        iconId='playersDatabase'
        tone='success'
        sx={sx.summaryCard}
      />
      <KpiCard
        title='ללא קבוצות'
        value={summary.leaguesWithoutTeams}
        caption='עונות שנפתחו ועדיין ריקות'
        iconId='warning'
        tone='warning'
        sx={sx.summaryCard}
      />
      <KpiCard
        title='לבדיקה'
        value={summary.leaguesRequiringReview}
        caption='יש לפחות קבוצה ללא סגל'
        iconId='warning'
        tone='warning'
        sx={sx.summaryCard}
      />
      <KpiCard
        title='ליגות עם איתותים'
        value={summary.leaguesWithSignals}
        caption='כוללות משפחת איתותים פעילה'
        iconId='scouting'
        tone='info'
        sx={sx.summaryCard}
      />
    </Box>
  )
}
