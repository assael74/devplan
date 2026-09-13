import * as React from 'react'
import { Button, Sheet, Stack, Typography } from '@mui/joy'

import { buildLeagueDataRepairIssues } from '../../../../services/dataRepair/leagueDataRepair.diagnosis.js'
import RegularModal from '../RegularModal.js'
import { leagueDataRepairModalSx as sx } from './sx/leagueDataRepairModal.sx.js'

export default function LeagueDataRepairModal({
  open = false,
  busy = false,
  error = '',
  auditFinding = null,
  leagueDocument = {},
  leaguesMaster = {},
  seasonKey = '',
  onOpenLeagueLoad,
  onSyncLeaguesMaster,
  onSyncClubProjections,
  onClose,
}) {
  const issues = React.useMemo(() => buildLeagueDataRepairIssues({
    leagueDocument,
    leaguesMaster,
    seasonKey,
  }), [leagueDocument, leaguesMaster, seasonKey])
  const selectedSeason = React.useMemo(() => {
    const current = leagueDocument?.current
    if (String(current?.seasonKey || current?.seasonId || '') === String(seasonKey || '')) return current
    return (Array.isArray(leagueDocument?.history) ? leagueDocument.history : [])
      .find(season => String(season?.seasonKey || season?.seasonId || '') === String(seasonKey || '')) || null
  }, [leagueDocument, seasonKey])
  const hasLeagueTable = Array.isArray(selectedSeason?.tableRank) && selectedSeason.tableRank.length > 0

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
        {auditFinding ? <Sheet variant='soft' color='warning' sx={sx.issueSheet}>
          <Stack spacing={0.45}>
            <Typography level='title-sm'>תקלה שאומתה באודיט: {auditFinding.title || auditFinding.id}</Typography>
            {auditFinding.explanation ? <Typography level='body-sm'>{auditFinding.explanation}</Typography> : null}
            <Typography level='body-xs'>מסמך: {auditFinding.documentId || 'לא ידוע'}{auditFinding.seasonKey ? ` · עונה: ${auditFinding.seasonKey}` : ''}</Typography>
          </Stack>
        </Sheet> : null}
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
        <Sheet variant='outlined' sx={sx.issueSheet}>
          <Stack spacing={0.75}>
            <Typography level='title-sm'>סנכרון קבוצות הליגה למועדונים</Typography>
            <Typography level='body-sm'>מעדכן רק את מסמכי המועדון ואת Clubs Master מתוך טבלת הליגה הקנונית של העונה הנבחרת. קבוצות ללא Team Season נכללות גם הן.</Typography>
            <Button size='sm' color='warning' variant='solid' disabled={busy || !hasLeagueTable} sx={sx.actionButton} onClick={onSyncClubProjections}>
              סנכרן את קבוצות הליגה למועדונים
            </Button>
            {!hasLeagueTable ? <Typography level='body-xs'>אין טבלת ליגה זמינה בעונה הנבחרת.</Typography> : null}
          </Stack>
        </Sheet>
      </Stack>
    </RegularModal>
  )
}
