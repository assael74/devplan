// src/features/playersDatabase/ui/components/modals/PlayerDatabaseAuditModal.js

import * as React from 'react'
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy'

import {
  AUDIT_COLLECTION_SCOPE,
  AUDIT_ISSUE_CATEGORY,
  AUDIT_RELATION_LABELS,
  AUDIT_RELATION_SCOPE,
  AUDIT_SCOPE_LABELS,
  AUDIT_SCOPE_TYPE,
  buildAuditCollectionScope,
  buildAuditRelationsScope,
  buildAuditTeamSeasonScope,
  getLastWriteAuditScope,
} from '../../../services/audit/index.js'
import RegularModal from './RegularModal.js'

const CATEGORY_LABELS = Object.freeze({
  [AUDIT_ISSUE_CATEGORY.STRUCTURE]: 'מבנה המסמכים',
  [AUDIT_ISSUE_CATEGORY.IDENTITY]: 'זהות המסמכים',
  [AUDIT_ISSUE_CATEGORY.COMPUTED_STATE]: 'מצב מחושב',
  [AUDIT_ISSUE_CATEGORY.RELATION]: 'קשרים בין הנתונים',
  [AUDIT_ISSUE_CATEGORY.OTHER]: 'בדיקות נוספות',
})

const COLLECTION_LABELS = Object.freeze({
  dbLeagues: 'מסמכי ליגה',
  dbBirthTeams: 'מסמכי קבוצות',
  dbPlayers: 'מסמכי שחקנים',
  dbSearchIndexes: 'אינדקסי חיפוש',
})

const ISSUE_PAGE_SIZE = 40

const formatIssueValue = value => {
  if (value === undefined) return 'לא קיים'
  if (value === null) return 'ריק'
  if (typeof value === 'string') return value || 'ריק'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  try {
    const serialized = JSON.stringify(value)
    if (!serialized) return String(value)
    return serialized.length > 260
      ? `${serialized.slice(0, 257)}...`
      : serialized
  } catch (error) {
    return String(value)
  }
}

const resolveIssueDocumentLabel = issue => {
  const documentIds = Array.isArray(issue?.documentIds)
    ? issue.documentIds.filter(Boolean)
    : []
  const primaryId = clean(
    issue?.documentId ||
    issue?.searchIndexDocumentId ||
    issue?.playerDocumentId ||
    issue?.teamDocumentId
  )
  const ids = primaryId
    ? [primaryId, ...documentIds.filter(id => id !== primaryId)]
    : documentIds

  if (!ids.length) return 'ללא מזהה מסמך'
  return ids.join(' · ')
}

const resolveIssueCollectionLabel = issue => {
  const collection = clean(issue?.collection)
  if (collection && COLLECTION_LABELS[collection]) {
    return COLLECTION_LABELS[collection]
  }

  const collections = Array.isArray(issue?.collections)
    ? issue.collections.map(clean).filter(Boolean)
    : []

  if (collections.length) {
    return collections
      .map(item => COLLECTION_LABELS[item] || item)
      .join(' ↔ ')
  }

  return 'נתונים'
}

const getIssueFieldDetails = issue => {
  const details = issue?.sourceIssue?.fieldDetails
  return Array.isArray(details) ? details : []
}

const hasComparableIssueValues = issue => (
  issue?.expected !== null ||
  issue?.actual !== null
)

const COLLECTION_SCOPES = [
  AUDIT_COLLECTION_SCOPE.LEAGUES,
  AUDIT_COLLECTION_SCOPE.TEAMS,
  AUDIT_COLLECTION_SCOPE.PLAYERS,
  AUDIT_COLLECTION_SCOPE.TEAM_INDEXES,
  AUDIT_COLLECTION_SCOPE.PLAYER_INDEXES,
]

