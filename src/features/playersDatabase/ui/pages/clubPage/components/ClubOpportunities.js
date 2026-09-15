import { Box, Typography } from '@mui/joy'

import { clubPageSx as sx } from '../sx/clubPage.sx.js'

const SPOTLIGHT_LABELS = {
  FUTURE_LEAGUE_PATH_RISE: 'שיפור צפוי ברמת הליגה',
  FUTURE_LEAGUE_PATH_DROP: 'ירידה צפויה ברמת הליגה',
  LEAGUE_ABOVE_CLUB_LEVEL: 'ליגה מעל רמת המועדון',
  LEAGUE_BELOW_CLUB_LEVEL: 'ליגה מתחת לרמת המועדון',
  OFFENSE_SQUAD_TASK: 'משימת סגל התקפית',
  DEFENSE_SQUAD_TASK: 'משימת סגל הגנתית',
}

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
          {`${SPOTLIGHT_LABELS[item.type] || item.type} · ${item.birthYear}`}
        </Box>
      ))}
    </Box>
  )
}
