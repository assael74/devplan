import { Box, Typography } from '@mui/joy'

import { clubPageSx as sx } from '../sx/clubPage.sx.js'

export default function ClubDevelopment({ model }) {
  return (
    <Box sx={sx.sections}>
      {model.map(cohort => (
        <Box key={cohort.birthYear}>
          <Typography level='title-sm'>
            {`שנתון ${cohort.birthYear}`}
          </Typography>

          {cohort.teams.map(team => (
            <Box
              key={`${team.seasonKey}-${team.teamId}`}
              sx={sx.developmentRow}
            >
              {`${team.seasonKey} · רמה ${team.leagueLevelLabel} · מקום ${team.tableRank || '-'}`}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}
