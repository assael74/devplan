import { Alert, Box, Button, CircularProgress, Typography } from '@mui/joy'
import RegularModal from '../../../../components/modals/RegularModal.js'
import ModalStepper from '../../../../components/modals/ModalStepper.js'
import {
  DELETE_MODAL_STEPS,
  DeleteModalDetails,
  DeleteModalIds,
  DeleteModalPreserved,
  DeleteModalProgressRow,
  DeleteModalSummary,
  resolveDeleteModalStep,
} from '../../../../components/modals/DeleteModalPresentation.js'
import { CLEAR_ROSTER_STEPS } from '../../../../../services/writeV2/roster/clear/clearRosterSession.js'
import { clearRosterSx as sx } from './clearRoster.sx.js'

const STEP_LABELS = {
  teamSeason: 'נתוני הסגל בעונה',
  playerIndex: 'אינדקסי השחקנים',
  teamSearchIndex: 'אינדקס הקבוצה',
  league: 'נתוני הליגה',
  club: 'נתוני המועדון',
  clubsMaster: 'מרכז המועדונים',
  leaguesMaster: 'מרכז הליגות',
}

export default function ClearRosterModal({ controller, seasonKey }) {
  const c = controller
  const busy = c.status === 'writing' || c.status === 'preparing'
  const locked = busy || c.status === 'steps'
  const step = CLEAR_ROSTER_STEPS[c.stepIndex]
  const impact = c.proposal?.impact
  const identity = c.proposal?.identity || {}

  return (
    <RegularModal open={c.open} onClose={c.close} title='מחיקת סגל' iconId='delete' appearance='destructive' busy={busy} persistent={locked} hideFooter contentSx={sx.content}>
      <Box sx={sx.body}>
        <Typography level='title-md'>עונה {seasonKey}</Typography>
        <ModalStepper steps={DELETE_MODAL_STEPS} activeStep={resolveDeleteModalStep(c.status)} compact />

        {c.status === 'preparing' ? <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>בודק את נתוני הסגל ומכין את פרטי המחיקה…</Typography></Box> : null}

        {c.status === 'preview' && impact ? (
          <>
            <Typography level='body-sm'>הפעולה תסיר את השחקנים מסגל העונה ותעדכן את האינדקסים והנתונים הנלווים.</Typography>
            <DeleteModalSummary items={[
              { label: 'שחקנים בסגל', value: impact.players },
              { label: 'אינדקסי שחקנים', value: impact.playerIndexes },
              { label: 'מעברים לאיפוס', value: impact.transfers || 0 },
              { label: 'מסמכי שחקנים למחיקה', value: impact.playerDocuments || 0 },
            ]} />
            <DeleteModalPreserved>עונת הקבוצה וזהותה, נתוני הטבלה, הסטטיסטיקה, איזון הסגל ועונות אחרות. קבוצות אחרות שמופיעות במעברים לא ישתנו.</DeleteModalPreserved>
          </>
        ) : null}

        {c.proposal ? (
          <DeleteModalDetails>
            {CLEAR_ROSTER_STEPS.map(item => <DeleteModalProgressRow key={item.id} label={STEP_LABELS[item.id] || item.label} {...(c.counts[item.id] || {})} />)}
            <DeleteModalIds>
              {identity.birthTeamDocumentId ? <Typography level='body-xs'>מזהה קבוצה: {identity.birthTeamDocumentId}</Typography> : null}
              {identity.seasonKey ? <Typography level='body-xs'>מזהה עונה: {identity.seasonKey}</Typography> : null}
              {identity.leagueId ? <Typography level='body-xs'>מזהה ליגה: {identity.leagueId}</Typography> : null}
              {identity.clubId ? <Typography level='body-xs'>מזהה מועדון: {identity.clubId}</Typography> : null}
            </DeleteModalIds>
          </DeleteModalDetails>
        ) : null}

        {c.status === 'writing' ? <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>מבצע את השלב שאושר…</Typography></Box> : null}
        {c.status === 'steps' ? <Alert color='primary' variant='soft'>השלב הבא: {step ? STEP_LABELS[step.id] || step.label : 'בדיקת סנכרון וסיום'}</Alert> : null}
        {c.message ? <Alert color={c.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>{c.message}</Alert> : null}

        <Box sx={sx.actions}>
          {c.status === 'preview' ? <Button color='danger' onClick={c.approve}>אישור מחיקה</Button> : null}
          {c.status === 'steps' ? <Button onClick={c.next}>{step ? `ביצוע: ${STEP_LABELS[step.id] || step.label}` : 'בדיקת סנכרון וסיום'}</Button> : null}
          {c.status === 'failed' ? <Button color='danger' onClick={c.retry}>הכנה מחדש</Button> : null}
          <Button variant='plain' color='neutral' disabled={locked} onClick={c.close}>{c.status === 'preview' ? 'ביטול' : 'סגירה'}</Button>
        </Box>
      </Box>
    </RegularModal>
  )
}
