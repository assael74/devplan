import { Button, Divider, Sheet, Stack, Typography } from '@mui/joy'

import { lifecycleLabel, TYPE_LABELS } from './auditFindingPresentation.js'
import { playerDatabaseAuditModalSx as sx } from '../sx/playerDatabaseAuditModal.sx.js'

export default function AuditSummary({ result, lifecycleSummary, onDownload }) {
  const isV2 = result.auditVersion === 'v2'
  const coveredTargets = result.coverage?.coveredTargets || []
  const uncoveredTargets = result.coverage?.uncoveredTargets || []

  return (
    <Sheet variant='soft' sx={sx.resultSheet}>
      <Stack spacing={1}>
        <Typography level='title-md'>סיכום</Typography>

        {isV2 ? (
          <>
            <Typography level='body-sm'>
              כיסוי: {result.coverage?.complete ? 'מלא' : 'חלקי'}
            </Typography>
            {result.flowType === 'roster' ? (
              <Typography level='body-sm'>
                אינדקסי שחקנים צפויים: {Number(result.summary?.expectedPlayerSearchIndexes || 0)}
                {' · '}
                נבדקו: {Number(result.summary?.checkedPlayerSearchIndexes || 0)}
                {' · '}
                מועדונים שנבדקו: {Number(result.summary?.checkedClubs || 0)}
                {' · '}
                פערים: {Number(result.summary?.findingsCount || result.findings?.length || 0)}
              </Typography>
            ) : (
              <Typography level='body-sm'>
                אינדקסי קבוצות צפויים: {Number(result.summary?.expectedTeamSearchIndexes || 0)}
                {' · '}
                נבדקו: {Number(result.summary?.checkedTeamSearchIndexes || 0)}
                {' · '}
                פערים: {Number(result.summary?.findingsCount || result.findings?.length || 0)}
              </Typography>
            )}
            <Typography level='body-sm'>
              תחומים שנבדקו: {coveredTargets.length ? coveredTargets.join(' · ') : 'אין'}
            </Typography>
            <Typography level='body-sm'>
              תחומים שעדיין לא מכוסים: {uncoveredTargets.length ? uncoveredTargets.join(' · ') : 'אין'}
            </Typography>
          </>
        ) : (
          <>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <Typography key={type} level='body-sm'>
                {label}: {Number(result.summary?.[type] || 0)}
              </Typography>
            ))}
            <Typography level='body-sm'>
              נבדקו: {Number(result.checked || 0)}
              {' · '}
              קריאות למסד הנתונים: {Number(result.readsUsed || 0)}
            </Typography>
            {result.coverage?.leaguesMaster?.checked ? (
              <Typography level='body-sm'>
                מאסטר הליגות מול מסמכי הליגה: {result.coverage.leaguesMaster.available
                  ? 'נבדק'
                  : 'לא נבדק — מסמך מאסטר לא נמצא'}
              </Typography>
            ) : null}
            {Object.keys(lifecycleSummary).length ? (
              <>
                <Divider />
                <Typography level='title-sm'>מצב הנתונים</Typography>
                <Typography level='body-sm'>
                  {Object.entries(lifecycleSummary)
                    .map(([status, count]) => `${lifecycleLabel(status)}: ${count}`)
                    .join(' · ')}
                </Typography>
              </>
            ) : null}
          </>
        )}

        <Button size='sm' variant='outlined' sx={sx.actionButton} onClick={onDownload}>
          ייצוא JSON
        </Button>
      </Stack>
    </Sheet>
  )
}
