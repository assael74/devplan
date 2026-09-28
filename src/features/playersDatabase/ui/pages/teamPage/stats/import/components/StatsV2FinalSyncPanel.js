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
  audit: 'בדיקת סנכרון כוללת וסגירת קבלה',
}

export default function StatsV2FinalSyncPanel({ controller }) {
  const auditRowRef = React.useRef(null)
  const clubsCompleted = controller.results?.clubs?.status === 'completed'

  React.useEffect(() => {
    if (!clubsCompleted) return

    auditRowRef.current?.scrollIntoView?.({
      block: 'nearest',
    })
  }, [clubsCompleted, controller.receiptClosed])

  return (
    <Stack
      spacing={1.25}
      sx={{
        minHeight: 0,
        height: '100%',
      }}
    >
      <Typography level='title-lg'>סנכרון סופי</Typography>
      <Typography level='body-sm'>כל שלב מופעל ידנית. במקרה של כשל התהליך נעצר ומציג את השגיאה.</Typography>
      <Stack
        className='dpScrollThin'
        spacing={1.25}
        sx={{
          minHeight: 0,
          overflowY: 'auto',
          pr: 0.5,
          pb: 0.5,
        }}
      >
        {controller.stages.map((stage, index) => {
          const state = controller.results[stage] || { status: 'pending' }
          const previousCompleted = index === 0 || controller.results[controller.stages[index - 1]]?.status === 'completed'
          const prerequisitesCompleted = stage === 'audit'
            ? controller.stages
                .slice(0, index)
                .every(item => controller.results[item]?.status === 'completed')
            : previousCompleted
          const auditNeedsRetry = (
            stage === 'audit' &&
            ['completed', 'needs_sync'].includes(state.status) &&
            controller.receiptClosed !== true
          )
          const writerNeedsRetry = (
            stage !== 'audit' &&
            state.status === 'needs_sync'
          )
          const disabled = (
            Boolean(controller.runningStage) ||
            !prerequisitesCompleted ||
            (state.status === 'completed' && !auditNeedsRetry) ||
            state.status === 'failed'
          )
          const chipColor = state.status === 'completed'
            ? 'success'
            : state.status === 'failed'
              ? 'danger'
              : state.status === 'needs_sync'
                ? 'warning'
                : 'neutral'
          const chipLabel = state.status === 'completed'
            ? 'הושלם'
            : state.status === 'failed'
              ? 'נכשל'
              : state.status === 'needs_sync'
                ? 'נדרש סנכרון'
                : 'ממתין'

          return (
            <Box
              key={stage}
              ref={stage === 'audit' ? auditRowRef : undefined}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
            >
              <Stack direction='row' spacing={1} alignItems='center'>
                <Chip size='sm' variant='soft' color={chipColor}>
                  {chipLabel}
                </Chip>
                <Typography level='body-sm'>{LABELS[stage] || stage}</Typography>
              </Stack>
              <Button size='sm' disabled={disabled} loading={controller.runningStage === stage} onClick={() => controller.runStage(stage)}>
                {auditNeedsRetry ? 'בדוק שוב' : writerNeedsRetry ? 'סנכרן שוב' : 'הפעל שלב'}
              </Button>
              {state.error?.message ? <Typography level='body-xs' color='danger'>{state.error.message}</Typography> : null}
            </Box>
          )
        })}
      </Stack>
      {controller.receiptClosed ? (
        <Chip
          color='success'
          variant='soft'
          sx={{ alignSelf: 'flex-start' }}
        >
          הסנכרון תקין · הקבלה נסגרה
        </Chip>
      ) : controller.auditResult ? (
        <Chip
          color='warning'
          variant='soft'
          sx={{ alignSelf: 'flex-start' }}
        >
          הבדיקה עדיין לא נקייה · יש לבדוק שוב
        </Chip>
      ) : null}
    </Stack>
  )
}
