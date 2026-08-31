// src/features/playersDatabase/ui/components/modals/PlayerDatabaseAuditModal.js

import * as React from 'react'
import { Button, Divider, FormControl, FormLabel, Input, Sheet, Stack, Typography } from '@mui/joy'
import {
  AUDIT_FINDING_TYPE,
  AUDIT_SCOPE_TYPE,
  buildAuditTeamSeasonScope,
  getLastWriteAuditScope,
} from '../../../services/audit/index.js'
import RegularModal from './RegularModal.js'

const clean = value => String(value ?? '').trim()
const PAGE_SIZE = 40
const TYPE_LABELS = Object.freeze({
  [AUDIT_FINDING_TYPE.MISSING_DOCUMENT]: 'מסמכים חסרים',
  [AUDIT_FINDING_TYPE.SOURCE_MISMATCH]: 'נתונים לא תואמים',
  [AUDIT_FINDING_TYPE.BROKEN_RELATION]: 'קשרים שבורים',
  [AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT]: 'מסמכים מיותרים',
})
const LIFECYCLE_LABELS = Object.freeze({
  league_only: 'קבוצה מטבלת הליגה בלבד',
  root_without_seasons: 'קבוצה ללא עונות',
  roster_loaded: 'סגל נטען',
  stats_loaded: 'סטטיסטיקות נטענו',
  roster_only: 'שחקן בסגל ללא פרופיל סקאוט',
  profiled: 'שחקן עם פרופיל סקאוט',
  tracked_outside_current_roster: 'שחקן במעקב מחוץ לסגל הנוכחי',
  unknown: 'מצב לא ידוע',
})
const FIELD_LABELS = Object.freeze({
  tableRank: 'מיקום בטבלה', tableAttackRank: 'דירוג התקפה', tableDefenseRank: 'דירוג הגנה',
  teamGamePlayed: 'משחקים', goalsFor: 'שערי זכות', goalsAgainst: 'שערי חובה',
  goalsForPerGame: 'שערי זכות למשחק', goalsAgainstPerGame: 'שערי חובה למשחק',
  leaguesCount: 'ליגות', seasonsCount: 'עונות', teamsCount: 'קבוצות', playersCount: 'שחקנים',
  playersWithScoutProfileCount: 'שחקנים עם פרופיל', scoutProfilesCount: 'פרופילים', seasonKey: 'עונה',
})

const lifecycleLabel = status => LIFECYCLE_LABELS[clean(status)] || clean(status)
const sourceLabel = source => {
  if (source === 'League table → buildLeagueTeamPerformanceProjection') return 'טבלת הליגה'
  if (source === 'Team Season teamBalance → buildTeamBalanceSearchIndexProjection') return 'מאזן הקבוצה בעונה'
  if (source === 'Team Season player scout state → buildPlayerScoutIndexFields') return 'נתוני הסקאוט של השחקן'
  if (source === 'Team Season scout profile lifecycle') return 'כללי יצירת מסמך שחקן'
  if (source === 'League Documents → buildLeaguesMasterLeagueEntry') return 'מסמכי הליגה'
  if (source === 'League Documents → buildLeaguesMasterSummary') return 'מסמכי הליגה'
  return clean(source)
}