const RELATION_SCOPES = Object.values(AUDIT_RELATION_SCOPE)
const LAST_WRITE_MODE = 'lastWrite'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const buildScopeFromMode = ({
  mode,
  teamDocumentId,
  seasonKey,
  relationId,
  lastWriteScope,
} = {}) => {
  if (mode === LAST_WRITE_MODE && lastWriteScope) {
    return lastWriteScope
  }

  if (COLLECTION_SCOPES.includes(mode)) {
    return buildAuditCollectionScope(mode)
  }

  if (mode === AUDIT_SCOPE_TYPE.TEAM_SEASON) {
    return buildAuditTeamSeasonScope({
      teamDocumentId,
      seasonKey,
    })
  }

  if (mode === AUDIT_SCOPE_TYPE.RELATIONS) {
    return buildAuditRelationsScope(relationId)
  }

  return {
    type: AUDIT_SCOPE_TYPE.FULL_SYSTEM,
  }
}

const countIssuesByCategory = issues => {
  const counts = new Map()

  ;(Array.isArray(issues) ? issues : []).forEach(issue => {
    const category = clean(issue?.category) || AUDIT_ISSUE_CATEGORY.OTHER
    counts.set(category, Number(counts.get(category) || 0) + 1)
  })

  return [...counts.entries()]
}

