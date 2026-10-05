// src/features/playersDatabase/ui/pages/leaguePage/clear/ClearLeagueTeamsModal.js

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
import { clearLeagueTeamsSx as sx } from './clearLeagueTeams.sx.js'

export default function ClearLeagueTeamsModal({ flow, seasonKey }) {
  const locked = flow.status === 'writing'
  const impact = flow.proposal && flow.proposal.impact ? flow.proposal.impact : null
  const identity = flow.proposal && flow.proposal.identity ? flow.proposal.identity : {}

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
        <ModalStepper steps={DELETE_MODAL_STEPS} activeStep={resolveDeleteModalStep(flow.status)} compact />

        {flow.status === 'preview' ? (
          <>
            <Typography level='body-sm'>הפעולה תנקה את קבוצות העונה ותפעיל את הכתיבה, ההקרנות וה־Audit דרך API אחד.</Typography>
            {impact ? <DeleteModalSummary items={[
              { label: 'קבוצות בעונה', value: impact.teams },
            ]} /> : null}
            <DeleteModalPreserved>עונת הליגה והגדרותיה נשמרות. Team Seasons קיימים נשמרים ורק competitionSnapshot מנוקה.</DeleteModalPreserved>
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
        {flow.status !== 'preview' ? (
          <Box sx={sx.stages}>
            {flow.syncStages.map(stage => (
              <Box key={stage.id} sx={sx.stage}>
                <Box>
                  <Typography level='body-sm'>{stage.title}</Typography>
                  <Typography level='body-xs' textColor='text.tertiary'>{stage.target}</Typography>
                </Box>
                <Typography
                  level='body-xs'
                  color={stage.state === 'completed'
                    ? 'success'
                    : stage.state === 'failed'
                      ? 'danger'
                      : stage.state === 'running'
                        ? 'primary'
                        : 'neutral'}
                >
                  {stage.state === 'completed'
                    ? 'הושלם'
                    : stage.state === 'failed'
                      ? 'נכשל'
                      : stage.state === 'running'
                        ? 'בתהליך'
                        : 'ממתין'}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : null}
        {flow.message ? (
          <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'} variant='soft'>
            <Box>
              <Typography level='body-sm'>{normalizeDeleteModalMessage(flow.message)}</Typography>
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
      </Box>
    </RegularModal>
  )
}
