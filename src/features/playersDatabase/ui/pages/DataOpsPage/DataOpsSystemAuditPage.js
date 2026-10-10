// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsSystemAuditPage.js

import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import InfoPanel from '../../components/page/InfoPanel.js'
import { auditSystem } from '../../../services/audit/system/index.js'
import {
  buildSystemAuditPlan,
  SYSTEM_AUDIT_CHECK,
  SYSTEM_AUDIT_CHECKS,
} from '../../../services/audit/system/checks.js'
import {
  deleteSystemCleanupCandidates,
  getSystemCleanupCandidateKey,
  getSystemCleanupCandidates,
} from '../../../services/audit/system/cleanup.js'
import { readInventorySnapshot } from './logic/inventorySnapshot.logic.js'
import { downloadDataOpsJson } from './logic/dataOpsJsonDownload.logic.js'
import { getFindingDisplayImpact } from './logic/systemAuditFindings.presentation.js'
import {
  readSystemAuditSnapshot,
  restoreSystemAuditResult,
  writeSystemAuditSnapshot,
} from './logic/systemAuditSnapshot.logic.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const TARGET_LABELS = {
  teamRoots: 'מסמכי קבוצה',
  teamSeasons: 'עונות קבוצה',
  playerRoots: 'מסמכי שחקן',
  playerSeasons: 'עונות שחקן',
  playerSearchIndexes: 'אינדקסי שחקנים',
  leagues: 'ליגות',
  clubProfiles: 'מועדונים',
  leaguesCenter: 'מרכז הליגות',
  clubsCenter: 'מרכזי מועדונים',
  clubsDirectory: 'ספריית מועדונים',
}

const TARGET_FILTER_ORDER = [
  'playerSeasons',
  'clubsCenter',
  'leaguesCenter',
  'playerSearchIndexes',
  'teamSeasons',
  'teamRoots',
  'playerRoots',
  'leagues',
  'clubProfiles',
  'clubsDirectory',
]

