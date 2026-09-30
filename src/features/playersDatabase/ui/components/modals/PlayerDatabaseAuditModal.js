// src/features/playersDatabase/ui/components/modals/PlayerDatabaseAuditModal.js

import * as React from 'react'
import { Button, Divider, FormControl, FormLabel, Input, Option, Select, Sheet, Stack, Typography } from '@mui/joy'
import RegularModal from './RegularModal.js'
import AuditFindingsList from './audit/AuditFindingsList.js'
import AuditSummary from './audit/AuditSummary.js'
import StatsV2SyncStages from './audit/StatsV2SyncStages.js'
import { playerDatabaseAuditModalSx as sx } from './sx/playerDatabaseAuditModal.sx.js'

const PAGE_SIZE = 40
const clean = value => String(value === undefined || value === null ? '' : value).trim()

const MODE = Object.freeze({
  RECEIPT: 'receiptV2',
  STRUCTURAL: 'structural',
  ORPHANS: 'orphans',
  SCOUTING: 'scouting',
})

const WRITE_ACTION_V2_FLOW_LABELS = {
  league: 'ליגה',
  roster: 'סגל',
  stats: 'סטטיסטיקות',
}
const WRITE_ACTION_V2_STATUS_LABELS = {
  open: 'פתוחה',
  closed: 'הושלמה',
  abandoned: 'ננטשה',
}
const WRITE_ACTION_V2_EXECUTION_STATUS_LABELS = {
  running: 'בתהליך',
  failed: 'נכשלה',
  succeeded: 'הושלמה בהצלחה',
}
const WRITE_ACTION_V2_STEP_LABELS = {
  receipt: 'תיעוד הפעולה',
  canonical: 'הנתונים הקנוניים',
  projections: 'המסמכים הנלווים',
  teamSeason: 'עונת הקבוצה',
  team: 'עונות הקבוצות והפניותיהן',
  teamIndex: 'אינדקסי הקבוצות',
  identity: 'שיוך קבוצות למועדונים',
  playerIndex: 'אינדקסי השחקנים',
  teamSearchIndex: 'אינדקס הקבוצה',
  league: 'הליגה',
  club: 'המועדון',
  clubsMaster: 'מרכז המועדונים',
  leaguesMaster: 'מרכז הליגות',
  audit: 'בדיקת הסנכרון',
}
const WRITE_ACTION_V2_TARGET_LABELS = {
  ...WRITE_ACTION_V2_STEP_LABELS,
  roster: 'הסגל',
  root: 'מסמך הקבוצה',
  teamRoot: 'מסמך הקבוצה',
  teamRoots: 'מסמכי הקבוצות',
  teamSeasons: 'עונות הקבוצות',
  teamSearchIndexes: 'אינדקסי הקבוצות',
  playerSearchIndexes: 'אינדקסי השחקנים',
  clubs: 'מועדונים',
  playerDocument: 'מסמכי השחקנים',
  playerSearchIndex: 'אינדקסי השחקנים',
  writeAction: 'תיעוד הפעולה',
}

