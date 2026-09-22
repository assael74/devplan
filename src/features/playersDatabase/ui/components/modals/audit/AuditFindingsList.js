import { Button, Sheet, Stack, Typography } from '@mui/joy'
import { AUDIT_FINDING_TYPE } from '../../../../services/audit/index.js'
import {
  clean,
  conflictingLeagueIdsOf,
  formatAuditDate,
  formatValue,
  isLeagueClubProjectionFinding,
  isLeagueDocumentFinding,
  isLeagueLifecycleDocumentFinding,
  isLeaguesMasterSummaryFinding,
  isTeamSearchIndexLifecycleMismatch,
  lifecycleLabel,
  playerDetailsOf,
  sourceLabel,
} from './auditFindingPresentation.js'
import { playerDatabaseAuditModalSx as sx } from '../sx/playerDatabaseAuditModal.sx.js'

function AuditFindingCard({ finding, busy, actions }) {
  const playerDetails = playerDetailsOf(finding)
  const conflictingLeagueIds = conflictingLeagueIdsOf(finding)
  return (
    <Sheet variant='outlined' sx={sx.findingSheet}>
    <Stack spacing={0.5}>
    <Typography level='title-sm'>{finding.title}</Typography>
    {finding.explanation ? (
      <Typography level='body-sm'>{finding.explanation}</Typography>
    ) : null}
    <Typography level='body-xs'>
      מסמך: {finding.documentId || 'לא ידוע'}
      {finding.relatedDocumentId ? ` · קשור: ${finding.relatedDocumentId}` : ''}
      {finding.seasonKey ? ` · עונה: ${finding.seasonKey}` : ''}
    </Typography>
    {finding.entityType === 'playerSearchIndex' ? (
      <Typography level='body-sm'>
        קבוצה: {finding.teamDisplayName || finding.teamDocumentId || 'לא זמינה'}
        {finding.seasonKey ? ` · עונה: ${finding.seasonKey}` : ''}
        {finding.leagueId ? ` · ליגה: ${finding.leagueId}` : ''}
      </Typography>
    ) : null}
    {playerDetails?.name ? (
      <Typography level='body-sm'>שחקן: {playerDetails.name}</Typography>
    ) : null}
    {finding.entityType === 'playerSearchIndex' ? (
      <Typography level='body-xs'>
        שחקן באינדקס: {finding.playerDisplayName || 'שם לא זמין'}
        {finding.playerId ? ` · מזהה שחקן: ${finding.playerId}` : ''}
        {finding.externalPlayerId ? ` · מזהה חיצוני: ${finding.externalPlayerId}` : ''}
        {finding.playerDocumentId ? ` · מסמך שחקן: ${finding.playerDocumentId}` : ''}
      </Typography>
    ) : null}
    {playerDetails?.contexts.map((context, index) => (
      <Typography
        key={`${context.teamDocumentId}-${context.seasonKey}-${index}`}
        level='body-xs'
      >
        קבוצה: {context.teamName || context.teamDocumentId || 'לא ידועה'}
        {context.seasonKey ? ` · עונה: ${context.seasonKey}` : ''}
        {context.leagueId ? ` · ליגה: ${context.leagueId}` : ''}
      </Typography>
    ))}
    {finding.entityType === 'teamSeasonPlayer' && clean(finding.teamDocumentId) ? (
      <Button
        size='sm'
        variant='outlined'
        sx={sx.actionButton}
        onClick={() => actions.onTeamOpen?.(finding, {
          teamDocumentId: finding.teamDocumentId,
          seasonKey: finding.seasonKey,
          leagueId: finding.actual?.leagueId,
        })}
      >
        מעבר לקבוצה
      </Button>
    ) : clean(finding.playerDocumentId) ? (
      <Button
        size='sm'
        variant='outlined'
        sx={sx.actionButton}
        onClick={() => actions.onPlayerOpen?.(
          finding,
          finding.teamDocumentId
            ? {
              teamDocumentId: finding.teamDocumentId,
              seasonKey: finding.seasonKey,
              leagueId: finding.actual?.leagueId,
            }
            : playerDetails?.contexts[0] || {}
        )}
      >
        מעבר לשחקן
      </Button>
    ) : null}
    {finding.entityType === 'playerSearchIndex' && clean(finding.teamDocumentId) ? (
      <Button
        size='sm'
        variant='outlined'
        sx={sx.actionButton}
        onClick={() => actions.onTeamOpen?.(finding, {
          teamDocumentId: finding.teamDocumentId,
          seasonKey: finding.seasonKey,
          leagueId: finding.leagueId,
        })}
      >
        מעבר לקבוצה
      </Button>
    ) : null}
    {finding.source ? (
      <Typography level='body-xs'>מקור הנתונים: {sourceLabel(finding.source)}</Typography>
    ) : null}
    <Typography level='body-xs'>זוהתה: {formatAuditDate(finding.detectedAt)}</Typography>
    <Typography level='body-xs'>
      עדכון מקור: {formatAuditDate(finding.sourceUpdatedAt)}
      {finding.sourceLastWriteAction
        ? ` · פעולה אחרונה: ${finding.sourceLastWriteAction} (${formatAuditDate(finding.sourceLastWriteAt)})`
        : ''}
    </Typography>
    {finding.entityType.endsWith('SearchIndex') ? (
      <Typography level='body-xs'>
        עדכון אינדקס: {formatAuditDate(finding.indexUpdatedAt)}
        {finding.indexLastWriteAction
          ? ` · פעולה אחרונה: ${finding.indexLastWriteAction} (${formatAuditDate(finding.indexLastWriteAt)})`
          : ''}
      </Typography>
    ) : null}
    {finding.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH ? (
      <Typography level='body-xs'>
        שמורה בפועל: {formatValue(finding.actual)} · אמור להיות: {formatValue(finding.expected)}
      </Typography>
    ) : null}
    {isTeamSearchIndexLifecycleMismatch(finding) ? (
      <Button
        size='sm'
        color='warning'
        variant='solid'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onLeagueOpen?.(finding)}
      >
        מעבר לעמוד ליגה
      </Button>
    ) : null}
    {isLeagueDocumentFinding(finding) || isLeagueLifecycleDocumentFinding(finding) ? (
      <Button
        size='sm'
        color='warning'
        variant='solid'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onLeagueOpen?.(finding)}
      >
        מעבר לעמוד ליגה
      </Button>
    ) : null}
    {isLeagueClubProjectionFinding(finding) ? (
      <Button
        size='sm'
        color='warning'
        variant='solid'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onLeagueOpen?.(finding)}
      >
        מעבר לתיקוני הליגה
      </Button>
    ) : null}
    {conflictingLeagueIds.map(leagueId => (
      <Button
        key={leagueId}
        size='sm'
        color='warning'
        variant='solid'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onLeagueOpen?.({
          ...finding,
          relatedDocumentId: leagueId,
        })}
      >
        פתח ליגה: {leagueId}
      </Button>
    ))}
    {isLeaguesMasterSummaryFinding(finding) ? (
      <Button
        size='sm'
        color='warning'
        variant='solid'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onLeaguesCenterOpen?.()}
      >
        מעבר למרכז הליגות
      </Button>
    ) : null}
    {finding.lifecycleStatus ? (
      <Typography level='body-xs'>מצב: {lifecycleLabel(finding.lifecycleStatus)}</Typography>
    ) : null}
    </Stack>
    </Sheet>
  )
}

export default function AuditFindingsList({ findings, busy, actions, canLoadMore, onLoadMore }) {
  if (!findings.length) {
    return <Typography level='body-sm'>לא נמצאו פערים בהיקף שנבדק.</Typography>
  }

  return (
    <>
    <Stack spacing={1} sx={sx.findingsList}>
      {findings.map((finding, index) => (
        <AuditFindingCard
          key={`${finding.type}-${finding.documentId}-${index}`}
          finding={finding}
          busy={busy}
          actions={actions}
        />
      ))}
    </Stack>
    {canLoadMore ? (
      <Button size='sm' variant='plain' onClick={onLoadMore}>
        הצג עוד
      </Button>
    ) : null}
    </>
  )
}
