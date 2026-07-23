// features/playersDatabase/ui/pages/searchPage/SearchInsightsPanel.js

import { Box, Button, Card, Divider, Stack, Typography } from '@mui/joy'

import SearchActiveQuery from './SearchActiveQuery.js'
import SearchKpiRow from './SearchKpiRow.js'
import { searchResultsSx as sx } from './sx/searchResults.sx.js'

function buildTopItems(rows, key, limit = 4) {
  const counts = rows.reduce((acc, row) => {
    const value = row[key]
    if (!value) return acc
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}

function InsightList({ title, items, emptyLabel }) {
  return (
    <Stack sx={sx.insightBlock}>
      <Typography level='title-sm' sx={sx.insightTitle}>{title}</Typography>

      {items.length ? items.map(item => (
        <Box key={item.label} sx={sx.insightRow}>
          <Typography level='body-sm' sx={sx.insightLabel}>{item.label}</Typography>
          <Box sx={sx.insightValue}>{item.count}</Box>
        </Box>
      )) : (
        <Typography level='body-xs' sx={sx.insightEmpty}>{emptyLabel}</Typography>
      )}
    </Stack>
  )
}

export default function SearchInsightsPanel({ rows, summary, activeItems, onRemoveFilter, onReset }) {
  const leagues = buildTopItems(rows, 'leagueName')
  const teams = buildTopItems(rows, 'teamName')
  const profiles = buildTopItems(rows, 'primaryProfile')

  return (
    <Card sx={sx.insightsPanel}>
      <Box sx={sx.insightsHeader}>
        <Box>
          <Typography level='title-lg' sx={sx.title}>סיכום תוצאות</Typography>
          <Typography level='body-xs' sx={sx.subtitle}>מדדים ופיזור של החיפוש הפעיל.</Typography>
        </Box>

        <Button size='sm' variant='plain' sx={sx.resetButton} onClick={onReset}>
          איפוס
        </Button>
      </Box>

      <Stack className='dpScrollThin' sx={sx.insightsScroll}>
        <SearchKpiRow summary={summary} compact />

        <Divider />

        <Box sx={sx.activeQueryPanel}>
          <Typography level='title-sm' sx={sx.insightTitle}>שאילתה פעילה</Typography>
          <SearchActiveQuery items={activeItems} onRemove={onRemoveFilter} compact />
        </Box>

        <Divider />

        <InsightList title='פרופילים מובילים' items={profiles} emptyLabel='לא נמצאו פרופילים בתוצאות.' />
        <InsightList title='ליגות מובילות' items={leagues} emptyLabel='לא נמצאו ליגות בתוצאות.' />
        <InsightList title='קבוצות מובילות' items={teams} emptyLabel='לא נמצאו קבוצות בתוצאות.' />
      </Stack>
    </Card>
  )
}
