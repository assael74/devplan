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
} from '../../../components/modals/DeleteModalPresentation.js'
import { CLEAR_LEAGUE_STEPS } from '../../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js'
import { clearLeagueTeamsSx as sx } from './clearLeagueTeams.sx.js'

const STEP_LABELS = {
  team: 'נתוני עונת הקבוצות',
  teamIndex: 'אינדקסי הקבוצות',
  identity: 'שיוך הקבוצות למועדונים',
  league: 'נתוני הליגה',
  club: 'נתוני המועדונים',
  clubsMaster: 'מרכז המועדונים',
  leaguesMaster: 'מרכז הליגות',
}

export default function ClearLeagueTeamsModal({ flow, seasonKey }) {
  const locked = ['preparing', 'writing', 'steps'].includes(flow.status)
  const impact = flow.proposal?.impact
  const step = CLEAR_LEAGUE_STEPS[flow.stepIndex]
  const activeStep = resolveDeleteModalStep(flow.status)
  const identity = flow.proposal?.identity || {}

  return (
    <RegularModal
      open={flow.open}
      onClose={flow.close}
      title='מחיקת קבוצות העונה'
      iconId='delete'
      appearance='destructive'
      persistent={locked}
      busy={locked}
      hideFooter
      contentSx={sx.content}
    >
      <Box sx={sx.body}>
        <Typography level='title-md'>עונה {seasonKey}</Typography>
        <ModalStepper steps={DELETE_MODAL_STEPS} activeStep={activeStep} compact />

        {flow.status === 'preparing' ? (
          <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>בודק את נתוני העונה ומכין את פרטי המחיקה…</Typography></Box>
        ) : null}

        {flow.status === 'preview' && impact ? (
          <>
            <Typography level='body-sm'>הפעולה תסיר את הקבוצות מהעונה ותעדכן את הנתונים הקשורים אליהן.</Typography>
            <DeleteModalSummary items={[
              { label: 'קבוצות בעונה', value: impact.teams },
              { label: 'נתוני עונת קבוצה', value: impact.teamSeasons },
              { label: 'אינדקסי קבוצות', value: impact.teamIndexes },
              { label: 'מועדונים לעדכון', value: impact.clubs },
            ]} />
            <DeleteModalPreserved>עונת הליגה, הגדרות הליגה, זהות הליגה ועונות אחרות.</DeleteModalPreserved>
          </>
        ) : null}

        {flow.proposal ? (
          <DeleteModalDetails>
            {CLEAR_LEAGUE_STEPS.map(item => {
              const count = flow.counts[item.id] || { written: 0, skipped: 0, failed: 0 }
              const total = flow.proposal.operations.filter(operation => operation.kind === item.id).length
              return <DeleteModalProgressRow key={item.id} label={STEP_LABELS[item.id] || item.label} total={total} {...count} />
            })}
            <DeleteModalIds>
              {identity.leagueId ? <Typography level='body-xs'>מזהה ליגה: {identity.leagueId}</Typography> : null}
              {identity.seasonKey ? <Typography level='body-xs'>מזהה עונה: {identity.seasonKey}</Typography> : null}
              {(flow.proposal.operations || []).map((operation, index) => operation.docId ? (
                <Typography key={`${operation.kind}-${operation.docId}-${index}`} level='body-xs'>מזהה יעד: {operation.docId}</Typography>
              ) : null)}
            </DeleteModalIds>
          </DeleteModalDetails>
        ) : null}

        {flow.status === 'writing' ? <Box sx={sx.loading}><CircularProgress size='sm' /><Typography>מבצע את השלב שאושר…</Typography></Box> : null}
        {flow.status === 'steps' ? (
          <Alert color='primary' variant='soft'>השלב הבא: {step ? STEP_LABELS[step.id] || step.label : 'בדיקת סנכרון וסיום'}</Alert>
        ) : null}
        {flow.message ? <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>{flow.message}</Alert> : null}

        <Box sx={sx.actions}>
          {flow.status === 'preview' ? <Button color='danger' onClick={flow.approve}>אישור מחיקה</Button> : null}
          {flow.status === 'steps' ? <Button onClick={flow.next}>{step ? `ביצוע: ${STEP_LABELS[step.id] || step.label}` : 'בדיקת סנכרון וסיום'}</Button> : null}
          {flow.status === 'failed' ? <Button color='danger' onClick={flow.retry}>הכנה מחדש</Button> : null}
          <Button variant='plain' color='neutral' disabled={locked} onClick={flow.close}>{flow.status === 'preview' ? 'ביטול' : 'סגירה'}</Button>
        </Box>
      </Box>
    </RegularModal>
  )
}
