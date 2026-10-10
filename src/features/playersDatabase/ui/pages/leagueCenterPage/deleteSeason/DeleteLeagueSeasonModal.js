// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/DeleteLeagueSeasonModal.js

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/joy'
import SteppedModal from '../../../components/modals/SteppedModal.js'
import {
  DELETE_MODAL_STEPS,
  DeleteModalSummary,
  resolveDeleteModalStep,
  normalizeDeleteModalMessage,
} from '../../../components/modals/DeleteModalPresentation.js'
import SyncStatusHeader from '../../../components/sync/SyncStatusHeader.js'
import { deleteSeasonSx as sx } from './deleteSeason.sx.js'

export default function DeleteLeagueSeasonModal({ flow }) {
  const locked = flow.status === 'writing'
  const impact = flow.proposal && flow.proposal.impact ? flow.proposal.impact : null
  const receiptId = flow.receiptId || ''

  return (
    <SteppedModal
      open={Boolean(flow.selected)}
      activeStep={resolveDeleteModalStep(flow.status)}
      steps={DELETE_MODAL_STEPS}
      compactStepper
      onClose={flow.close}
      persistent={locked}
      busy={locked}
      title='מחיקת עונת ליגה'
      description={`${flow.selected?.leagueName || 'ליגה'} · עונה ${flow.selected?.seasonKey || '—'}`}
      iconId='delete'
      appearance='destructive'
      size='xl'
      footerContent={(
        <Box sx={sx.actions}>
          {flow.status === 'preview' ? <Button color='danger' onClick={flow.approve}>אישור מחיקה</Button> : null}
          {flow.status === 'failed' ? <Button color='danger' onClick={flow.retry}>נסה שוב</Button> : null}
          <Button disabled={locked} variant='plain' color='neutral' onClick={flow.close}>
            {flow.status === 'preview' ? 'ביטול' : 'סגירה'}
          </Button>
        </Box>
      )}
    >
      <Box sx={sx.body}>
        {flow.status === 'preview' ? (
          <>
            <Typography level='body-sm'>הפעולה תסיר את העונה דרך API אחד שמבצע גם projections, Receipt ו־Audit.</Typography>
            {impact ? <DeleteModalSummary items={[
              { label: 'קבוצות בעונה', value: impact.teams },
            ]} /> : null}
          </>
        ) : null}

        {flow.status === 'writing' ? (
          <Box sx={sx.loading}>
            <CircularProgress size='sm' />
            <Box sx={sx.statusContent}>
              <SyncStatusHeader
                title='מבצע את הפעולה המאושרת…'
                receiptId={receiptId}
              />
            </Box>
          </Box>
        ) : null}
        {flow.message ? (
          <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>
            <SyncStatusHeader
              title={normalizeDeleteModalMessage(flow.message)}
              receiptId={receiptId}
            />
          </Alert>
        ) : null}

      </Box>
    </SteppedModal>
  )
}
