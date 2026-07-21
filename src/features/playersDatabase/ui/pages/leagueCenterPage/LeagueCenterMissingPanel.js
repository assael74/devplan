// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterMissingPanel.js

import { Box, Card, Stack, Typography } from '@mui/joy'

import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterMissingPanel({ items }) {
  return (
    <Card sx={sx.missingPanel}>
      <Stack sx={sx.missingContent}>
        <Typography level='title-lg' sx={sx.panelTitle}>
          מה חסר לי?
        </Typography>

        <Stack className='dpScrollThin' spacing={0.75} sx={sx.missingList}>
          {items.map(item => (
            <Box key={item.id} sx={sx.missingItem}>
              <Box sx={sx.missingDot} />
              <Typography sx={sx.missingTitle}>{item.label}</Typography>
              <Typography sx={sx.missingValue}>{item.value}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}
