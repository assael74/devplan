// features/playersDatabase/ui/pages/searchPage/resultsSidebar/SearchResultsSummary.js

import { Box, Typography } from '@mui/joy'

import { searchResultsSummarySx as sx } from './sx/searchResultsSummary.sx.js'

export default function SearchResultsSummary({ summary = {}, entityType = 'player' }) {
  const items = entityType === 'team'
    ? [
      { key: 'total', label: 'קבוצות', value: summary.total || 0 },
      { key: 'leagues', label: 'ליגות', value: summary.leagues || 0 },
    ]
    : [
      { key: 'total', label: 'שחקנים', value: summary.total || 0 },
      { key: 'teams', label: 'קבוצות', value: summary.teams || 0 },
      { key: 'leagues', label: 'ליגות', value: summary.leagues || 0 },
      { key: 'profiles', label: 'עם פרופיל', value: summary.profiles || 0 },
    ]

  return (
    <Box sx={sx.grid}>
      {items.map(item => (
        <Box key={item.key} sx={sx.item}>
          <Typography level='body-xs' sx={sx.label}>
            {item.label}
          </Typography>
          <Typography level='h3' sx={sx.value}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
