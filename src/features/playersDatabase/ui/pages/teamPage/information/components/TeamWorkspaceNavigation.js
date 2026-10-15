// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamWorkspaceNavigation.js

import { Box, Button, Typography } from '@mui/joy'
import { Link } from 'react-router-dom'

import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'
import { getTeamInsight } from '../model/teamWorkspace.navigation.js'

export default function TeamWorkspaceNavigation({ workspace, toOverview, toInsight }) {
  if (workspace.mode !== 'roster') return null

  const source = getTeamInsight(workspace.sourceInsightId)
  return (
    <Box component='nav' aria-label='ניווט בעמוד הקבוצה' sx={sx.workspaceHeader}>
      <Button
        component={Link}
        to={source ? toInsight(source.id) : toOverview}
        variant='plain'
        size='sm'
        sx={sx.workspaceBack}
      >
        {source ? `חזרה אל ${source.title}` : 'חזרה לתמונת מצב'}
      </Button>
      <Typography level='title-sm'>סגל ומועמדים</Typography>
    </Box>
  )
}
