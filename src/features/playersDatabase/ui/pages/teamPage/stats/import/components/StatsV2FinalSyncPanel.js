// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsV2FinalSyncPanel.js

import * as React from 'react'
import { Box, Button, Chip, Stack, Typography } from '@mui/joy'

const LABELS = {
  canonical: 'שמירת נתוני הקבוצה',
  counterparts: 'סנכרון תנועות מול קבוצות אחרות',
  playerDocuments: 'סנכרון מסמכי שחקנים',
  playerIndexes: 'סנכרון אינדקסי שחקנים',
  teamLeague: 'סנכרון קבוצה וליגה',
  clubs: 'סנכרון מועדונים',
}

export default function StatsV2FinalSyncPanel({ controller }) {
  return (
    <Stack spacing={1.25}>
      <Typography level='title-lg'>סנכרון סופי</Typography>
      <Typography level='body-sm'>כל שלב מופעל ידנית. במקרה של כשל התהליך נעצר ומציג את השגיאה.</Typography>
      {controller.stages.map((stage, index) => {
        const state = controller.results[stage] || { status: 'pending' }
        const previousCompleted = index === 0 || controller.results[controller.stages[index - 1]]?.status === 'completed'
        const disabled = Boolean(controller.runningStage) || !previousCompleted || state.status === 'completed' || state.status === 'failed'
        return (
          <Box key={stage} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Chip size='sm' variant='soft' color={state.status === 'completed' ? 'success' : state.status === 'failed' ? 'danger' : 'neutral'}>
                {state.status === 'completed' ? 'הושלם' : state.status === 'failed' ? 'נכשל' : 'ממתין'}
              </Chip>
              <Typography level='body-sm'>{LABELS[stage] || stage}</Typography>
            </Stack>
            <Button size='sm' disabled={disabled} loading={controller.runningStage === stage} onClick={() => controller.runStage(stage)}>
              הפעל שלב
            </Button>
            {state.error?.message ? <Typography level='body-xs' color='danger'>{state.error.message}</Typography> : null}
          </Box>
        )
      })}
    </Stack>
  )
}