export default function PlayerDatabaseAuditModal({
  open = false,
  busy = false,
  error = '',
  result = null,
  repairPlan = null,
  applyResult = null,
  defaultTeamDocumentId = '',
  defaultSeasonKey = '',
  onRun,
  onPrepareRepair,
  onApplyRepair,
  onClose,
}) {
  const [mode, setMode] = React.useState(AUDIT_COLLECTION_SCOPE.PLAYERS)
  const [teamDocumentId, setTeamDocumentId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('')
  const [relationId, setRelationId] = React.useState('')
  const [lastWriteScope, setLastWriteScope] = React.useState(null)
  const [issueCategory, setIssueCategory] = React.useState('all')
  const [visibleIssuesCount, setVisibleIssuesCount] = React.useState(ISSUE_PAGE_SIZE)

  React.useEffect(() => {
    if (!open) return

    setTeamDocumentId(clean(defaultTeamDocumentId))
    setSeasonKey(clean(defaultSeasonKey))
    setLastWriteScope(getLastWriteAuditScope())
    setIssueCategory('all')
    setVisibleIssuesCount(ISSUE_PAGE_SIZE)
  }, [
    defaultSeasonKey,
    defaultTeamDocumentId,
    open,
  ])

  const teamScopeSelected = mode === AUDIT_SCOPE_TYPE.TEAM_SEASON
  const relationScopeSelected = mode === AUDIT_SCOPE_TYPE.RELATIONS
  const teamScopeValid = Boolean(clean(teamDocumentId) && clean(seasonKey))
  const runDisabled = teamScopeSelected && !teamScopeValid
  const issues = Array.isArray(result?.issues) ? result.issues : []
  const categoryCounts = countIssuesByCategory(issues)
  const filteredIssues = issueCategory === 'all'
    ? issues
    : issues.filter(issue => issue?.category === issueCategory)
  const visibleIssues = filteredIssues.slice(0, visibleIssuesCount)
  const hiddenIssuesCount = Math.max(0, filteredIssues.length - visibleIssues.length)

  React.useEffect(() => {
    setVisibleIssuesCount(ISSUE_PAGE_SIZE)
  }, [issueCategory, result?.generatedAt])

  const handleRun = () => {
    if (busy || runDisabled) return

    onRun?.(buildScopeFromMode({
      mode,
      teamDocumentId,
      seasonKey,
      relationId,
      lastWriteScope,
    }))
  }

  return (
    <RegularModal
      open={open}
      size='lg'
      busy={busy}
      disabled={runDisabled}
      persistent={busy}
      title='מצב הנתונים'
      description='בחר מה לבדוק. רק הנתונים שנדרשים להיקף שבחרת ייקראו מהמסד.'
      iconId='search'
      confirmLabel='בדוק עכשיו'
      confirmIconId='search'
      cancelLabel='סגור'
      onConfirm={handleRun}
      onClose={onClose}
    >
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Typography level='title-sm'>מסמכים בודדים</Typography>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {COLLECTION_SCOPES.map(scope => (
              <Button
                key={scope}
                size='sm'
                variant={mode === scope ? 'solid' : 'outlined'}
                onClick={() => setMode(scope)}
              >
                {AUDIT_SCOPE_LABELS[scope]}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography level='title-sm'>בדיקות ממוקדות</Typography>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {lastWriteScope ? (
              <Button
                size='sm'
                variant={mode === LAST_WRITE_MODE ? 'solid' : 'outlined'}
                onClick={() => setMode(LAST_WRITE_MODE)}
              >
                בדוק את העדכון האחרון
              </Button>
            ) : null}
            <Button
              size='sm'
              variant={mode === AUDIT_SCOPE_TYPE.TEAM_SEASON ? 'solid' : 'outlined'}
              onClick={() => setMode(AUDIT_SCOPE_TYPE.TEAM_SEASON)}
            >
              קבוצה ועונה
            </Button>
            <Button
              size='sm'
              variant={mode === AUDIT_SCOPE_TYPE.RELATIONS ? 'solid' : 'outlined'}
              onClick={() => setMode(AUDIT_SCOPE_TYPE.RELATIONS)}
            >
              קשרים בין הנתונים
            </Button>
            <Button
              size='sm'
              variant={mode === AUDIT_SCOPE_TYPE.FULL_SYSTEM ? 'solid' : 'outlined'}
              onClick={() => setMode(AUDIT_SCOPE_TYPE.FULL_SYSTEM)}
            >
              כל המערכת
            </Button>
          </Stack>
        </Stack>

        {relationScopeSelected ? (
          <Stack spacing={1}>
            <Typography level='body-sm'>בחר קשר לבדיקה. בחירה ממוקדת קוראת רק את האוספים שהקשר דורש.</Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              <Button
                size='sm'
                variant={!relationId ? 'solid' : 'outlined'}
                onClick={() => setRelationId('')}
              >
                כל הקשרים
              </Button>
              {RELATION_SCOPES.map(id => (
                <Button
                  key={id}
                  size='sm'
                  variant={relationId === id ? 'solid' : 'outlined'}
                  onClick={() => setRelationId(id)}
                >
                  {AUDIT_RELATION_LABELS[id]}
                </Button>
              ))}
            </Stack>
          </Stack>
        ) : null}

        {teamScopeSelected ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>מסמך קבוצה</FormLabel>
              <Input
                value={teamDocumentId}
                placeholder='מזהה מסמך הקבוצה'
                onChange={event => setTeamDocumentId(event.target.value)}
              />
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>עונה</FormLabel>
              <Input
                value={seasonKey}
                placeholder='לדוגמה: 25/26'
                onChange={event => setSeasonKey(event.target.value)}
              />
            </FormControl>
          </Stack>
        ) : null}

        {result ? (
          <Sheet variant='soft' sx={{ p: 2, borderRadius: 'md' }}>
            <Stack spacing={1.25}>
              <Typography level='title-md'>תוצאות הבדיקה</Typography>
              <Typography level='body-sm'>
                נבדקו {Number(result.checked || 0)} רשומות · נמצאו {Number(result.issuesCount || 0)} פערים · {Number(result.readsUsed || 0)} קריאות
              </Typography>

              {categoryCounts.length ? (
                <Stack spacing={0.5}>
                  {categoryCounts.map(([category, count]) => (
                    <Typography key={category} level='body-sm'>
                      {CATEGORY_LABELS[category] || CATEGORY_LABELS.other}: {count}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography level='body-sm'>לא נמצאו פערים בהיקף שנבדק.</Typography>
              )}

              {issues.length ? (
                <Stack spacing={1.25} sx={{ mt: 0.75 }}>
                  <Divider />
                  <Stack
                    direction='row'
                    spacing={0.75}
                    flexWrap='wrap'
                    useFlexGap
                    alignItems='center'
                  >
                    <Typography level='title-sm'>פירוט הפערים</Typography>
                    <Button
                      size='sm'
                      variant={issueCategory === 'all' ? 'solid' : 'outlined'}
                      onClick={() => setIssueCategory('all')}
                    >
                      הכול ({issues.length})
                    </Button>
                    {categoryCounts.map(([category, count]) => (
                      <Button
                        key={category}
                        size='sm'
                        variant={issueCategory === category ? 'solid' : 'outlined'}
                        onClick={() => setIssueCategory(category)}
                      >
                        {CATEGORY_LABELS[category] || CATEGORY_LABELS.other} ({count})
                      </Button>
                    ))}
                  </Stack>

                  <Stack
                    spacing={1}
                    sx={{
                      maxHeight: 430,
                      overflowY: 'auto',
                      pr: 0.5,
                    }}
                  >
                    {visibleIssues.map((issue, issueIndex) => {
                      const fieldDetails = getIssueFieldDetails(issue)
                      const collectionLabel = resolveIssueCollectionLabel(issue)
                      const documentLabel = resolveIssueDocumentLabel(issue)

                      return (
                        <Sheet
                          key={issue.issueId || `${issue.type}-${issueIndex}`}
                          variant='outlined'
                          sx={{ p: 1.25, borderRadius: 'sm' }}
                        >
                          <Stack spacing={0.65}>
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={0.75}
                              justifyContent='space-between'
                            >
                              <Typography level='title-sm'>
                                {issue.title || 'נמצא פער בנתונים'}
                              </Typography>
                              <Typography level='body-xs'>
                                {CATEGORY_LABELS[issue.category] || CATEGORY_LABELS.other}
                              </Typography>
                            </Stack>

                            <Typography level='body-xs'>
                              {collectionLabel} · מסמך: {documentLabel}
                              {issue.seasonKey ? ` · עונה: ${issue.seasonKey}` : ''}
                            </Typography>

                            {issue.explanation ? (
                              <Typography level='body-sm'>
                                {issue.explanation}
                              </Typography>
                            ) : null}

                            {fieldDetails.length ? (
                              <Stack spacing={0.6}>
                                {fieldDetails.map((field, fieldIndex) => (
                                  <Sheet
                                    key={`${field.path || 'field'}-${fieldIndex}`}
                                    variant='soft'
                                    sx={{ p: 0.9, borderRadius: 'sm' }}
                                  >
                                    <Stack spacing={0.25}>
                                      <Typography level='body-sm'>
                                        שדה: {field.path || 'לא ידוע'}
                                      </Typography>
                                      <Typography level='body-xs'>
                                        קיים: {formatIssueValue(field.actualValue)}
                                        {field.actualType ? ` (${field.actualType})` : ''}
                                      </Typography>
                                      <Typography level='body-xs'>
                                        נדרש: {formatIssueValue(field.expectedValue)}
                                        {field.expectedType ? ` (${field.expectedType})` : ''}
                                      </Typography>
                                      {field.repairLabel ? (
                                        <Typography level='body-xs'>
                                          {field.repairLabel}
                                        </Typography>
                                      ) : null}
                                    </Stack>
                                  </Sheet>
                                ))}
                              </Stack>
                            ) : hasComparableIssueValues(issue) ? (
                              <Stack spacing={0.25}>
                                <Typography level='body-xs'>
                                  קיים: {formatIssueValue(issue.actual)}
                                </Typography>
                                <Typography level='body-xs'>
                                  נדרש: {formatIssueValue(issue.expected)}
                                </Typography>
                              </Stack>
                            ) : null}
                          </Stack>
                        </Sheet>
                      )
                    })}
                  </Stack>

                  {hiddenIssuesCount > 0 ? (
                    <Button
                      size='sm'
                      variant='plain'
                      onClick={() => setVisibleIssuesCount(value => (
                        value + ISSUE_PAGE_SIZE
                      ))}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      הצג עוד ({hiddenIssuesCount} נותרו)
                    </Button>
                  ) : null}

                  <Button
                    size='sm'
                    variant='outlined'
                    disabled={busy}
                    onClick={onPrepareRepair}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    הכן תיקון
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Sheet>
        ) : null}

        {repairPlan ? (
          <Sheet variant='outlined' sx={{ p: 2, borderRadius: 'md' }}>
            <Stack spacing={0.75}>
              <Typography level='title-md'>תוכנית תיקון</Typography>
              <Typography level='body-sm'>
                ניתנים לתיקון אוטומטי: {Number(repairPlan.summary?.automaticCount || 0)}
              </Typography>
              <Typography level='body-sm'>
                דורשים בדיקה: {Number(repairPlan.summary?.reviewCount || 0)}
              </Typography>
              <Typography level='body-sm'>
                לדיווח בלבד: {Number(repairPlan.summary?.reportCount || 0)}
              </Typography>
              <Typography level='body-sm'>
                מסמכים עם יעד כתיבה מזוהה: {Number(repairPlan.summary?.targetDocumentsCount || 0)}
              </Typography>
              <Typography level='body-sm'>
                קריאות ידועות לפחות: {Number(repairPlan.summary?.knownReadsMinimum || 0)}
              </Typography>
              <Typography level='body-sm'>
                כתיבות ידועות לכל היותר: {Number(repairPlan.summary?.knownWritesMaximum || 0)}
              </Typography>
              {repairPlan.summary?.hasUnknownCost ? (
                <Typography level='body-xs'>
                  העלות המדויקת תיקבע לפני ביצוע התיקון. לא בוצעה כתיבה בשלב זה.
                </Typography>
              ) : (
                <Typography level='body-xs'>
                  לא בוצעה כתיבה בשלב זה.
                </Typography>
              )}
              {Number(repairPlan.summary?.automaticCount || 0) > 0 ? (
                <Button
                  size='sm'
                  variant='solid'
                  disabled={busy}
                  onClick={onApplyRepair}
                  sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                >
                  בצע תיקון אוטומטי
                </Button>
              ) : null}
            </Stack>
          </Sheet>
        ) : null}

        {applyResult ? (
          <Sheet variant='soft' sx={{ p: 2, borderRadius: 'md' }}>
            <Stack spacing={0.75}>
              <Typography level='title-md'>תוצאת התיקון</Typography>
              <Typography level='body-sm'>
                מסמכים ששונו: {Number(applyResult.changedDocumentsCount || 0)}
              </Typography>
              <Typography level='body-sm'>
                כבר היו תקינים: {Number(applyResult.alreadyCorrectCount || 0)}
              </Typography>
              <Typography level='body-sm'>
                קריאות שבוצעו: {Number(applyResult.reads || 0)} · כתיבות שבוצעו: {Number(applyResult.writes || 0)}
              </Typography>
              <Typography
                level='body-sm'
                color={applyResult.verification?.complete ? 'success' : 'danger'}
              >
                {applyResult.verification?.complete
                  ? 'האימות הממוקד הסתיים בהצלחה.'
                  : 'האימות הממוקד מצא פערים שעדיין דורשים בדיקה.'}
              </Typography>
              <Typography level='body-xs'>
                באימות נקראו רק מסמכים ששונו בפועל.
              </Typography>
            </Stack>
          </Sheet>
        ) : null}

        {error ? (
          <Typography level='body-sm' color='danger'>
            {error}
          </Typography>
        ) : null}
      </Stack>
    </RegularModal>
  )
}
