// src/features/playersDatabase/ui/pages/leaguePage/components/LeagueTeamNameLink.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { leagueTeamNameLinkSx as sx } from './sx/leagueTeamNameLink.sx.js'

export function LeagueTeamNameLink({
  teamName,
  teamUrl,
}) {
  const hasTeamUrl = Boolean(String(teamUrl || '').trim())

  return (
    <Box sx={sx.root}>
      <Typography level="body-sm" noWrap title={teamName || ''} sx={sx.name}>
        {teamName || '—'}
      </Typography>

      <Typography
        level="body-sm"
        title={hasTeamUrl ? 'קיים קישור לקבוצה' : 'אין קישור לקבוצה'}
        sx={sx.urlIndicator}
      >
        {hasTeamUrl ? '✓' : '—'}
      </Typography>
    </Box>
  )
}
