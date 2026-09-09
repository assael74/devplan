import * as React from 'react'
import {
  Alert,
  Button,
  Chip,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy'

import {
  canRepairTeamDataIssue,
  getTeamDataRepairLabel,
} from '../../../../services/dataRepair/team/index.js'
import { buildTeamDataRepairIssues } from '../../../../services/dataRepair/team/teamDataRepair.diagnosis.js'
import RegularModal from '../RegularModal.js'
import { teamDataRepairModalSx as sx } from './sx/teamDataRepairModal.sx.js'

const severityLabel = severity => severity === 'danger' ? 'לתיקון' : 'לבדיקה'

export default function TeamDataRepairModal({
  open = false,
  busy = false,
  error = '',
  teamDocument = {},
  teamSeasons = [],
  teamSearchIndexes = [],
  indexesLoaded = false,
  leagueDocument = {},
  selectedLeagueSeason = null,
  onRepair,
  onClose,
}) {
  const issues = React.useMemo(() => buildTeamDataRepairIssues({
    teamDocument,
    teamSeasons,
    teamSearchIndexes,
    indexesLoaded,
    leagueDocument,
  }), [
    indexesLoaded,
    leagueDocument,
    teamDocument,
    teamSeasons,
    teamSearchIndexes,
  ])

  const repairContext = React.useMemo(() => ({
    teamDocument,
    teamSeasons,
    teamSearchIndexes,
    leagueDocument,
    selectedLeagueSeason,
  }), [
    leagueDocument,
    selectedLeagueSeason,
    teamDocument,
    teamSeasons,
    teamSearchIndexes,
  ])

  return (
    <RegularModal
      open={open}
      size='md'
      busy={busy}
      persistent={busy}
      hideFooter
      title='תיקוני דאטה לקבוצה'
      description='המערכת בודקת את מסמך הקבוצה, העונות והאינדקסים שלה.'
      iconId='search'
      onClose={onClose}
    >
      <Stack spacing={1.25}>
        {error ? <Alert color='danger' variant='soft'>{error}</Alert> : null}
        {busy ? <Typography level='body-sm'>בודק את נתוני הקבוצה...</Typography> : null}
        {!busy && !issues.length ? (
          <Alert color='success' variant='soft'>לא נמצאו תקלות בנתונים שנטענו.</Alert>
        ) : null}
        {!busy ? issues.map((issue, index) => (
          <Sheet
            key={`${issue.title}-${index}`}
            variant='outlined'
            sx={sx.issueSheet}
          >
            <Stack spacing={0.45}>
              <Stack direction='row' spacing={0.75} alignItems='center'>
                <Chip size='sm' color={issue.severity} variant='soft'>
                  {severityLabel(issue.severity)}
                </Chip>
                <Typography level='title-sm'>{issue.title}</Typography>
              </Stack>
              <Typography level='body-sm'>{issue.description}</Typography>
              <Typography level='body-xs' sx={sx.issueTitle}>
                מה צריך לעשות: {issue.action}
              </Typography>
              {canRepairTeamDataIssue({ issue, context: repairContext }) ? (
                <Button
                  size='sm'
                  color='warning'
                  variant='solid'
                  loading={busy}
                  disabled={busy}
                  sx={sx.actionButton}
                  onClick={() => onRepair?.(issue)}
                >
                  {getTeamDataRepairLabel(issue)}
                </Button>
              ) : null}
            </Stack>
          </Sheet>
        )) : null}
      </Stack>
    </RegularModal>
  )
}