const formatValue = value => {
  if (value === undefined) return 'לא קיים'
  if (value === null) return 'ריק'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatValue).join(', ')
  if (typeof value === 'object') return Object.entries(value)
    .map(([key, item]) => `${FIELD_LABELS[key] || key}: ${formatValue(item)}`)
    .join(' · ')
  return String(value)
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
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `players-database-audit-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}

export default function PlayerDatabaseAuditModal({
  open = false, busy = false, error = '', result = null,
  defaultTeamDocumentId = '', defaultSeasonKey = '', onRun, onRepair, onClose,
}) {
  const [mode, setMode] = React.useState(AUDIT_SCOPE_TYPE.FULL_SYSTEM)
  const [teamDocumentId, setTeamDocumentId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('')
  const [filter, setFilter] = React.useState('all')
  const [visible, setVisible] = React.useState(PAGE_SIZE)
  const [lastWriteScope, setLastWriteScope] = React.useState(null)

  React.useEffect(() => {
    if (!open) return
    setTeamDocumentId(clean(defaultTeamDocumentId))
    setSeasonKey(clean(defaultSeasonKey))
    setLastWriteScope(getLastWriteAuditScope())
    setFilter('all')
    setVisible(PAGE_SIZE)
  }, [open, defaultTeamDocumentId, defaultSeasonKey])

  const teamScope = mode === AUDIT_SCOPE_TYPE.TEAM_SEASON
  const scope = mode === 'lastWrite' && lastWriteScope
    ? lastWriteScope
    : teamScope
      ? buildAuditTeamSeasonScope({ teamDocumentId, seasonKey })
      : { type: AUDIT_SCOPE_TYPE.FULL_SYSTEM }
  const findings = Array.isArray(result?.findings) ? result.findings : []
  const lifecycleSummary = (Array.isArray(result?.lifecycle) ? result.lifecycle : []).reduce((summary, item) => {
    const key = clean(item?.status) || 'unknown'
    summary[key] = Number(summary[key] || 0) + 1
    return summary
  }, {})
  const filtered = filter === 'all' ? findings : findings.filter(item => item.type === filter)
  const displayed = filtered.slice(0, visible)
  const canRun = !teamScope || Boolean(clean(teamDocumentId) && clean(seasonKey))
  const repairableFindings = findings.filter(finding => (
    finding.type === AUDIT_FINDING_TYPE.MISSING_DOCUMENT &&
    finding.entityType === 'player' &&
    clean(finding.playerDocumentId)
  ))

  return (
    <RegularModal open={open} size='lg' busy={busy} disabled={!canRun} persistent={busy}
      title='בדיקת תקינות נתונים' description='הבדיקה מחפשת מסמכים חסרים או מיותרים, נתונים לא תואמים וקשרים שבורים.'
      iconId='search' confirmLabel='בדוק עכשיו' confirmIconId='search'
      cancelLabel='סגור' onConfirm={() => canRun && onRun?.(scope)} onClose={onClose}
    >
      <Stack spacing={2}>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Button size='sm' variant={mode === AUDIT_SCOPE_TYPE.FULL_SYSTEM ? 'solid' : 'outlined'} onClick={() => setMode(AUDIT_SCOPE_TYPE.FULL_SYSTEM)}>כל המערכת</Button>
          <Button size='sm' variant={teamScope ? 'solid' : 'outlined'} onClick={() => setMode(AUDIT_SCOPE_TYPE.TEAM_SEASON)}>קבוצה ועונה</Button>
          {lastWriteScope ? <Button size='sm' variant={mode === 'lastWrite' ? 'solid' : 'outlined'} onClick={() => setMode('lastWrite')}>העדכון האחרון</Button> : null}
        </Stack>
        {teamScope ? <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <FormControl sx={{ flex: 1 }}><FormLabel>מסמך קבוצה</FormLabel><Input value={teamDocumentId} onChange={event => setTeamDocumentId(event.target.value)} /></FormControl>
          <FormControl sx={{ flex: 1 }}><FormLabel>עונה</FormLabel><Input value={seasonKey} onChange={event => setSeasonKey(event.target.value)} /></FormControl>
        </Stack> : null}
        {result ? <Sheet variant='soft' sx={{ p: 2, borderRadius: 'md' }}><Stack spacing={1}>
          <Typography level='title-md'>סיכום</Typography>
          {Object.entries(TYPE_LABELS).map(([type, label]) => <Typography key={type} level='body-sm'>{label}: {Number(result.summary?.[type] || 0)}</Typography>)}
          <Typography level='body-sm'>נבדקו: {Number(result.checked || 0)} · קריאות למסד הנתונים: {Number(result.readsUsed || 0)}</Typography>
          {result.coverage?.leaguesMaster?.checked ? <Typography level='body-sm'>מאסטר הליגות מול מסמכי הליגה: {result.coverage.leaguesMaster.available ? 'נבדק' : 'לא נבדק — מסמך מאסטר לא נמצא'}</Typography> : null}
          {Object.keys(lifecycleSummary).length ? <><Divider /><Typography level='title-sm'>מצב הנתונים</Typography><Typography level='body-sm'>{Object.entries(lifecycleSummary).map(([status, count]) => `${lifecycleLabel(status)}: ${count}`).join(' · ')}</Typography></> : null}
          <Button size='sm' variant='outlined' sx={{ alignSelf: 'flex-start' }} onClick={() => downloadFindings(result)}>ייצוא JSON</Button>
          {repairableFindings.length ? <Button size='sm' color='warning' variant='solid' sx={{ alignSelf: 'flex-start' }} onClick={() => onRepair?.(repairableFindings)}>תקן מסמכי שחקן חסרים ({repairableFindings.length})</Button> : null}
          {findings.length ? <><Divider /><Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
            <Button size='sm' variant={filter === 'all' ? 'solid' : 'outlined'} onClick={() => setFilter('all')}>הכול ({findings.length})</Button>
            {Object.entries(TYPE_LABELS).map(([type, label]) => <Button key={type} size='sm' variant={filter === type ? 'solid' : 'outlined'} onClick={() => setFilter(type)}>{label} ({Number(result.summary?.[type] || 0)})</Button>)}
          </Stack><Stack spacing={1} sx={{ maxHeight: 430, overflowY: 'auto' }}>
            {displayed.map((finding, index) => <Sheet key={`${finding.type}-${finding.documentId}-${index}`} variant='outlined' sx={{ p: 1.25, borderRadius: 'sm' }}><Stack spacing={0.5}>
              <Typography level='title-sm'>{finding.title}</Typography>
              {finding.explanation ? <Typography level='body-sm'>{finding.explanation}</Typography> : null}
              <Typography level='body-xs'>מסמך: {finding.documentId || 'לא ידוע'}{finding.relatedDocumentId ? ` · קשור: ${finding.relatedDocumentId}` : ''}{finding.seasonKey ? ` · עונה: ${finding.seasonKey}` : ''}</Typography>
              {finding.source ? <Typography level='body-xs'>מקור הנתונים: {sourceLabel(finding.source)}</Typography> : null}
              {finding.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH ? <Typography level='body-xs'>שמורה בפועל: {formatValue(finding.actual)} · אמור להיות: {formatValue(finding.expected)}</Typography> : null}
              {finding.lifecycleStatus ? <Typography level='body-xs'>מצב: {lifecycleLabel(finding.lifecycleStatus)}</Typography> : null}
            </Stack></Sheet>)}
          </Stack>{filtered.length > visible ? <Button size='sm' variant='plain' onClick={() => setVisible(value => value + PAGE_SIZE)}>הצג עוד</Button> : null}</> : <Typography level='body-sm'>לא נמצאו פערים בהיקף שנבדק.</Typography>}
        </Stack></Sheet> : null}
        {error ? <Typography level='body-sm' color='danger'>{error}</Typography> : null}
      </Stack>
    </RegularModal>
  )
}
