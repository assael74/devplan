import * as React from 'react'
import { Alert, Button, Chip, Sheet, Stack, Typography } from '@mui/joy'

import {
  canRepairPlayerDataIssue,
  getPlayerDataRepairLabel,
  PLAYER_DATA_ISSUE_CODE,
} from '../../../../services/dataRepair/player/index.js'
import { buildPlayerDataRepairIssues } from '../../../../services/dataRepair/player/playerDataRepair.diagnosis.js'
import RegularModal from '../RegularModal.js'
import { playerDataRepairModalSx as sx } from './sx/playerDataRepairModal.sx.js'

export default function PlayerDataRepairModal({
  open = false,
  busy = false,
  error = '',
  contexts = [],
  auditFinding = null,
  onClose,
  onRepair,
  onTeamOpen,
}) {
  const issues = React.useMemo(() => buildPlayerDataRepairIssues({ contexts }), [contexts])

  return (
    <RegularModal
      open={open}
      size='sm'
      busy={busy}
      persistent={busy}
      hideFooter
      title='תיקוני דאטה לשחקן'
      description='הבדיקה טוענת את כל מופעי הקבוצה של השחקן ומשווה כל עונה בנפרד.'
      iconId='search'
      onClose={onClose}
    >
      <Stack spacing={1.25}>
        {error ? <Alert color='danger' variant='soft'>{error}</Alert> : null}
        {auditFinding ? <Alert color='warning' variant='soft'>
          <Typography level='title-sm'>תקלה שאומתה באודיט: {auditFinding.title || auditFinding.id}</Typography>
          {auditFinding.explanation ? <Typography level='body-sm'>{auditFinding.explanation}</Typography> : null}
          <Typography level='body-xs'>מסמך: {auditFinding.documentId || 'לא ידוע'}{auditFinding.seasonKey ? ` · עונה: ${auditFinding.seasonKey}` : ''}</Typography>
        </Alert> : null}
        {!busy && !issues.length ? (
          <Alert color='success' variant='soft'>לא נמצאו תקלות בנתונים שנבדקו.</Alert>
        ) : null}
        {issues.map((issue, index) => (
          <Sheet key={`${issue.title}-${index}`} variant='outlined' sx={sx.issueSheet}>
            <Stack spacing={0.45}>
              <Stack direction='row' spacing={0.75} alignItems='center'>
                <Chip size='sm' color={issue.severity} variant='soft'>
                  {issue.severity === 'danger' ? 'לתיקון' : 'לבדיקה'}
                </Chip>
                <Typography level='title-sm'>{issue.title}</Typography>
              </Stack>
              {issue.contextLabel ? <Typography level='body-xs'>{issue.contextLabel}</Typography> : null}
              <Typography level='body-sm'>{issue.description}</Typography>
              <Typography level='body-xs' sx={sx.actionLabel}>מה צריך לעשות: {issue.action}</Typography>
              {issue.code === PLAYER_DATA_ISSUE_CODE.TEAM_SEASON_SCOUT_PROFILE_MISMATCH ? (
                <Button
                  size='sm'
                  color='warning'
                  variant='solid'
                  disabled={busy}
                  sx={sx.actionButton}
                  onClick={() => onTeamOpen?.(issue.context)}
                >
                  מעבר לעמוד קבוצה
                </Button>
              ) : canRepairPlayerDataIssue({ issue, context: issue.context }) ? (
                <Button
                  size='sm'
                  color='warning'
                  variant='solid'
                  loading={busy}
                  disabled={busy}
                  sx={sx.actionButton}
                  onClick={() => onRepair?.(issue, issue.context)}
                >
                  {getPlayerDataRepairLabel(issue)}
                </Button>
              ) : null}
            </Stack>
          </Sheet>
        ))}
      </Stack>
    </RegularModal>
  )
}
