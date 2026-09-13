import { Box, Typography } from '@mui/joy'

import { clubPageSx as sx } from '../sx/clubPage.sx.js'

export default function ClubOpportunities({ model }) {
  if (!model.length) {
    return (
      <Typography level='body-sm'>
        אין אותות מקצועיים זמינים לבדיקה.
      </Typography>
    )
  }

  return (
    <Box sx={sx.sectionGrid}>
      {model.map(item => (
        <Box key={item.key} sx={sx.signal}>
          {item.ageGroups?.length
            ? `${item.label} · ${item.ageGroups.join(' · ')}`
            : `${item.label} · ${item.count}`}
        </Box>
      ))}
    </Box>
  )
}
