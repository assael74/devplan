import * as React from 'react'
import { Button, Divider, FormControl, FormLabel, Input, LinearProgress, Sheet, Stack, Typography } from '@mui/joy'
import { AUDIT_FINDING_TYPE, AUDIT_SCOPE_TYPE, buildAuditTeamSeasonScope, getLastWriteAuditScope } from '../../../services/audit/index.js'
import RegularModal from './RegularModal.js'
import AuditFindingsList from './audit/AuditFindingsList.js'
import AuditRepairActions from './audit/AuditRepairActions.js'
import AuditSummary from './audit/AuditSummary.js'
import { TYPE_LABELS } from './audit/auditFindingPresentation.js'
import { MISMATCH_COLLECTION_TABS, selectFindingView, selectLifecycleSummary, selectRepairFindings } from './audit/auditFindingSelectors.js'
import { playerDatabaseAuditModalSx as sx } from './sx/playerDatabaseAuditModal.sx.js'

const PAGE_SIZE = 40
const clean = value => String(value === undefined || value === null ? '' : value).trim()
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
    onScopeChange,
    onClose,
  } = props
  const [mode, setMode] = React.useState(AUDIT_SCOPE_TYPE.FULL_SYSTEM)
  const [teamDocumentId, setTeamDocumentId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('')
  const [filter, setFilter] = React.useState('all')
  const [mismatchCollection, setMismatchCollection] = React.useState('playerSearchIndex')
  const [visible, setVisible] = React.useState(PAGE_SIZE)
  const [lastWriteScope, setLastWriteScope] = React.useState(null)
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
    setFilter('all')
    setMismatchCollection('playerSearchIndex')
    setVisible(PAGE_SIZE)
    if (defaultsChanged && mode === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
      onScopeChange?.()
    }
  }, [open, defaultTeamDocumentId, defaultSeasonKey, onScopeChange])

  const teamScope = mode === AUDIT_SCOPE_TYPE.TEAM_SEASON
  const scope = mode === 'lastWrite' && lastWriteScope
    ? lastWriteScope
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

  const canRun = !teamScope || Boolean(clean(teamDocumentId) && clean(seasonKey))
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
      onConfirm={() => canRun && onRun?.(scope)}
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
          {lastWriteScope ? (
            <Button
              size='sm'
              variant={mode === 'lastWrite' ? 'solid' : 'outlined'}
              onClick={() => changeScopeValue('lastWrite', mode, setMode)}
            >
              העדכון האחרון
            </Button>
          ) : null}
        </Stack>

        {teamScope ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
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

        {result ? (
          <>
            <AuditSummary
              result={result}
              lifecycleSummary={selectLifecycleSummary(result)}
              onDownload={() => downloadFindings(result)}
            />
            <AuditRepairActions
              busy={busy}
              findings={selectRepairFindings(findings)}
              actions={props}
            />
            {findings.length ? (
              <>
                <Divider />
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
