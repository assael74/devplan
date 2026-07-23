// features/playersDatabase/ui/pages/searchPage/SearchKpiRow.js

import { Box } from '@mui/joy'

import StatCard from '../../components/cards/StatCard.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

export default function SearchKpiRow({ summary, compact = false }) {
  return (
    <Box sx={compact ? sx.statsGridCompact : sx.statsGrid}>
      <StatCard title='שחקנים שנמצאו' value={summary.total} caption='לפי השאילתה הפעילה' iconId='players' />
      <StatCard title='קבוצות מיוצגות' value={summary.teams} caption='פיזור תוצאות החיפוש' iconId='teams' />
      <StatCard title='ליגות מיוצגות' value={summary.leagues} caption='בכל הרמות שנבחרו' iconId='league' />
      <StatCard title='התאמות לפרופיל' value={summary.profiles} caption='שחקנים עם פרופיל סקאוט' iconId='targets' />
    </Box>
  )
}
