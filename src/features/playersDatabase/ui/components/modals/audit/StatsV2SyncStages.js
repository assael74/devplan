import * as React from 'react'
import { Button, Chip, Sheet, Stack, Typography } from '@mui/joy'

import {
  buildStatsReconcileStageStateV2,
  STATS_RECONCILE_STAGE,
} from '../../../../services/auditV2/stats/reconcileStage.js'

const STAGE_LABELS = Object.freeze({
  [STATS_RECONCILE_STAGE.COUNTERPARTS]: 'סנכרון העברות',
  [STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS]: 'מסמכי שחקנים',
  [STATS_RECONCILE_STAGE.PLAYER_INDEXES]: 'אינדקסי שחקנים',
  [STATS_RECONCILE_STAGE.TEAM_LEAGUE]: 'Team + League',
  [STATS_RECONCILE_STAGE.CLUBS]: 'Clubs + Clubs Master',
})

const STATUS_PRESENTATION = Object.freeze({
  clean: {
    label: 'תקין',
    color: 'success',
  },
  needs_sync: {
    label: 'דורש סנכרון',
    color: 'warning',
  },
  blocked: {
    label: 'ממתין לסנכרון העברות',
    color: 'neutral',
  },
})

export default function StatsV2SyncStages({
  result,
  busy = false,
  error = '',
  onSyncStage,
  onRepairCanonical,
  onCheckSync,
}) {
  const stages = React.useMemo(
    () => buildStatsReconcileStageStateV2(result),
    [result]
  )
  const auditClean = (
    result?.coverage?.complete === true &&
    (result?.findings?.length || 0) === 0
  )
  const canonicalFinding = (result?.findings || []).find(finding => (
    finding?.target === 'teamSeason'
  )) || null

  return (
    <Stack spacing={1.25}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack spacing={0.25}>
          <Typography level='title-sm'>השלמת סנכרון Stats</Typography>
          <Typography level='body-xs'>
            כל תיקון נבנה מחדש מהנתונים הקנוניים ונבדק שוב מול Firestore.
          </Typography>
        </Stack>
        <Chip size='sm' color='success' variant='soft'>Canonical זמין</Chip>
      </Stack>

      {canonicalFinding ? (
        <Sheet
          variant='soft'
          color='danger'
          sx={{
            p: 1.1,
            borderRadius: 'sm',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Stack spacing={0.25}>
            <Typography level='title-sm'>נתוני Stats בקבוצה</Typography>
            <Typography level='body-xs'>
              הטעינה מסומנת כהושלמה, אך נתוני השחקנים חסרים. נדרשת טעינה מחדש.
            </Typography>
            <Chip size='sm' color='danger' variant='soft' sx={{ alignSelf: 'flex-start' }}>
              דורש תיקון קנוני
            </Chip>
          </Stack>
          <Button
            size='sm'
            color='danger'
            variant='solid'
            disabled={busy}
            onClick={() => onRepairCanonical?.(canonicalFinding)}
          >
            תקן
          </Button>
        </Sheet>
      ) : null}

      {stages.map(row => {
        const presentation = STATUS_PRESENTATION[row.status]

        return (
          <Sheet
            key={row.stage}
            variant='soft'
            sx={{
              p: 1.1,
              borderRadius: 'sm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Stack spacing={0.25}>
              <Typography level='title-sm'>
                {STAGE_LABELS[row.stage] || row.stage}
              </Typography>
              <Chip
                size='sm'
                color={presentation.color}
                variant='soft'
                sx={{ alignSelf: 'flex-start' }}
              >
                {presentation.label}
              </Chip>
            </Stack>

            {row.status === 'needs_sync' ? (
              <Button
                size='sm'
                color='warning'
                variant='solid'
                disabled={busy}
                onClick={() => onSyncStage?.(row.stage)}
              >
                תקן
              </Button>
            ) : null}
          </Sheet>
        )
      })}

      {error ? (
        <Typography level='body-sm' color='danger'>
          {error}
        </Typography>
      ) : null}

      <Sheet variant='outlined' sx={{ p: 1.25, borderRadius: 'sm' }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          spacing={1}
        >
          <Stack spacing={0.25}>
            <Typography level='title-sm'>בדיקת סנכרון סופית</Typography>
            <Typography level='body-xs'>
              {auditClean
                ? 'הבדיקה האחרונה מלאה ונקייה. הקבלה יכולה להישאר סגורה.'
                : 'הרץ בדיקה מלאה לאחר השלמת התיקונים כדי לסגור את הקבלה.'}
            </Typography>
          </Stack>
          <Button
            size='sm'
            variant={auditClean ? 'outlined' : 'solid'}
            disabled={busy}
            onClick={onCheckSync}
          >
            בדוק סנכרון
          </Button>
        </Stack>
      </Sheet>
    </Stack>
  )
}
