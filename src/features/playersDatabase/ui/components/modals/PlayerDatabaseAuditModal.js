import * as React from 'react'
import { Button, Divider, FormControl, FormLabel, Input, LinearProgress, Option, Select, Sheet, Stack, Typography } from '@mui/joy'
import { AUDIT_FINDING_TYPE, AUDIT_SCOPE_TYPE, buildAuditClubTeamSeasonScope, buildAuditTeamSeasonScope, getLastWriteAuditScope } from '../../../services/audit/index.js'
import RegularModal from './RegularModal.js'
import AuditFindingsList from './audit/AuditFindingsList.js'
import AuditRepairActions from './audit/AuditRepairActions.js'
import AuditSummary from './audit/AuditSummary.js'
import { TYPE_LABELS } from './audit/auditFindingPresentation.js'
import { MISMATCH_COLLECTION_TABS, selectFindingView, selectLifecycleSummary, selectRepairFindings } from './audit/auditFindingSelectors.js'
import { playerDatabaseAuditModalSx as sx } from './sx/playerDatabaseAuditModal.sx.js'

const PAGE_SIZE = 40
const clean = value => String(value === undefined || value === null ? '' : value).trim()
const WRITE_ACTION_LABELS = {
  pasteLeagueTable: 'טעינת טבלת ליגה',
  pasteTeamPlayers: 'טעינת סגל קבוצה',
  pasteTeamPlayerStats: 'טעינת סטטיסטיקות',
  clearTeamSeasonStats: 'ניקוי סטטיסטיקות',
  clearTeamSeasonPlayers: 'ניקוי סגל קבוצה',
  clearLeagueSeasonTeams: 'ניקוי קבוצות ליגה',
  updateLeagueSeasonTableRank: 'עדכון טבלת ליגה',
}
const WRITE_ACTION_STATUS_LABELS = {
  in_progress: 'בתהליך',
  completed: 'הושלמה',
  failed: 'נכשלה',
  failed_after_canonical_commit: 'דורשת סנכרון',
  superseded: 'הוחלפה',
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
const formatWriteActionOption = action => {
  const actionLabel = WRITE_ACTION_LABELS[clean(action?.actionType)] || clean(action?.actionType) || 'פעולה'
  const subject = clean(action?.teamSeasonDocumentId)
    || clean(action?.leagueId)
    || clean(action?.seasonKey)
  const status = WRITE_ACTION_STATUS_LABELS[clean(action?.status)] || clean(action?.status)
  return [actionLabel, subject, status, formatWriteActionTime(action?.updatedAt)]
    .filter(Boolean)
    .join(' · ')
}
const WRITE_ACTION_V2_FLOW_LABELS = {
  league: 'טעינת קבוצות ליגה',
  roster: 'טעינת סגל',
  stats: 'טעינת סטטיסטיקות',
}
const formatWriteActionReceiptV2Option = receipt => {
  const target = receipt?.auditTarget || {}

  return [
    WRITE_ACTION_V2_FLOW_LABELS[clean(receipt?.flowType)] || clean(receipt?.label) || 'פעולת V2',
    clean(target.leagueId) || clean(target.birthTeamDocumentId) || clean(target.seasonKey),
    clean(receipt?.status),
    formatWriteActionTime(receipt?.updatedAt),
  ].filter(Boolean).join(' · ')
}
const downloadFindings = result => {
  if (!result || typeof window === 'undefined') return
  const payload = {
    exportedAt: new Date().toISOString(),
    scope: result.scope,
    summary: result.summary,
    coverage: result.coverage,
    lifecycle: result.lifecycle,
    findings: result.findings,
  }
  const url = window.URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `players-database-audit-${new Date().toISOString().slice(0, 10)}.json`
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
    repairProgress = null,
    defaultTeamDocumentId = '',
    defaultSeasonKey = '',
    onRun,
    recentWriteActions = [],
    recentWriteActionsBusy = false,
    recentWriteActionReceiptsV2 = [],
    recentWriteActionReceiptsV2Busy = false,
    onScopeChange,
    onClose,
  } = props
  const [mode, setMode] = React.useState(AUDIT_SCOPE_TYPE.FULL_SYSTEM)
  const [clubId, setClubId] = React.useState('')
  const [teamDocumentId, setTeamDocumentId] = React.useState('')
  const [birthYear, setBirthYear] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('')
  const [filter, setFilter] = React.useState('all')
  const [mismatchCollection, setMismatchCollection] = React.useState('playerSearchIndex')
  const [visible, setVisible] = React.useState(PAGE_SIZE)
  const [lastWriteScope, setLastWriteScope] = React.useState(null)
  const [writeActionId, setWriteActionId] = React.useState('')
  const [receiptV2Id, setReceiptV2Id] = React.useState('')
  const previousDefaultsRef = React.useRef(null)
  React.useEffect(() => {
    if (!open) return

    const defaults = {
      teamDocumentId: clean(defaultTeamDocumentId),
      seasonKey: clean(defaultSeasonKey),
    }
    const defaultsChanged = previousDefaultsRef.current && (
      previousDefaultsRef.current.teamDocumentId !== defaults.teamDocumentId ||
      previousDefaultsRef.current.seasonKey !== defaults.seasonKey
    )
    previousDefaultsRef.current = defaults
    setTeamDocumentId(defaults.teamDocumentId)
    setSeasonKey(defaults.seasonKey)
    setLastWriteScope(getLastWriteAuditScope())
    setWriteActionId('')
    setReceiptV2Id('')
    setFilter('all')
    setMismatchCollection('playerSearchIndex')
    setVisible(PAGE_SIZE)
    if (defaultsChanged && mode === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
      onScopeChange?.()
    }
  }, [open, defaultTeamDocumentId, defaultSeasonKey, onScopeChange])

  const teamScope = mode === AUDIT_SCOPE_TYPE.TEAM_SEASON
  const clubTeamScope = mode === AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON
  const writeActionScope = mode === 'writeAction'
  const receiptV2Scope = mode === 'receiptV2'
  const scope = mode === 'lastWrite' && lastWriteScope
    ? lastWriteScope
    : clubTeamScope
      ? buildAuditClubTeamSeasonScope({ clubId, teamDocumentId, birthYear, seasonKey })
      : teamScope
        ? buildAuditTeamSeasonScope({ teamDocumentId, seasonKey })
      : { type: AUDIT_SCOPE_TYPE.FULL_SYSTEM }
  const findings = Array.isArray(result?.findings) ? result.findings : []
  const findingView = selectFindingView({ findings, filter, mismatchCollection })

  const changeScopeValue = (value, currentValue, setter) => {
    if (value === currentValue) return

    setter(value)
    onScopeChange?.()
  }

  const canRun = receiptV2Scope
    ? Boolean(clean(receiptV2Id))
    : writeActionScope
      ? Boolean(clean(writeActionId))
      : clubTeamScope
      ? Boolean(clean(clubId) && clean(teamDocumentId) && clean(birthYear) && clean(seasonKey))
      : !teamScope || Boolean(clean(teamDocumentId) && clean(seasonKey))
  const hasRepairProgress = repairProgress && Number(repairProgress.totalTeams) > 0
  const repairProgressValue = hasRepairProgress
    ? Math.min(100, (Number(repairProgress.completedTeams) / Number(repairProgress.totalTeams)) * 100)
    : 0

  return (
    <RegularModal
      open={open}
      size='lg'
      busy={busy}
      disabled={!canRun}
      persistent={busy}
      title='בדיקת תקינות נתונים'
      description='הבדיקה מחפשת מסמכים חסרים או מיותרים, נתונים לא תואמים וקשרים שבורים.'
      iconId='search'
      confirmLabel='בדוק עכשיו'
      confirmIconId='search'
      cancelLabel='סגור'
      onConfirm={() => {
        if (!canRun) return
        if (receiptV2Scope) return props.onRunReceiptV2?.(receiptV2Id)
        if (writeActionScope) return props.onRunWriteAction?.(writeActionId)
        return onRun?.(scope)
      }}
      onClose={onClose}
    >
      <Stack spacing={2}>
        {repairProgress ? (
          <Sheet variant='soft' sx={sx.progressSheet}>
            <Typography level='title-sm'>התקדמות עדכון הנתונים</Typography>
            {hasRepairProgress ? (
              <>
                <LinearProgress determinate value={repairProgressValue} sx={sx.progressBar} />
                <Typography level='body-sm'>
                  קבוצות שטופלו: {Number(repairProgress.completedTeams)} מתוך {Number(repairProgress.totalTeams)}
                </Typography>
              </>
            ) : (
              <Typography level='body-sm'>מכין את פעולת העדכון…</Typography>
            )}
            <Typography level='body-sm'>כתיבות שבוצעו: {Number(repairProgress.writesCount || 0)}</Typography>
          </Sheet>
        ) : null}

        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Button
            size='sm'
            variant={mode === AUDIT_SCOPE_TYPE.FULL_SYSTEM ? 'solid' : 'outlined'}
            onClick={() => changeScopeValue(AUDIT_SCOPE_TYPE.FULL_SYSTEM, mode, setMode)}
          >
            כל המערכת
          </Button>
          <Button
            size='sm'
            variant={teamScope ? 'solid' : 'outlined'}
            onClick={() => changeScopeValue(AUDIT_SCOPE_TYPE.TEAM_SEASON, mode, setMode)}
          >
            קבוצה ועונה
          </Button>
          <Button
            size='sm'
            variant={clubTeamScope ? 'solid' : 'outlined'}
            onClick={() => changeScopeValue(AUDIT_SCOPE_TYPE.CLUB_TEAM_SEASON, mode, setMode)}
          >
            מועדון + קבוצה + שנתון + עונה
          </Button>          {lastWriteScope ? (
            <Button
              size='sm'
              variant={mode === 'lastWrite' ? 'solid' : 'outlined'}
              onClick={() => changeScopeValue('lastWrite', mode, setMode)}
            >
              העדכון האחרון
            </Button>
          ) : null}
          <Button
            size='sm'
            variant={receiptV2Scope ? 'solid' : 'outlined'}
            onClick={() => changeScopeValue('receiptV2', mode, setMode)}
          >
            טעינות V2
          </Button>
          <Button
            size='sm'
            variant={writeActionScope ? 'solid' : 'outlined'}
            onClick={() => changeScopeValue('writeAction', mode, setMode)}
          >
            טעינות אחרונות
          </Button>
        </Stack>

        {teamScope || clubTeamScope ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            {clubTeamScope ? (
              <>
                <FormControl sx={sx.flexField}>
                  <FormLabel>מזהה מועדון</FormLabel>
                  <Input value={clubId} placeholder='למשל maccabi-beer-sheva' onChange={event => changeScopeValue(event.target.value, clubId, setClubId)} />
                </FormControl>
                <FormControl sx={sx.flexField}>
                  <FormLabel>שנתון</FormLabel>
                  <Input value={birthYear} placeholder='למשל 2012' onChange={event => changeScopeValue(event.target.value, birthYear, setBirthYear)} />
                </FormControl>
              </>
            ) : null}
            <FormControl sx={sx.flexField}>
              <FormLabel>מסמך קבוצה</FormLabel>
              <Input
                value={teamDocumentId}
                onChange={event => changeScopeValue(
                  event.target.value,
                  teamDocumentId,
                  setTeamDocumentId
                )}
              />
            </FormControl>
            <FormControl sx={sx.flexField}>
              <FormLabel>עונה</FormLabel>
              <Input
                value={seasonKey}
                onChange={event => changeScopeValue(
                  event.target.value,
                  seasonKey,
                  setSeasonKey
                )}
              />
            </FormControl>
          </Stack>
        ) : null}

        {receiptV2Scope ? (
          <Stack spacing={1}>
            <FormControl>
              <FormLabel>בחר Receipt V2 לבדיקה</FormLabel>
              <Select
                value={receiptV2Id || null}
                placeholder={recentWriteActionReceiptsV2Busy ? 'טוען פעולות V2…' : 'בחר פעולה V2'}
                disabled={recentWriteActionReceiptsV2Busy}
                onChange={(_event, value) => changeScopeValue(value || '', receiptV2Id, setReceiptV2Id)}
              >
                {recentWriteActionReceiptsV2.map(receipt => (
                  <Option key={receipt.id} value={receipt.id}>
                    {formatWriteActionReceiptV2Option(receipt)}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>מזהה Receipt V2 ידני</FormLabel>
              <Input
                value={receiptV2Id}
                onChange={event => changeScopeValue(event.target.value, receiptV2Id, setReceiptV2Id)}
              />
            </FormControl>
          </Stack>
        ) : null}

        {writeActionScope ? (
          <Stack spacing={1}>
            <FormControl>
              <FormLabel>בחר טעינה לבדיקה</FormLabel>
              <Select
                value={writeActionId || null}
                placeholder={recentWriteActionsBusy ? 'טוען טעינות אחרונות…' : 'בחר אחת מחמש הטעינות האחרונות'}
                disabled={recentWriteActionsBusy}
                onChange={(_event, value) => changeScopeValue(value || '', writeActionId, setWriteActionId)}
              >
                {recentWriteActions.map(action => (
                  <Option key={action.id} value={action.id}>
                    {formatWriteActionOption(action)}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>מזהה טעינה ידני (לפעולה ישנה)</FormLabel>
              <Input
                value={writeActionId}
                placeholder='הדבק מזהה רק אם הפעולה אינה מופיעה ברשימה'
                onChange={event => changeScopeValue(event.target.value, writeActionId, setWriteActionId)}
              />
            </FormControl>
          </Stack>
        ) : null}

        {result ? (
          <>
            <AuditSummary
              result={result}
              lifecycleSummary={selectLifecycleSummary(result)}
              onDownload={() => downloadFindings(result)}
            />
            {result.auditVersion === 'v2' ? null : (
              <AuditRepairActions
                busy={busy}
                findings={selectRepairFindings(findings)}
                actions={props}
              />
            )}
            {findings.length ? (
              <>
                <Divider />
                {result.auditVersion === 'v2' ? null : (
                  <>
                    <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
                      <Button
                        size='sm'
                        variant={filter === 'all' ? 'solid' : 'outlined'}
                        onClick={() => setFilter('all')}
                      >
                        הכול ({findings.length})
                      </Button>
                      {Object.entries(TYPE_LABELS).map(([type, label]) => (
                        <Button
                          key={type}
                          size='sm'
                          variant={filter === type ? 'solid' : 'outlined'}
                          onClick={() => setFilter(type)}
                        >
                          {label} ({Number(result.summary?.[type] || 0)})
                        </Button>
                      ))}
                    </Stack>
                    {filter === AUDIT_FINDING_TYPE.SOURCE_MISMATCH ? (
                      <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
                        {MISMATCH_COLLECTION_TABS
                          .filter(tab => Number(findingView.mismatchCounts[tab.id] || 0) > 0)
                          .map(tab => (
                            <Button
                              key={tab.id}
                              size='sm'
                              sx={sx.collectionTab}
                              variant={findingView.activeMismatchCollection === tab.id ? 'soft' : 'plain'}
                              onClick={() => {
                                setMismatchCollection(tab.id)
                                setVisible(PAGE_SIZE)
                              }}
                            >
                              {tab.label} ({Number(findingView.mismatchCounts[tab.id] || 0)})
                            </Button>
                          ))}
                      </Stack>
                    ) : null}
                  </>
                )}
                <AuditFindingsList
                  findings={findingView.filtered.slice(0, visible)}
                  busy={busy}
                  actions={props}
                  canLoadMore={findingView.filtered.length > visible}
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
