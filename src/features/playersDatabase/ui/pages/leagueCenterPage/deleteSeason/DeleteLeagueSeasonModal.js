// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/DeleteLeagueSeasonModal.js

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/joy'
import RegularModal from '../../../components/modals/RegularModal.js'
import ModalStepper from '../../../components/modals/ModalStepper.js'
import {
  DELETE_MODAL_STEPS,
  DeleteModalDetails,
  DeleteModalIds,
  DeleteModalPreserved,
  DeleteModalSummary,
  resolveDeleteModalStep,
  normalizeDeleteModalMessage,
} from '../../../components/modals/DeleteModalPresentation.js'
import { deleteSeasonSx as sx } from './deleteSeason.sx.js'

export default function DeleteLeagueSeasonModal({ flow }) {
  const locked = flow.status === 'writing'
  const impact = flow.proposal && flow.proposal.impact ? flow.proposal.impact : null
  const identity = flow.proposal && flow.proposal.identity ? flow.proposal.identity : {}

  return (
    <RegularModal
      open={Boolean(flow.selected)}
      onClose={flow.close}
      persistent={locked}
      busy={locked}
      hideFooter
      title='מחיקת עונת ליגה'
      iconId='delete'
      appearance='destructive'
      contentSx={sx.content}
    >
      <Box sx={sx.body}>
        <Typography level='title-md'>{flow.selected && flow.selected.leagueName} · {flow.selected && flow.selected.seasonKey}</Typography>
        <ModalStepper steps={DELETE_MODAL_STEPS} activeStep={resolveDeleteModalStep(flow.status)} compact />

        {flow.status === 'preview' ? (
          <>
            <Typography level='body-sm'>הפעולה תסיר את העונה דרך API אחד שמבצע גם projections, Receipt ו־Audit.</Typography>
            {impact ? <DeleteModalSummary items={[
              { label: 'קבוצות בעונה', value: impact.teams },
            ]} /> : null}
            <DeleteModalPreserved>מסמך הליגה נשמר כאשר קיימות עונות אחרות. Team Seasons קיימים אינם נמחקים ו־competitionSnapshot שלהם מנוקה.</DeleteModalPreserved>
          </>
        ) : null}

        {flow.proposal ? (
          <DeleteModalDetails>
            <DeleteModalIds>
              {identity.leagueId ? <Typography level='body-xs'>מזהה ליגה: {identity.leagueId}</Typography> : null}
              {identity.seasonId ? <Typography level='body-xs'>Season ID: {identity.seasonId}</Typography> : null}
              {identity.seasonKey ? <Typography level='body-xs'>עונה: {identity.seasonKey}</Typography> : null}
              {flow.receiptId ? <Typography level='body-xs'>Receipt: {flow.receiptId}</Typography> : null}
            </DeleteModalIds>
          </DeleteModalDetails>
        ) : null}

        {flow.status === 'writing' ? (
          <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>מבצע את הפעולה המאושרת…</Typography></Box>
        ) : null}
        {flow.message ? (
          <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>
            {normalizeDeleteModalMessage(flow.message)}
          </Alert>
        ) : null}

        <Box sx={sx.actions}>
          {flow.status === 'preview' ? <Button color='danger' onClick={flow.approve}>אישור מחיקה</Button> : null}
          {flow.status === 'failed' ? <Button color='danger' onClick={flow.retry}>נסה שוב</Button> : null}
          <Button disabled={locked} variant='plain' color='neutral' onClick={flow.close}>
            {flow.status === 'preview' ? 'ביטול' : 'סגירה'}
          </Button>
        </Box>
      </Box>
    </RegularModal>
  )
}
