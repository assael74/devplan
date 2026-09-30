import { Alert, Box, Button, CircularProgress, Typography } from '@mui/joy'
import RegularModal from '../../../components/modals/RegularModal.js'
import ModalStepper from '../../../components/modals/ModalStepper.js'
import {
  DELETE_MODAL_STEPS,
  DeleteModalDetails,
  DeleteModalIds,
  DeleteModalPreserved,
  DeleteModalProgressRow,
  DeleteModalSummary,
  resolveDeleteModalStep,
  normalizeDeleteModalMessage,
} from '../../../components/modals/DeleteModalPresentation.js'
import { DELETE_SEASON_STEPS } from './useDeleteLeagueSeason.js'
import { deleteSeasonSx as sx } from './deleteSeason.sx.js'

const STEP_LABELS = {
  league: 'נתוני הליגה',
  leaguesMaster: 'מרכז הליגות',
  audit: 'בדיקת סנכרון',
}

export default function DeleteLeagueSeasonModal({ flow }) {
  const locked = ['preparing', 'writing', 'steps'].includes(flow.status)
  const impact = flow.proposal?.impact
  const step = DELETE_SEASON_STEPS[flow.stepIndex]
  const identity = flow.proposal?.identity || {}

  return (
    <RegularModal open={Boolean(flow.selected)} onClose={flow.close} persistent={locked} busy={locked} hideFooter title='מחיקת עונת ליגה' iconId='delete' appearance='destructive' contentSx={sx.content}>
      <Box sx={sx.body}>
        <Typography level='title-md'>{flow.selected?.leagueName} · {flow.selected?.seasonKey}</Typography>
        <ModalStepper steps={DELETE_MODAL_STEPS} activeStep={resolveDeleteModalStep(flow.status)} compact />

        {flow.status === 'preparing' ? <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>בודק את נתוני העונה ומכין את פרטי המחיקה…</Typography></Box> : null}

        {flow.status === 'preview' ? (
          <>
            <Typography level='body-sm'>הפעולה תסיר את העונה מהליגה וממרכז הליגות.</Typography>
            {impact ? <DeleteModalSummary items={[
              { label: 'עדכון נתוני הליגה', value: impact.leagueWrites ? 'נדרש' : 'לא נדרש' },
              { label: 'עדכון מרכז הליגות', value: impact.masterWrites ? 'נדרש' : 'לא נדרש' },
            ]} /> : null}
            <DeleteModalPreserved>זהות הליגה ועונות אחרות. הפעולה אינה מוחקת קבוצות או שחקנים.</DeleteModalPreserved>
            {flow.proposal?.retryState === 'season_absent_master_stale' ? <Alert color='warning' variant='soft'>העונה כבר הוסרה. נותר להשלים את עדכון מרכז הליגות.</Alert> : null}
            {flow.proposal?.retryState === 'season_absent_clean' ? <Alert color='success' variant='soft'>העונה כבר הוסרה והנתונים תואמים. נותר לבצע בדיקת סנכרון ולסיים.</Alert> : null}
          </>
        ) : null}

        {flow.proposal ? (
          <DeleteModalDetails>
            {DELETE_SEASON_STEPS.filter(item => item.id !== 'audit').map(item => <DeleteModalProgressRow key={item.id} label={STEP_LABELS[item.id] || item.label} {...(flow.counts[item.id] || {})} />)}
            <DeleteModalIds>
              {(identity.leagueId || flow.selected?.leagueId) ? <Typography level='body-xs'>מזהה ליגה: {identity.leagueId || flow.selected?.leagueId}</Typography> : null}
              {(identity.seasonKey || flow.selected?.seasonKey) ? <Typography level='body-xs'>מזהה עונה: {identity.seasonKey || flow.selected?.seasonKey}</Typography> : null}
            </DeleteModalIds>
          </DeleteModalDetails>
        ) : null}

        {flow.status === 'writing' ? <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>מבצע את השלב שאושר…</Typography></Box> : null}
        {flow.status === 'steps' ? <Alert color='primary' variant='soft'>השלב הבא: {STEP_LABELS[step?.id] || step?.label || 'בדיקת סנכרון וסיום'}</Alert> : null}
        {flow.message ? <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>{normalizeDeleteModalMessage(flow.message)}</Alert> : null}

        <Box sx={sx.actions}>
          {flow.status === 'preview' ? <Button color='danger' onClick={flow.approve}>אישור מחיקה</Button> : null}
          {flow.status === 'steps' ? <Button onClick={flow.next}>ביצוע: {STEP_LABELS[step?.id] || step?.label}</Button> : null}
          {flow.status === 'failed' ? <Button color='danger' onClick={flow.retry}>הכנה מחדש</Button> : null}
          <Button disabled={locked} variant='plain' color='neutral' onClick={flow.close}>{flow.status === 'preview' ? 'ביטול' : 'סגירה'}</Button>
        </Box>
      </Box>
    </RegularModal>
  )
}
