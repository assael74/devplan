import React from 'react'
import { Alert, Box } from '@mui/joy'

import PlayersListContent from './playersList/PlayersListContent.js'
import TeamsListContent from './teamsList/TeamsListContent.js'

export default function ReportRoot({
  model = null,
  presentation = 'url',
  device = 'desktop',
}) {
  if (!model) {
    return <Alert color='warning'>לא התקבל מודל דוח להצגה.</Alert>
  }

  if (model.entityType === 'teamsList') {
    return <TeamsListContent model={model} presentation={presentation} device={device} />
  }

  if (model.entityType === 'playersList') {
    return <PlayersListContent model={model} presentation={presentation} device={device} />
  }

  return (
    <Box>
      <Alert color='warning'>סוג הרשימה אינו נתמך בתצוגת dbSearch.</Alert>
    </Box>
  )
}
