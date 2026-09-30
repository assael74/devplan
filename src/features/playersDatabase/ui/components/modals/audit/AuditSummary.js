import { Button, Sheet, Stack, Typography } from '@mui/joy'

import { playerDatabaseAuditModalSx as sx } from '../sx/playerDatabaseAuditModal.sx.js'

const number = value => Number(value || 0)

const systemSummaryLines = result => {
  const summary = result?.summary || {}

  if (result?.flowType === 'system_structural') {
    return [
      `ליגות: ${number(summary.checkedLeagues)}`,
      `קבוצות: ${number(summary.checkedTeamRoots)}`,
      `עונות קבוצה: ${number(summary.checkedTeamSeasons)}`,
      `מועדונים: ${number(summary.checkedClubs)}`,
    ]
  }

  if (result?.flowType === 'system_orphans') {
    return [
      `אינדקסי קבוצות: ${number(summary.checkedTeamSearchIndexes)}`,
      `אינדקסי שחקנים: ${number(summary.checkedPlayerSearchIndexes)}`,
      `עונות קבוצה: ${number(summary.checkedTeamSeasons)}`,
      `מועדונים: ${number(summary.checkedClubs)}`,
      `רשומות ClubsMaster: ${number(summary.checkedClubsMasterEntries)}`,
    ]
  }

  if (result?.auditType === 'scouting_integrity') {
    return [
      `שחקני סגל: ${number(summary.rosterPlayers)}`,
      `נבדקו: ${number(summary.checkedPlayers)}`,
      `דולגו: ${number(summary.skippedPlayers)}`,
    ]
  }

  return []
}

export default function AuditSummary({ result, onDownload }) {
  const coveredTargets = result?.coverage?.coveredTargets || []
  const uncoveredTargets = result?.coverage?.uncoveredTargets || []
  const systemLines = systemSummaryLines(result)
  const findingsCount = number(result?.summary?.findingsCount || result?.findings?.length)

  return (
    <Sheet variant='soft' sx={sx.resultSheet}>
      <Stack spacing={1}>
        <Typography level='title-md'>סיכום</Typography>
        <Typography level='body-sm'>פערים: {findingsCount}</Typography>

        {systemLines.length ? (
          <Typography level='body-sm'>{systemLines.join(' · ')}</Typography>
        ) : result?.flowType === 'roster' ? (
          <Typography level='body-sm'>
            אינדקסי שחקנים צפויים: {number(result.summary?.expectedPlayerSearchIndexes)}
            {' · '}נבדקו: {number(result.summary?.checkedPlayerSearchIndexes)}
            {' · '}מועדונים: {number(result.summary?.checkedClubs)}
          </Typography>
        ) : (
          <Typography level='body-sm'>
            אינדקסי קבוצות צפויים: {number(result?.summary?.expectedTeamSearchIndexes)}
            {' · '}נבדקו: {number(result?.summary?.checkedTeamSearchIndexes)}
          </Typography>
        )}

        {result?.coverage ? (
          <>
            <Typography level='body-sm'>כיסוי: {result.coverage.complete ? 'מלא' : 'חלקי'}</Typography>
            <Typography level='body-sm'>
              תחומים שנבדקו: {coveredTargets.length ? coveredTargets.join(' · ') : 'אין'}
            </Typography>
            <Typography level='body-sm'>
              תחומים שלא מכוסים: {uncoveredTargets.length ? uncoveredTargets.join(' · ') : 'אין'}
            </Typography>
          </>
        ) : null}

        <Button size='sm' variant='outlined' sx={sx.actionButton} onClick={onDownload}>
          ייצוא JSON
        </Button>
      </Stack>
    </Sheet>
  )
}