const CHECK_CARDS = [
  {
    id: 'all',
    title: 'כל הבדיקות הזמינות',
    description: 'הפעל יחד את כל הבדיקות שכבר נתמכות במערכת.',
    iconId: 'check',
    all: true,
  },
  {
    id: SYSTEM_AUDIT_CHECK.UNUSED_DOCUMENTS,
    title: 'מסמכים מיותרים',
    description: 'אתר מסמכים שאין להם עוד מקור תקין.',
    iconId: 'delete',
  },
  {
    id: SYSTEM_AUDIT_CHECK.MISSING_DOCUMENTS,
    title: 'מסמכים חסרים',
    description: 'אתר מסמכים שהמערכת הייתה אמורה ליצור.',
    iconId: 'report',
  },
  {
    id: SYSTEM_AUDIT_CHECK.DOCUMENT_REFERENCES,
    title: 'הפניות בין מסמכים',
    description: 'בדוק שהפניות מובילות למסמכים הנכונים.',
    iconId: 'link',
  },
  {
    id: SYSTEM_AUDIT_CHECK.PROJECTION_SYNC,
    title: 'התאמת אינדקסים ומרכזים',
    description: 'השווה תוצרי חיפוש ומרכזים למסמכי המקור.',
    iconId: 'dataShow',
  },
  {
    id: SYSTEM_AUDIT_CHECK.DOCUMENT_IDS,
    title: 'מזהי מסמכים',
    description: 'בדוק שמזהי המסמכים ושדות הזהות תואמים.',
    iconId: 'search',
  },
  {
    id: 'playerTransitions',
    title: 'מעברי שחקנים',
    description: 'בדיקת שני צדי המעבר טרם הושלמה.',
    iconId: 'warning',
    disabled: true,
  },
  {
    id: 'requiredFields',
    title: 'שדות חובה',
    description: 'חוקי שדות החובה טרם הוגדרו לכל מסמך.',
    iconId: 'warning',
    disabled: true,
  },
]

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const formatTime = value => {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'לא ידוע'
  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const checkedDocuments = summary => [
  summary.checkedTeamRoots,
  summary.checkedTeamSeasons,
  summary.checkedPlayerRoots,
  summary.checkedPlayerSeasons,
  summary.checkedPlayerSearchIndexes,
  summary.checkedLeagues,
  summary.checkedClubProfiles,
  summary.checkedLeaguesCenter,
  summary.checkedClubsCenter,
  summary.checkedClubsDirectory,
].reduce((total, value) => total + (Number(value) || 0), 0)

const findingDetails = finding => [
  ['קולקשיין', TARGET_LABELS[finding.target] || finding.target],
  ['סוג ממצא', finding.type],
  ['מזהה מסמך', finding.documentId],
  ['מסמך קשור', finding.relatedDocumentId],
  ['עונה', finding.seasonId],
  ['ליגה', finding.leagueId],
  ['קבוצה', finding.teamId],
  ['מועדון', finding.clubId],
  ['שחקן', finding.playerId],
  ['אחריות', finding.owner],
].filter(([, value]) => clean(value))

const jsonDetail = value => {
  if (value === null || value === undefined) return ''
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}

function FindingDetailsDialog({ finding, onClose }) {
  if (!finding) return null

  const expected = jsonDetail(finding.expected)
  const actual = jsonDetail(finding.actual)
  const displayImpact = getFindingDisplayImpact(finding)

  return (
    <Modal open onClose={onClose}>
      <ModalDialog sx={sx.findingDialog}>
        <ModalClose />
        <DialogTitle>{finding.title || finding.type || 'פרטי ממצא'}</DialogTitle>
        <DialogContent className='dpScrollThin' sx={sx.findingDialogContent}>
          <Stack spacing={1.25}>
            <Box sx={sx.findingDialogSection}>
              <Typography level='body-xs'>מה נמצא</Typography>
              <Typography level='body-sm'>{finding.reason || 'לא נשמר הסבר נוסף.'}</Typography>
            </Box>
            <Box sx={sx.systemFindingImpact(displayImpact.tone)}>
              <Typography level='body-xs' fontWeight={800}>השפעה על התצוגה · {displayImpact.label}</Typography>
              <Typography level='body-sm'>{displayImpact.text}</Typography>
            </Box>
            <Box sx={sx.findingDialogSection}>
              <Typography level='body-xs'>פעולה מומלצת</Typography>
              <Typography level='body-sm'>
                {finding.recommendedAction || 'יש לבדוק את מסמך המקור לפני ביצוע תיקון.'}
              </Typography>
            </Box>
            <Box sx={sx.findingDetailGrid}>
              {findingDetails(finding).map(([label, value]) => (
                <Box key={label} sx={sx.findingDetailRow}>
                  <Typography level='body-xs'>{label}</Typography>
                  <Typography component='code' level='body-xs' sx={sx.findingDocumentId}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {expected || actual ? (
              <Box sx={sx.findingComparisonGrid}>
                {expected ? (
                  <Box sx={sx.findingComparison}>
                    <Typography level='title-sm'>ערך צפוי</Typography>
                    <Box component='pre' sx={sx.findingJson}>{expected}</Box>
                  </Box>
                ) : null}
                {actual ? (
                  <Box sx={sx.findingComparison}>
                    <Typography level='title-sm'>ערך בפועל</Typography>
                    <Box component='pre' sx={sx.findingJson}>{actual}</Box>
                  </Box>
                ) : null}
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type='button' variant='outlined' color='neutral' onClick={onClose}>סגור</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export default function DataOpsSystemAuditPage() {
  const storedSnapshot = useMemo(() => (
    typeof window === 'undefined' ? null : readSystemAuditSnapshot(window.localStorage)
  ), [])
  const inventorySnapshot = useMemo(() => (
    typeof window === 'undefined' ? null : readInventorySnapshot(window.localStorage)
  ), [])
  const storedResult = useMemo(() => restoreSystemAuditResult(storedSnapshot), [storedSnapshot])
  const [snapshot, setSnapshot] = useState(storedSnapshot)
  const [selectedChecks, setSelectedChecks] = useState(
    Array.isArray(storedSnapshot && storedSnapshot.selectedChecks)
      ? storedSnapshot.selectedChecks
      : []
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(storedResult)
  const [resultSource, setResultSource] = useState(storedResult ? 'cache' : '')
  const [visibleFindings, setVisibleFindings] = useState(40)
  const [findingFilter, setFindingFilter] = useState('all')
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletedCount, setDeletedCount] = useState(0)
  const [selectedFinding, setSelectedFinding] = useState(null)
  const auditPlan = useMemo(
    () => buildSystemAuditPlan(selectedChecks),
    [selectedChecks]
  )
  const allChecksSelected = selectedChecks.length === SYSTEM_AUDIT_CHECKS.length
  const runButtonLabel = !selectedChecks.length
    ? 'בחר בדיקה להפעלה'
    : selectedChecks.length === 1
      ? 'הפעל בדיקה אחת'
      : `הפעל ${selectedChecks.length} בדיקות`
  const estimatedDocuments = useMemo(() => {
    if (!inventorySnapshot || !Array.isArray(inventorySnapshot.collections)) return null
    const counts = new Map(
      inventorySnapshot.collections.map(item => [item.id, Number(item.count) || 0])
    )
    return auditPlan.targets.reduce((total, target) => total + (counts.get(target) || 0), 0)
  }, [auditPlan.targets, inventorySnapshot])

  const toggleCheck = card => {
    if (card.disabled || busy) return
    if (card.all) {
      setSelectedChecks(allChecksSelected ? [] : [...SYSTEM_AUDIT_CHECKS])
      return
    }
    setSelectedChecks(current => (
      current.includes(card.id)
        ? current.filter(check => check !== card.id)
        : [...current, card.id]
    ))
  }

  const runAudit = async () => {
    if (!selectedChecks.length || busy) return
    setBusy(true)
    setError('')
    setResult(null)
    setVisibleFindings(40)
    setFindingFilter('all')
    setSelectedCandidates([])
    setDeleteConfirmed(false)
    setDeleteError('')
    setDeletedCount(0)
    try {
      const nextResult = await auditSystem({ checks: selectedChecks })
      const nextSnapshot = typeof window === 'undefined'
        ? null
        : writeSystemAuditSnapshot({ storage: window.localStorage, result: nextResult })
      setResult(nextResult)
      setResultSource('current')
      setSnapshot(nextSnapshot)
    } catch (auditError) {
      setError(auditError instanceof Error ? auditError.message : 'בדיקת התקינות נכשלה')
    } finally {
      setBusy(false)
    }
  }

  const summary = result && result.summary ? result.summary : {}
  const findings = useMemo(
    () => (result && Array.isArray(result.findings) ? result.findings : []),
    [result]
  )
  const findingFilters = useMemo(() => {
    const counts = findings.reduce((nextCounts, finding) => {
      const target = clean(finding.target) || 'other'
      nextCounts[target] = (nextCounts[target] || 0) + 1
      return nextCounts
    }, {})
    const knownTargets = TARGET_FILTER_ORDER.filter(target => counts[target])
    const remainingTargets = Object.keys(counts)
      .filter(target => !knownTargets.includes(target))
      .sort((left, right) => left.localeCompare(right))

    return [
      { id: 'all', label: 'הכול', count: findings.length },
      ...knownTargets.concat(remainingTargets).map(target => ({
        id: target,
        label: TARGET_LABELS[target] || 'אחר',
        count: counts[target],
      })),
    ]
  }, [findings])
  const filteredFindings = useMemo(() => (
    findingFilter === 'all'
      ? findings
      : findings.filter(finding => (clean(finding.target) || 'other') === findingFilter)
  ), [findingFilter, findings])
  const cleanupCandidates = useMemo(
    () => getSystemCleanupCandidates(result),
    [result]
  )
  const cleanupKeys = useMemo(
    () => new Set(cleanupCandidates.map(getSystemCleanupCandidateKey)),
    [cleanupCandidates]
  )
  const toggleCandidate = finding => {
    const key = getSystemCleanupCandidateKey(finding)
    setSelectedCandidates(current => (
      current.includes(key)
        ? current.filter(value => value !== key)
        : [...current, key]
    ))
    setDeleteConfirmed(false)
  }

  const deleteSelected = async () => {
    if (!deleteConfirmed || deleting || !selectedCandidates.length) return
    setDeleting(true)
    setDeleteError('')
    try {
      const selected = cleanupCandidates.filter(finding => (
        selectedCandidates.includes(getSystemCleanupCandidateKey(finding))
      ))
      const cleanupResult = await deleteSystemCleanupCandidates({
        candidates: selected,
        checks: selectedChecks,
      })
      const nextResult = cleanupResult.auditResult
      const nextSnapshot = typeof window === 'undefined'
        ? null
        : writeSystemAuditSnapshot({ storage: window.localStorage, result: nextResult })
      setResult(nextResult)
      setResultSource('current')
      setSnapshot(nextSnapshot)
      setFindingFilter('all')
      setVisibleFindings(40)
      setSelectedCandidates([])
      setDeleteConfirmed(false)
      setDeletedCount(cleanupResult.cleanedCandidatesCount)
    } catch (cleanupError) {
      setDeleteError(cleanupError instanceof Error ? cleanupError.message : 'מחיקת המסמכים נכשלה')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={1.5} sx={sx.systemAuditPage}>
        <Box sx={sx.systemAuditGrid}>
          <Box sx={sx.systemAuditMainScroll}>
            <InfoPanel title='בחירת בדיקות' sx={sx.panel}>
              <Stack spacing={1.25}>
              <Box sx={sx.systemCheckGrid}>
                {CHECK_CARDS.map(card => {
                  const selected = card.all
                    ? allChecksSelected
                    : selectedChecks.includes(card.id)
                  return (
                    <Box
                      key={card.id}
                      component='button'
                      type='button'
                      disabled={card.disabled || busy}
                      aria-pressed={selected}
                      onClick={() => toggleCheck(card)}
                      sx={sx.systemCheckCard({ selected, disabled: card.disabled, all: card.all })}
                    >
                      <Box sx={sx.systemCheckCardHeader}>
                        <Box sx={sx.systemCheckIcon(selected)}>
                          {iconUi({ id: card.iconId, size: 'sm' })}
                        </Box>
                        <Typography level='title-sm'>{card.title}</Typography>
                        <Chip
                          size='sm'
                          variant='soft'
                          color={card.disabled ? 'neutral' : selected ? 'primary' : 'neutral'}
                        >
                          {card.disabled ? 'עדיין לא זמין' : selected ? 'נבחר' : 'לבחירה'}
                        </Chip>
                      </Box>
                      <Typography level='body-xs'>{card.description}</Typography>
                    </Box>
                  )
                })}
              </Box>

              <Box sx={sx.systemScanPlan}>
                <Box sx={sx.systemScanPlanHeader}>
                  <Box>
                    <Typography level='title-sm'>קולקשיינים שייסרקו</Typography>
                    <Typography level='body-xs'>הבחירה נקבעת אוטומטית לפי הבדיקות שסומנו.</Typography>
                  </Box>
                  <Chip size='sm' variant='soft' color={auditPlan.targets.length ? 'primary' : 'neutral'}>
                    {auditPlan.targets.length} קולקשיינים
                  </Chip>
                </Box>
                {auditPlan.targets.length ? (
                  <Box sx={sx.systemTargetChips}>
                    {auditPlan.targets.map(target => (
                      <Chip key={target} size='sm' variant='outlined'>
                        {TARGET_LABELS[target]}
                      </Chip>
                    ))}
                  </Box>
                ) : (
                  <Typography level='body-xs' color='neutral'>בחר בדיקה כדי לראות את היקף הסריקה.</Typography>
                )}
                {estimatedDocuments !== null && auditPlan.targets.length ? (
                  <Typography level='body-xs' fontWeight={700}>
                    אומדן לפי הספירה האחרונה: כ־{estimatedDocuments.toLocaleString('he-IL')} מסמכים
                  </Typography>
                ) : null}
              </Box>
              <Button
                type='button'
                loading={busy}
                disabled={!selectedChecks.length}
                startDecorator={iconUi({ id: 'search', size: 'sm' })}
                onClick={runAudit}
                sx={{ alignSelf: 'flex-start' }}
              >
                {runButtonLabel}
              </Button>
              {error ? (
                <Box sx={sx.receiptsError}>
                  <Typography level='title-sm'>הסריקה נכשלה</Typography>
                  <Typography level='body-sm'>{error}</Typography>
                </Box>
              ) : null}
              </Stack>
            </InfoPanel>
          </Box>

          <InfoPanel
            sx={sx.panel}
          >
            {snapshot ? (
              <Stack spacing={0.75}>
                <Box sx={sx.systemSnapshotHeader}>
                  <Typography level='title-md' sx={sx.systemSnapshotTitle}>
                    הבדיקה האחרונה
                  </Typography>
                </Box>
                <Box sx={sx.systemSnapshotDate}>
                  <Typography level='body-xs'>נשמרה בדפדפן:</Typography>
                  <Typography level='title-sm'>{formatTime(snapshot.completedAt)}</Typography>
                </Box>
                <Box sx={sx.systemSnapshotMetrics}>
                  <Box sx={sx.systemMetric}>
                    <Typography level='body-xs'>מסמכים</Typography>
                    <Typography level='title-lg'>{checkedDocuments(snapshot.summary || {})}</Typography>
                  </Box>
                  <Box sx={sx.systemMetric}>
                    <Typography level='body-xs'>ממצאים</Typography>
                    <Typography level='title-lg'>{snapshot.findingsCount}</Typography>
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Box sx={sx.emptySummary}>
                <Typography level='title-md'>הבדיקה האחרונה</Typography>
                <Typography level='title-sm'>טרם בוצעה בדיקה כוללת</Typography>
                <Typography level='body-xs'>לא תתבצע קריאה עד לאישור והפעלה.</Typography>
              </Box>
            )}
          </InfoPanel>
        </Box>

        {busy ? (
          <InfoPanel title='בדיקת התקינות מתבצעת' sx={sx.panel}>
            <Box sx={sx.auditBusy}>
              <CircularProgress />
              <Typography level='body-sm'>קורא את הקולקשיינים ומשווה קשרים...</Typography>
            </Box>
          </InfoPanel>
        ) : null}

        {result ? (
          <InfoPanel
            title='תוצאות הבדיקה'
            actions={(
              <Stack direction='row' spacing={0.75} sx={sx.resultHeaderActions}>
                <Chip size='sm' variant='soft' color={findings.length ? 'warning' : 'success'}>
                  {findings.length} ממצאים
                </Chip>
                <Button
                  type='button'
                  size='sm'
                  variant='outlined'
                  startDecorator={iconUi({ id: 'download', size: 'sm' })}
                  onClick={() => downloadDataOpsJson({
                    fileName: `players-database-system-audit-${new Date().toISOString().slice(0, 10)}.json`,
                    data: result,
                  })}
                >
                  ייצוא JSON
                </Button>
              </Stack>
            )}
            sx={sx.panel}
          >
            <Stack spacing={1.25}>
              <Box sx={sx.systemResultSource(resultSource === 'cache')}>
                <Box sx={sx.systemResultSourceIcon}>
                  {iconUi({ id: resultSource === 'cache' ? 'warning' : 'info', size: 'sm' })}
                </Box>
                <Box sx={sx.systemResultSourceCopy}>
                  <Typography level='title-sm'>
                    {resultSource === 'cache'
                      ? 'התוצאות נטענו מהמטמון בדפדפן'
                      : 'התוצאות התקבלו מבדיקה חדשה בזיכרון המסך'}
                  </Typography>
                  <Typography level='body-xs'>
                    {resultSource === 'cache'
                      ? 'לא בוצעה קריאה חדשה מהמאגר. לפני ניקוי יש להריץ בדיקה חדשה.'
                      : 'הנתונים נקראו מהמאגר במהלך השימוש הנוכחי ונשמרו גם בדפדפן.'}
                  </Typography>
                </Box>
                <Chip
                  size='sm'
                  variant='soft'
                  color={resultSource === 'cache' ? 'warning' : 'primary'}
                >
                  {resultSource === 'cache' ? 'מטמון' : 'בדיקה נוכחית'}
                </Chip>
              </Box>

              <Box sx={[sx.auditResultSummary, sx.systemResultToolbar]}>
                <Box>
                  <Typography level='title-md'>{checkedDocuments(summary)} מסמכים נבדקו</Typography>
                  <Typography level='body-xs'>
                    כיסוי: {result.coverage && result.coverage.complete
                      ? 'כל הקולקשיינים'
                      : 'מלא לבדיקות שנבחרו'}
                  </Typography>
                </Box>
                {findings.length ? (
                  <Box className='dpScrollThin' sx={sx.systemFindingFilters} aria-label='סינון ממצאים'>
                    {findingFilters.map(filter => {
                      const selected = findingFilter === filter.id
                      return (
                        <Button
                          key={filter.id}
                          type='button'
                          size='sm'
                          variant={selected ? 'solid' : 'outlined'}
                          color={selected ? 'primary' : 'neutral'}
                          aria-pressed={selected}
                          onClick={() => {
                            setFindingFilter(filter.id)
                            setVisibleFindings(40)
                          }}
                          sx={sx.systemFindingFilter}
                        >
                          <span>{filter.label}</span>
                          <Box component='span' sx={sx.systemFindingFilterCount(selected)}>
                            {filter.count}
                          </Box>
                        </Button>
                      )
                    })}
                  </Box>
                ) : null}
                <Chip size='sm' variant='soft' color={findings.length ? 'warning' : 'success'}>
                  {result.result}
                </Chip>
              </Box>

              {deletedCount ? (
                <Box sx={sx.cleanState}>
                  {iconUi({ id: 'check', size: 'md' })}
                  <Typography level='body-sm'>{deletedCount} קשרים או תוצרים יתומים נוקו, והסריקה הורצה מחדש.</Typography>
                </Box>
              ) : null}

              {cleanupCandidates.length ? (
                <Box sx={sx.cleanupActions}>
                  <Box>
                    <Typography level='title-sm'>נמצאו {cleanupCandidates.length} ממצאים בטוחים לניקוי</Typography>
                    <Typography level='body-xs'>הניקוי מוחק SearchIndex יתום או מסיר קשר קבוצה יתום מ־Player Season. מסמך העונה נמחק רק אם לא נשארה בו קבוצה.</Typography>
                  </Box>
                  <Button
                    type='button'
                    size='sm'
                    variant='outlined'
                    onClick={() => {
                      setSelectedCandidates(cleanupCandidates.slice(0, 400).map(getSystemCleanupCandidateKey))
                      setDeleteConfirmed(false)
                    }}
                  >
                    {cleanupCandidates.length > 400 ? 'בחר 400 ראשונים' : 'בחר את כל הבטוחים'}
                  </Button>
                </Box>
              ) : null}

              {selectedCandidates.length ? (
                <Box sx={sx.cleanupDeletePanel}>
                  <Checkbox
                    checked={deleteConfirmed}
                    disabled={deleting}
                    label={`אני מאשר לנקות ${selectedCandidates.length} ממצאים יתומים`}
                    onChange={event => setDeleteConfirmed(event.target.checked)}
                  />
                  <Button
                    type='button'
                    color='danger'
                    loading={deleting}
                    disabled={!deleteConfirmed}
                    onClick={deleteSelected}
                  >
                    נקה והריץ בדיקה חוזרת
                  </Button>
                </Box>
              ) : null}

              {deleteError ? <Typography level='body-sm' color='danger'>{deleteError}</Typography> : null}

              {findings.length ? (
                <Box sx={sx.systemFindingsGrid}>
                  {filteredFindings.slice(0, visibleFindings).map((finding, index) => {
                    const displayImpact = getFindingDisplayImpact(finding)
                    return (
                      <Box key={`${finding.type}-${finding.documentId}-${index}`} sx={sx.systemFindingCard(displayImpact.tone)}>
                      <Box sx={sx.findingTop}>
                        <Box sx={sx.findingMain}>
                          {cleanupKeys.has(getSystemCleanupCandidateKey(finding)) ? (
                            <Checkbox
                              checked={selectedCandidates.includes(getSystemCleanupCandidateKey(finding))}
                              disabled={deleting}
                              onChange={() => toggleCandidate(finding)}
                            />
                          ) : null}
                          <Box sx={sx.findingCopy}>
                            <Typography level='title-sm'>{finding.title || finding.type}</Typography>
                            <Typography component='code' level='body-xs' sx={sx.systemFindingDocumentId}>
                              {finding.documentId || 'מסמך לא ידוע'}
                            </Typography>
                          </Box>
                        </Box>
                        <Stack direction='row' spacing={0.5} sx={sx.findingTags}>
                          {cleanupKeys.has(getSystemCleanupCandidateKey(finding)) ? (
                            <Chip size='sm' variant='soft' color='success'>בטוח לניקוי</Chip>
                          ) : null}
                          <Chip
                            size='sm'
                            variant='soft'
                            color={displayImpact.tone === 'neutral' ? 'neutral' : 'warning'}
                          >
                            {TARGET_LABELS[finding.target] || finding.target}
                          </Chip>
                        </Stack>
                      </Box>
                      <Box sx={sx.systemFindingContent}>
                        <Box>
                          <Typography level='body-xs' fontWeight={700}>מידע נוסף</Typography>
                          <Typography sx={sx.systemFindingText}>
                            {finding.reason || 'לא נשמר הסבר נוסף.'}
                          </Typography>
                        </Box>
                        <Box sx={sx.systemFindingImpact(displayImpact.tone)}>
                          <Typography level='body-xs' fontWeight={800}>
                            השפעה על התצוגה · {displayImpact.label}
                          </Typography>
                          <Typography sx={sx.systemFindingText}>{displayImpact.text}</Typography>
                        </Box>
                        <Box sx={sx.systemFindingAction}>
                          <Typography level='body-xs' fontWeight={700}>פעולה מומלצת</Typography>
                          <Typography sx={sx.systemFindingText}>
                            {finding.recommendedAction || 'יש לבדוק את מסמך המקור לפני ביצוע תיקון.'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={[sx.findingFooter, sx.systemFindingFooter]}>
                        <Typography sx={sx.sourceLabel}>{finding.owner ? `אחריות: ${finding.owner}` : 'בדיקת הקשר נדרשת'}</Typography>
                        <Button size='sm' variant='outlined' onClick={() => setSelectedFinding(finding)}>
                          פרטים מלאים
                        </Button>
                      </Box>
                      </Box>
                    )
                  })}
                </Box>
              ) : (
                <Box sx={sx.cleanState}>
                  {iconUi({ id: 'check', size: 'md' })}
                  <Box>
                    <Typography level='title-sm'>לא נמצאו פערים</Typography>
                    <Typography level='body-xs'>המאגר תקין ביחס להיקף שנבדק.</Typography>
                  </Box>
                </Box>
              )}
              {filteredFindings.length > visibleFindings ? (
                <Button
                  type='button'
                  size='sm'
                  variant='plain'
                  onClick={() => setVisibleFindings(value => value + 40)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  הצג עוד ממצאים
                </Button>
              ) : null}
            </Stack>
          </InfoPanel>
        ) : null}
        <FindingDetailsDialog
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
    </Stack>
  )
}
