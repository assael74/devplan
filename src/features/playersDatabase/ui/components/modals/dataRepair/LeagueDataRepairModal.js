import * as React from 'react'
import { Button, Sheet, Stack, Typography } from '@mui/joy'

import { buildLeagueDataRepairIssues } from '../../../../services/dataRepair/leagueDataRepair.diagnosis.js'
import RegularModal from '../RegularModal.js'
import { leagueDataRepairModalSx as sx } from './sx/leagueDataRepairModal.sx.js'

export default function LeagueDataRepairModal({
  open = false,
  busy = false,
  error = '',
  leagueDocument = {},
  leaguesMaster = {},
  seasonKey = '',
  onOpenLeagueLoad,
  onSyncLeaguesMaster,
  onClose,
}) {
  const issues = React.useMemo(() => buildLeagueDataRepairIssues({
    leagueDocument,
    leaguesMaster,
    seasonKey,
  }), [leagueDocument, leaguesMaster, seasonKey])

  return (
    <RegularModal
      open={open}
      title='תיקוני דאטה לליגה'
      description='הבדיקה טוענת מחדש את מסמך הליגה ואת מאסטר הליגות, ומשווה ביניהם לצד בדיקת current ו-history.'
      hideFooter
      busy={busy}
      persistent={busy}
      onClose={onClose}
    >
      <Stack spacing={1.25}>
        {error ? <Typography level='body-sm' color='danger'>{error}</Typography> : null}
        {issues.length ? issues.map(issue => (
          <Sheet key={issue.title} variant='outlined' sx={sx.issueSheet}>
            <Stack spacing={0.75}>
              <Typography level='title-sm'>{issue.title}</Typography>
              <Typography level='body-sm'>{issue.description}</Typography>
              {issue.action === 'master' ? (
                <Button
                  size='sm'
                  color='warning'
                  variant='solid'
                  disabled={busy}
                  sx={sx.actionButton}
                  onClick={onSyncLeaguesMaster}
                >
                  סנכרון מאסטר הליגות
                </Button>
              ) : (
                <Button
                  size='sm'
                  color='warning'
                  variant='solid'
                  disabled={busy}
                  sx={sx.actionButton}
                  onClick={onOpenLeagueLoad}
                >
                  פתח טעינת נתוני ליגה
                </Button>
              )}
            </Stack>
          </Sheet>
        )) : (
          <Typography level='body-sm'>לא נמצאה בעיית מחזור חיים בעונת הליגה הנבחרת.</Typography>
        )}
      </Stack>
    </RegularModal>
  )
}
