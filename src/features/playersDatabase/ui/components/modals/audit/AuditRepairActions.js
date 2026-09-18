import { Button, Stack } from '@mui/joy'

import { playerDatabaseAuditModalSx as sx } from '../sx/playerDatabaseAuditModal.sx.js'

export default function AuditRepairActions({ busy, findings, actions }) {
  return (
    <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
      <Button
        size='sm'
        color='warning'
        variant='outlined'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onRefreshClubProjections?.()}
      >
        רענן מועדונים ו־Clubs Master מנתוני מקור
      </Button>
      <Button
        size='sm'
        color='warning'
        variant='outlined'
        disabled={busy}
        sx={sx.actionButton}
        onClick={() => actions.onRefreshClubsMaster?.()}
      >
        רענן Clubs Master
      </Button>
      {findings.repairable.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          sx={sx.actionButton}
          onClick={() => actions.onRepair?.(findings.repairable)}
        >
          תקן מסמכי שחקן חסרים ({findings.repairable.length})
        </Button>
      ) : null}
      {findings.orphanPlayerIndex.length ? (
        <Button
          size='sm'
          color='danger'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onDeleteOrphanPlayerIndexes?.(findings.orphanPlayerIndex)}
        >
          מחק אינדקסי שחקנים יתומים ({findings.orphanPlayerIndex.length})
        </Button>
      ) : null}
      {findings.orphanTeamIndex.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onResetOrphanTeamIndexes?.(findings.orphanTeamIndex)}
        >
          אפס אינדקסי קבוצה יתומים ({findings.orphanTeamIndex.length})
        </Button>
      ) : null}
      {findings.clubProjection.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRepairClubProjections?.(findings.clubProjection)}
        >
          סנכרן קבוצות ליגה למועדונים ({findings.clubProjection.length})
        </Button>
      ) : null}
      {findings.clubPerformance.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRepairClubProjections?.(findings.clubPerformance)}
        >
          סנכרן ביצועים התקפיים והגנתיים במועדונים ({findings.clubPerformance.length})
        </Button>
      ) : null}
      {findings.clubCompetitionPath.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRepairClubCompetitionPaths?.(findings.clubCompetitionPath)}
        >
          נקה מסלולי ליגה יתומים במועדונים ({findings.clubCompetitionPath.length})
        </Button>
      ) : null}
      {findings.playerIndex.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRepairPlayerIndexes?.(findings.playerIndex)}
        >
          תקן כל אינדקסי השחקנים ({findings.playerIndex.length})
        </Button>
      ) : null}
      {findings.teamIndex.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRepairTeamIndexes?.(findings.teamIndex)}
        >
          תקן כל אינדקסי הקבוצות ({findings.teamIndex.length})
        </Button>
      ) : null}
      {findings.movementCounterpart.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRetryMovementCounterparts?.(findings.movementCounterpart)}
        >
          נסה להשלים counterparts של Movements ({findings.movementCounterpart.length})
        </Button>
      ) : null}
      {findings.clubsMaster.length ? (
        <Button
          size='sm'
          color='warning'
          variant='solid'
          disabled={busy}
          sx={sx.actionButton}
          onClick={() => actions.onRepairClubsMaster?.(findings.clubsMaster)}
        >
          סנכרן Clubs Master ({findings.clubsMaster.length})
        </Button>
      ) : null}
    </Stack>
  )
}
