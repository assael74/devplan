// src/features/playersDatabase/ui/pages/leaguePage/clear/ClearLeagueTeamsModal.js

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/joy'
import SteppedModal from '../../../components/modals/SteppedModal.js'
import {
  DELETE_MODAL_STEPS,
  DeleteModalSummary,
  resolveDeleteModalStep,
  normalizeDeleteModalMessage,
} from '../../../components/modals/DeleteModalPresentation.js'
import SyncStageCards from '../../../components/sync/SyncStageCards.js'
import SyncStatusHeader from '../../../components/sync/SyncStatusHeader.js'
import { clearLeagueTeamsSx as sx } from './clearLeagueTeams.sx.js'

export default function ClearLeagueTeamsModal({ flow, leagueName, seasonKey }) {
  const locked = flow.status === 'writing'
  const impact = flow.proposal && flow.proposal.impact ? flow.proposal.impact : null
  const receiptId = flow.receiptId || flow.executionReceipt?.id || ''

  return (
    <SteppedModal
      open={flow.open}
      activeStep={resolveDeleteModalStep(flow.status)}
      steps={DELETE_MODAL_STEPS}
      compactStepper
      onClose={flow.close}
      title='מחיקת קבוצות העונה'
      description={`${leagueName || 'ליגה'} · עונה ${seasonKey || '—'}`}
      iconId='delete'
      appearance='destructive'
      persistent={locked}
      busy={locked}
      size='xl'
      footerContent={(
        <Box sx={sx.actions}>
          {flow.status === 'preview' ? <Button color='danger' onClick={flow.approve}>אישור מחיקה</Button> : null}
          {flow.status === 'failed' ? (
            <Button color='danger' onClick={flow.retry}>
              {flow.retryMode === 'repair' ? 'תקן תוצרים' : 'נסה שוב'}
            </Button>
          ) : null}
          <Button disabled={locked} variant='plain' color='neutral' onClick={flow.close}>
            {flow.status === 'preview' ? 'ביטול' : 'סגירה'}
          </Button>
        </Box>
      )}
    >
      <Box sx={sx.body}>
        {flow.status === 'preview' ? (
          <>
            <Typography level='body-sm'>הפעולה תנקה את קבוצות העונה ותפעיל את הכתיבה, ההקרנות וה־Audit דרך API אחד.</Typography>
            {impact ? <DeleteModalSummary items={[
              { label: 'קבוצות בעונה', value: impact.teams },
            ]} /> : null}
          </>
        ) : null}

        {flow.status !== 'preview' ? (
          <Box sx={sx.stages}>
            <Typography level='title-md'>סדר עדכון המסמכים</Typography>
            <SyncStageCards stages={flow.syncStages} />
            {flow.status === 'writing' ? (
              <Alert color='primary' variant='soft'>
                <Box sx={sx.loading}>
                  <CircularProgress size='sm' />
                  <SyncStatusHeader
                    title='מחיקת קבוצות העונה והסנכרון מתבצעים'
                    receiptId={receiptId}
                  />
                </Box>
              </Alert>
            ) : null}
            {['failed', 'succeeded'].includes(flow.status) ? (
              <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>
                <Box>
                  <SyncStatusHeader
                    title={normalizeDeleteModalMessage(flow.message) || (
                      flow.status === 'succeeded'
                        ? 'מחיקת קבוצות העונה והסנכרון הושלמו'
                        : 'מחיקת קבוצות העונה לא הושלמה'
                    )}
                    receiptId={receiptId}
                  />
                  {flow.status === 'failed' ? (
                    <Typography level='body-xs' sx={{ mt: 0.5 }}>
                      {flow.retryMode === 'repair'
                        ? 'מקור האמת כבר אושר. הפעולה הבאה תתקן רק את התוצרים באותה קבלה.'
                        : 'מקור האמת לא אושר. ניסיון חוזר ישתמש באותה פעולה ובאותה קבלה.'}
                    </Typography>
                  ) : null}
                </Box>
              </Alert>
            ) : null}
          </Box>
        ) : null}

      </Box>
    </SteppedModal>
  )
}
