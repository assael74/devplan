// src/features/playersDatabase/ui/pages/teamPage/roster/clear/ClearRosterModal.js

import { Alert, Box, Button, Card, CircularProgress, Stack, Typography } from '@mui/joy'
import SteppedModal from '../../../../components/modals/SteppedModal.js'
import {
  DELETE_MODAL_STEPS,
  DeleteModalSummary,
  resolveDeleteModalStep,
  normalizeDeleteModalMessage,
} from '../../../../components/modals/DeleteModalPresentation.js'
import SyncStageCards from '../../../../components/sync/SyncStageCards.js'
import SyncStatusHeader from '../../../../components/sync/SyncStatusHeader.js'
import { clearRosterSx as sx } from './clearRoster.sx.js'

export default function ClearRosterModal({ controller, teamName, seasonKey }) {
  const c = controller
  const busy = c.status === 'writing' || c.status === 'preparing'
  const locked = busy
  const impact = c.proposal?.impact
  const syncVisible = Boolean(c.proposal) && ['steps', 'writing', 'failed', 'succeeded'].includes(c.status)
  const receiptId = c.receiptId || c.executionReceipt?.id || ''

  return (
    <SteppedModal
      open={c.open}
      activeStep={resolveDeleteModalStep(c.status)}
      steps={DELETE_MODAL_STEPS}
      compactStepper
      onClose={c.close}
      title='מחיקת סגל'
      description={`${teamName || 'קבוצה'} · עונה ${seasonKey || '—'}`}
      iconId='delete'
      appearance='destructive'
      busy={busy}
      persistent={locked}
      size='xl'
      footerContent={(
        <Box sx={sx.actions}>
          {c.status === 'preview' ? <Button color='danger' onClick={c.approve}>עבור לסנכרון</Button> : null}
          {c.status === 'steps' ? <Button color='danger' onClick={c.next}>בצע מחיקת סגל</Button> : null}
          {c.status === 'failed' ? <Button color='danger' onClick={c.retry}>הכנה מחדש</Button> : null}
          <Button variant='plain' color='neutral' disabled={locked} onClick={c.close}>{c.status === 'preview' ? 'ביטול' : 'סגירה'}</Button>
        </Box>
      )}
    >
      <Box sx={sx.body}>
        {c.status === 'preparing' ? <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>בודק את נתוני הסגל ומכין את פרטי המחיקה…</Typography></Box> : null}

        {c.status === 'preview' && impact ? (
          <>
            <Typography level='body-sm'>הפעולה תסיר את הסגל של הקבוצה בעונה שנבחרה ותעדכן את התוצרים הנגזרים.</Typography>
            <DeleteModalSummary items={[
              { label: 'שחקנים בסגל', value: impact.players },
              { label: 'אינדקסי שחקנים', value: impact.playerIndexes },
              { label: 'מעברים לאיפוס', value: impact.transfers || 0 },
            ]} />
          </>
        ) : null}

        {syncVisible ? (
          <Box sx={sx.syncPanel}>
            <Typography level='title-md'>סדר עדכון המסמכים</Typography>
            <SyncStageCards stages={c.syncStages} />
            {c.status === 'steps' ? (
              <Alert color='primary' variant='soft'>
                נתוני המחיקה אושרו. הפעולה תתחיל רק לאחר לחיצה על „בצע מחיקת סגל”.
              </Alert>
            ) : null}
            {c.status === 'writing' ? (
              <Card variant='soft' color='primary'>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <CircularProgress size='sm' />
                  <SyncStatusHeader
                    title='מחיקת הסגל והסנכרון מתבצעים'
                    receiptId={receiptId}
                  />
                </Stack>
              </Card>
            ) : null}
            {['failed', 'succeeded'].includes(c.status) ? (
              <Alert color={c.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>
                <SyncStatusHeader
                  title={normalizeDeleteModalMessage(c.message) || (
                    c.status === 'succeeded'
                      ? 'מחיקת הסגל והסנכרון הושלמו'
                      : 'מחיקת הסגל לא הושלמה'
                  )}
                  receiptId={receiptId}
                />
              </Alert>
            ) : null}
          </Box>
        ) : null}

        {c.message && !['failed', 'succeeded'].includes(c.status) ? (
          <Alert color='danger' variant='soft'>{normalizeDeleteModalMessage(c.message)}</Alert>
        ) : null}

      </Box>
    </SteppedModal>
  )
}
