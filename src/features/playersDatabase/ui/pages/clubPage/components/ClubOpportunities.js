// src/features/playersDatabase/ui/pages/clubPage/components/ClubOpportunities.js

import { Box, Typography } from '@mui/joy'

import { clubPageSx as sx } from '../sx/clubPage.sx.js'
import TeamSignalSummary from '../../../components/teamSignals/TeamSignalSummary.js'

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
        <Box key={item.id} sx={sx.signal}>
          <Typography level='title-sm'>{`שנתון ${item.birthYear}`}</Typography>
          <TeamSignalSummary
            summary={item.teamSignalSummary}
            getFamilyHref={id => `${item.teamHref}${item.teamHref.includes('?') ? '&' : '?'}insight=${id}`}
          />
        </Box>
      ))}
    </Box>
  )
}
