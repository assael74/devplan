// src/features/playersDatabase/ui/pages/leaguePage/components/LeagueTeamNameLink.js

import {
  Box,
  Typography,
} from '@mui/joy'

import ExternalLinkIcon from '../../../components/modals/ExternalLinkIcon.js'
import { leagueTeamNameLinkSx as sx } from './sx/leagueTeamNameLink.sx.js'

export function LeagueTeamNameLink({
  teamName,
  teamUrl,
}) {
  return (
    <Box sx={sx.root}>
      <Typography level='body-sm' noWrap title={teamName || ''} sx={sx.name}>
        {teamName || '—'}
      </Typography>

      <ExternalLinkIcon
        href={teamUrl}
        tooltip='פתיחת עמוד הקבוצה'
        sx={sx.link}
      />
    </Box>
  )
}