const formatWriteActionTime = value => {
  const date = typeof value?.toDate === 'function'
    ? value.toDate()
    : value instanceof Date
      ? value
      : null
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('he-IL', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(date)
    : 'כעת'
}

const formatWriteActionReceiptV2Label = receipt => {
  const flowType = clean(receipt?.flowType)
  const operationType = clean(receipt?.operationType)

  if (operationType === 'delete' && flowType === 'league') return 'מחיקת עונת ליגה'
  if (operationType === 'clear' && flowType === 'league') return 'מחיקת קבוצות ליגה'
  if (operationType === 'clear' && flowType === 'stats') return 'מחיקת סטטיסטיקה'
  if (operationType === 'clear' && flowType === 'roster') return 'מחיקת סגל'
  return `${operationType === 'clear' ? 'ניקוי' : 'טעינת'} ${WRITE_ACTION_V2_FLOW_LABELS[flowType] || flowType || 'V2'}`
}

const formatWriteActionReceiptV2Progress = receipt => {
  const failedStep = clean(receipt?.failedStep)
  const lastCompletedStep = clean(receipt?.lastCompletedStep)
  const executionStatus = clean(receipt?.executionStatus)

  if (failedStep) return `נעצרה בשלב ${WRITE_ACTION_V2_STEP_LABELS[failedStep] || 'לא ידוע'}`
  if (executionStatus === 'succeeded') return WRITE_ACTION_V2_EXECUTION_STATUS_LABELS.succeeded
  if (lastCompletedStep) return `שלב אחרון שהושלם: ${WRITE_ACTION_V2_STEP_LABELS[lastCompletedStep] || 'לא ידוע'}`
  return WRITE_ACTION_V2_EXECUTION_STATUS_LABELS[executionStatus] || ''
}

const formatWriteActionReceiptV2Option = receipt => {
  const target = receipt?.auditTarget || {}
  const status = WRITE_ACTION_V2_STATUS_LABELS[clean(receipt?.status)] || clean(receipt?.status)

  return [
    formatWriteActionReceiptV2Label(receipt),
    clean(target.seasonKey),
    status,
    formatWriteActionReceiptV2Progress(receipt),
    formatWriteActionTime(receipt?.updatedAt),
  ].filter(Boolean).join(' · ')
}

const downloadFindings = result => {
  if (!result || typeof window === 'undefined') return
  const payload = {
    exportedAt: new Date().toISOString(),
    flowType: result.flowType,
    auditType: result.auditType,
    summary: result.summary,
    coverage: result.coverage,
    findings: result.findings,
  }
  const url = window.URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `players-database-audit-v2-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}

export default function PlayerDatabaseAuditModal(props) {
  const {
    open = false,
    busy = false,
    error = '',
    result = null,
    defaultTeamDocumentId = '',
    defaultSeasonKey = '',
    recentWriteActionReceiptsV2 = [],
    recentWriteActionReceiptsV2Busy = false,
    onScopeChange,
    onClose,
  } = props

  const [mode, setMode] = React.useState(MODE.RECEIPT)
  const [teamDocumentId, setTeamDocumentId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('')
  const [receiptV2Id, setReceiptV2Id] = React.useState('')
  const [visible, setVisible] = React.useState(PAGE_SIZE)

  React.useEffect(() => {
    if (!open) return
    setTeamDocumentId(clean(defaultTeamDocumentId))
    setSeasonKey(clean(defaultSeasonKey))
    setReceiptV2Id('')
    setVisible(PAGE_SIZE)
  }, [open, defaultTeamDocumentId, defaultSeasonKey])

  const selectedReceiptV2 = recentWriteActionReceiptsV2.find(receipt => (
    clean(receipt?.id) === clean(receiptV2Id)
  )) || null
  const findings = Array.isArray(result?.findings) ? result.findings : []
  const receiptMode = mode === MODE.RECEIPT
  const scoutingMode = mode === MODE.SCOUTING
  const canRun = receiptMode
    ? Boolean(clean(receiptV2Id))
    : scoutingMode
      ? Boolean(clean(teamDocumentId) && clean(seasonKey))
      : true

  const changeMode = nextMode => {
    if (nextMode === mode) return
    setMode(nextMode)
    setVisible(PAGE_SIZE)
    onScopeChange?.()
  }

  const run = () => {
    if (!canRun) return
    if (receiptMode) return props.onRunReceiptV2?.(receiptV2Id)
    return props.onRunSystemAudit?.({
      type: mode,
      birthTeamDocumentId: teamDocumentId,
      seasonKey,
    })
  }

  return (
    <RegularModal
      open={open}
      size='lg'
      busy={busy}
      disabled={!canRun}
      persistent={busy}
      title='Audit V2'
      description='בדיקות ממוקדות של פעולות V2 ובדיקות מערכת ידניות בלבד.'
      iconId='search'
      confirmLabel='בדוק עכשיו'
      confirmIconId='search'
      cancelLabel='סגור'
      onConfirm={run}
      onClose={onClose}
    >
      <Stack spacing={2}>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Button size='sm' variant={receiptMode ? 'solid' : 'outlined'} onClick={() => changeMode(MODE.RECEIPT)}>
            פעולות V2
          </Button>
          <Button size='sm' variant={mode === MODE.STRUCTURAL ? 'solid' : 'outlined'} onClick={() => changeMode(MODE.STRUCTURAL)}>
            מבנה וקשרים
          </Button>
          <Button size='sm' variant={mode === MODE.ORPHANS ? 'solid' : 'outlined'} onClick={() => changeMode(MODE.ORPHANS)}>
            נתונים יתומים
          </Button>
          <Button size='sm' variant={scoutingMode ? 'solid' : 'outlined'} onClick={() => changeMode(MODE.SCOUTING)}>
            מודל סקאוט
          </Button>
        </Stack>

        {receiptMode ? (
          <Stack spacing={1}>
            <FormControl>
              <FormLabel>בחר פעולת V2 לבדיקה</FormLabel>
              <Select
                value={receiptV2Id || null}
                placeholder={recentWriteActionReceiptsV2Busy ? 'טוען פעולות V2…' : 'בחר פעולה V2'}
                disabled={recentWriteActionReceiptsV2Busy}
                onChange={(_event, value) => {
                  setReceiptV2Id(value || '')
                  onScopeChange?.()
                }}
              >
                {recentWriteActionReceiptsV2.map(receipt => (
                  <Option key={receipt.id} value={receipt.id}>
                    {formatWriteActionReceiptV2Option(receipt)}
                  </Option>
                ))}
              </Select>
            </FormControl>
            {selectedReceiptV2 ? (
              <Sheet variant='soft' sx={{ p: 1.5, borderRadius: 'sm' }}>
                <Typography level='title-sm'>{formatWriteActionReceiptV2Label(selectedReceiptV2)}</Typography>
                <Typography level='body-sm'>
                  מצב: {WRITE_ACTION_V2_STATUS_LABELS[clean(selectedReceiptV2.status)] || clean(selectedReceiptV2.status) || 'לא ידוע'}
                </Typography>
                {formatWriteActionReceiptV2Progress(selectedReceiptV2) ? (
                  <Typography level='body-sm'>{formatWriteActionReceiptV2Progress(selectedReceiptV2)}</Typography>
                ) : null}
                {selectedReceiptV2.failedTarget?.targetType ? (
                  <Typography level='body-sm'>
                    יעד הכשל: {WRITE_ACTION_V2_TARGET_LABELS[clean(selectedReceiptV2.failedTarget.targetType)] || 'רכיב בתהליך'}
                  </Typography>
                ) : null}
              </Sheet>
            ) : null}
          </Stack>
        ) : null}

        {mode === MODE.STRUCTURAL ? (
          <Sheet variant='soft' sx={{ p: 1.5, borderRadius: 'sm' }}>
            <Typography level='body-sm'>בדיקה ידנית של קשרים קנוניים בין League, Team, Team Season ו-Club, כולל Movement invariants.</Typography>
          </Sheet>
        ) : null}

        {mode === MODE.ORPHANS ? (
          <Sheet variant='soft' sx={{ p: 1.5, borderRadius: 'sm' }}>
            <Typography level='body-sm'>בדיקה ידנית לאיתור Team/Player SearchIndexes ו-ClubsMaster entries שאין להם מקור קנוני תקין.</Typography>
          </Sheet>
        ) : null}

        {scoutingMode ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <FormControl sx={sx.flexField}>
              <FormLabel>מסמך קבוצה</FormLabel>
              <Input
                value={teamDocumentId}
                onChange={event => {
                  setTeamDocumentId(event.target.value)
                  onScopeChange?.()
                }}
              />
            </FormControl>
            <FormControl sx={sx.flexField}>
              <FormLabel>עונה</FormLabel>
              <Input
                value={seasonKey}
                onChange={event => {
                  setSeasonKey(event.target.value)
                  onScopeChange?.()
                }}
              />
            </FormControl>
          </Stack>
        ) : null}

        {result ? (
          <>
            <AuditSummary result={result} onDownload={() => downloadFindings(result)} />
            {result.flowType === 'stats' ? (
              <StatsV2SyncStages
                result={result}
                busy={busy}
                error={error}
                onSyncStage={stage => props.onReconcileStatsAuditStage?.({
                  receiptId: result.receiptId,
                  stage,
                })}
                onRepairCanonical={finding => (
                  result.operationType === 'clear'
                    ? props.onRepairClearStats?.({
                      receiptId: result.receiptId,
                      birthTeamDocumentId: result.birthTeamDocumentId,
                      seasonKey: result.seasonKey,
                      leagueId: result.leagueId,
                    })
                    : props.onTeamOpen?.(finding, {
                      teamDocumentId: result.birthTeamDocumentId,
                      seasonKey: result.seasonKey,
                      leagueId: result.leagueId,
                      openStatsImport: true,
                    })
                )}
                onCheckSync={() => props.onRunReceiptV2?.(result.receiptId)}
              />
            ) : null}
            {findings.length ? (
              <>
                <Divider />
                <AuditFindingsList
                  findings={findings.slice(0, visible)}
                  busy={busy}
                  actions={props}
                  canLoadMore={findings.length > visible}
                  onLoadMore={() => setVisible(value => value + PAGE_SIZE)}
                />
              </>
            ) : (
              <Typography level='body-sm'>לא נמצאו פערים בהיקף שנבדק.</Typography>
            )}
          </>
        ) : null}
        {error ? <Typography level='body-sm' color='danger'>{error}</Typography> : null}
      </Stack>
    </RegularModal>
  )
}
