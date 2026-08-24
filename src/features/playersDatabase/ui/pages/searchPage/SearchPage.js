// src/features/playersDatabase/ui/pages/searchPage/SearchPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import SearchHeader from './SearchHeader.js'
import SearchWorkspace from './SearchWorkspace.js'
import useSearchPage from './hooks/useSearchPage.js'
import { useSearchReport } from './report/index.js'
import {
  PlayerScoutAuditModal,
  ReportNameModal,
} from '../../components/modals/index.js'
import {
  applyPlayerScoutGlobalDirectSearchIndexRepair,
  applyPlayerScoutGlobalRegularRepair,
  applyPlayerScoutGlobalSafeDependencyOverlapRepair,
  applyPlayerScoutGlobalSelectedOverlapRepair,
  applyPlayerScoutGlobalSelectedSafeRepair,
  applyPlayerScoutDocumentRewrite,
  applyPlayerScoutEngineRefresh,
  applyPlayerScoutRepair,
  applyInvalidTransferPlayerDocumentDelete,
  applyInvalidTransferPlayerSearchIndexCleanup,
  applyInvalidTransferPlayerTeamCleanup,
  buildInvalidTransferPlayerCleanupPreview,
  verifyInvalidTransferPlayerCleanup,
  applyOrphanPlayerDocumentDelete,
  applyOrphanPlayerDocumentSearchIndexCleanup,
  applyOrphanPlayerDocumentTeamCleanup,
  buildOrphanPlayerDocumentCleanupPreview,
  verifyOrphanPlayerDocumentCleanup,
  buildPlayerScoutDocumentRewritePreview,
  buildPlayerScoutEngineRefreshPreview,
  buildPlayerScoutGlobalRepairPreview,
  buildPlayerScoutSafeDependencyWriteBudgetPlan,
  buildPlayerScoutRepairPreview,
  buildPlayerScoutRulesAudit,
  buildPlayerScoutDataHealthAudit,
  buildScopedPlayerScoutRulesAudit,
  downloadPlayerScoutRulesAudit,
} from '../../../services/audit/index.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const getRowTeamDocumentId = row => clean(
  row?.teamDocumentId ||
  row?.birthTeamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)

const getRowSeasonKey = row => clean(
  row?.seasonKey ||
  row?.seasonId
)

const buildPartialAuditDefaults = rows => {
  const safeRows = Array.isArray(rows)
    ? rows
    : []

  const scopeKeys = [
    ...new Set(
      safeRows
        .map(row => {
          const teamDocumentId = getRowTeamDocumentId(row)
          const seasonKey = getRowSeasonKey(row)

          return teamDocumentId && seasonKey
            ? `${teamDocumentId}::${seasonKey}`
            : ''
        })
        .filter(Boolean)
    ),
  ]

  if (scopeKeys.length !== 1) {
    return {
      teamDocumentId: '',
      seasonKey: '',
    }
  }

  const [teamDocumentId, seasonKey] = scopeKeys[0].split('::')

  return {
    teamDocumentId,
    seasonKey,
  }
}

const assertFullGlobalAuditLoaded = result => {
  if (!result || result.mode !== 'read-only') {
    throw new Error('בדיקת המערכת המלאה לא החזירה תוצאת Global Audit תקינה')
  }

  const observed = result?.cost?.audit?.documentsObserved || {}
  const observedDocumentsCount = (
    Number(observed.teamDocuments || 0) +
    Number(observed.playerDocuments || 0) +
    Number(observed.playerDocumentLookups || 0) +
    Number(observed.playerSearchIndexes || 0) +
    Number(observed.teamSearchIndexes || 0)
  )
  const readsUsed = Number(result?.cost?.audit?.reads?.total || 0)

  if (
    observedDocumentsCount === 0 &&
    readsUsed <= 4
  ) {
    throw new Error(
      'בדיקת המערכת המלאה החזירה dataset ריק עם מספר קריאות מינימלי. לא ניתן להשתמש בתוצאה הזו.'
    )
  }

  if (
    Number(observed.teamDocuments || 0) > 0 &&
    Number(observed.playerDocuments || 0) === 0
  ) {
    throw new Error(
      'בדיקת המערכת המלאה לא קראה את מסמכי השחקנים. לא ניתן לבנות Preview גלובלי מתוצאה חלקית.'
    )
  }
}

const getVerifiedSelectedIssueIds = result => unique(
  result?.verificationCoverage?.verifiedIssueIds
)

const INVALID_TRANSFER_CLEANUP_BASELINE = Object.freeze({
  candidateCount: 709,
  teamDocumentsAffected: 42,
  teamPlayerReferencesToClear: 801,
  searchIndexDocumentsToDelete: 801,
  expectedPlayerDocumentsAfterDelete: 371,
})

const buildInvalidTransferCleanupGate = preview => {
  if (!preview) {
    return {
      ready: false,
      mismatches: ['לא קיימת תצוגה מקדימה'],
    }
  }

  const mismatches = Object.entries(INVALID_TRANSFER_CLEANUP_BASELINE)
    .filter(([field, expected]) => Number(preview?.[field] || 0) !== expected)
    .map(([field, expected]) => (
      `${field}: צפוי ${expected}, בפועל ${Number(preview?.[field] || 0)}`
    ))

  return {
    ready: mismatches.length === 0,
    mismatches,
  }
}

const ORPHAN_PLAYER_CLEANUP_BASELINE = Object.freeze({
  candidateCount: 65,
  expectedPlayerDocumentsAfterDelete: 306,
})

const buildPlayerCleanupTargetFingerprint = playerDocumentIds => (
  JSON.stringify(
    unique(playerDocumentIds)
      .sort()
  )
)

const buildOrphanPlayerCleanupGate = (
  preview,
  {
    allowLegacyTeamScope = false,
    resolvedTeamScope = null,
  } = {}
) => {
  if (!preview) {
    return {
      ready: false,
      mismatches: ['לא קיימת תצוגה מקדימה'],
    }
  }

  const mismatches = Object.entries(ORPHAN_PLAYER_CLEANUP_BASELINE)
    .filter(([field, expected]) => Number(preview?.[field] || 0) !== expected)
    .map(([field, expected]) => (
      `${field}: צפוי ${expected}, בפועל ${Number(preview?.[field] || 0)}`
    ))

  if (
    !Array.isArray(preview?.playerDocumentIds) ||
    preview.playerDocumentIds.length !== ORPHAN_PLAYER_CLEANUP_BASELINE.candidateCount
  ) {
    mismatches.push('רשימת מסמכי היעד אינה תואמת ל-65 המועמדים המאושרים')
  }

  const targetFingerprint = clean(preview?.targetFingerprint)
  const expectedFingerprint = buildPlayerCleanupTargetFingerprint(
    preview?.playerDocumentIds
  )
  const resolvedTeamDocumentIds = Array.isArray(
    resolvedTeamScope?.teamDocumentIdsAffected
  )
    ? resolvedTeamScope.teamDocumentIdsAffected
    : []
  const resolvedTeamFingerprint = clean(
    resolvedTeamScope?.teamDocumentIdsAffectedFingerprint
  )
  const teamDocumentIdsAffected = resolvedTeamDocumentIds.length
    ? resolvedTeamDocumentIds
    : (
        Array.isArray(preview?.teamDocumentIdsAffected)
          ? preview.teamDocumentIdsAffected
          : []
      )
  const teamDocumentIdsAffectedFingerprint =
    resolvedTeamFingerprint ||
    clean(preview?.teamDocumentIdsAffectedFingerprint)
  const expectedTeamDocumentIdsFingerprint =
    buildPlayerCleanupTargetFingerprint(teamDocumentIdsAffected)

  if (!targetFingerprint) {
    mismatches.push('targetFingerprint חסר')
  } else if (targetFingerprint !== expectedFingerprint) {
    mismatches.push('targetFingerprint אינו תואם לרשימת מסמכי היעד')
  }

  const hasLockedTeamScope = (
    teamDocumentIdsAffected.length > 0 &&
    Boolean(teamDocumentIdsAffectedFingerprint)
  )

  if (!allowLegacyTeamScope || hasLockedTeamScope) {
    if (
      teamDocumentIdsAffected.length !==
      Number(preview?.teamDocumentsAffected || 0)
    ) {
      mismatches.push('רשימת מסמכי הקבוצה אינה תואמת ל-Preview')
    }

    if (!teamDocumentIdsAffectedFingerprint) {
      mismatches.push('Team document fingerprint חסר')
    } else if (
      teamDocumentIdsAffectedFingerprint !==
      expectedTeamDocumentIdsFingerprint
    ) {
      mismatches.push('Team document fingerprint אינו תואם לרשימת מסמכי הקבוצה')
    }
  }

  return {
    ready: mismatches.length === 0,
    mismatches,
  }
}

const buildCleanupSteps = ({
  team = 'pending',
  searchIndex = 'pending',
  players = 'pending',
  verification = 'pending',
} = {}) => ({
  team,
  searchIndex,
  players,
  verification,
})

function SearchPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reportNameOpen, setReportNameOpen] = React.useState(false)
  const [scoutAuditOpen, setScoutAuditOpen] = React.useState(false)
  const [scoutAuditBusy, setScoutAuditBusy] = React.useState(false)
  const [scoutAuditError, setScoutAuditError] = React.useState('')
  const [scoutAudit, setScoutAudit] = React.useState(null)
  const [scoutRepairBusy, setScoutRepairBusy] = React.useState(false)
  const [scoutRepairPreview, setScoutRepairPreview] = React.useState(null)
  const [scoutRepairResult, setScoutRepairResult] = React.useState(null)
  const [engineRefreshPreview, setEngineRefreshPreview] = React.useState(null)
  const [engineRefreshResult, setEngineRefreshResult] = React.useState(null)
  const [documentRewritePreview, setDocumentRewritePreview] = React.useState(null)
  const [documentRewriteResult, setDocumentRewriteResult] = React.useState(null)
  const [globalAudit, setGlobalAudit] = React.useState(null)
  const [dataHealthResults, setDataHealthResults] = React.useState({})
  const [dataHealthBusyScope, setDataHealthBusyScope] = React.useState('')
  const [globalRepairPreview, setGlobalRepairPreview] = React.useState(null)
  const [globalDirectRepairResult, setGlobalDirectRepairResult] = React.useState(null)
  const [globalRegularRepairResult, setGlobalRegularRepairResult] = React.useState(null)
  const [globalSelectedRepairResult, setGlobalSelectedRepairResult] = React.useState(null)
  const [globalOverlapRepairResult, setGlobalOverlapRepairResult] = React.useState(null)
  const [globalResolvedIssueIds, setGlobalResolvedIssueIds] = React.useState([])
  const [globalDeferredIssueIds, setGlobalDeferredIssueIds] = React.useState([])
  const [invalidTransferCleanupPreview, setInvalidTransferCleanupPreview] =
    React.useState(null)
  const [invalidTransferCleanupRun, setInvalidTransferCleanupRun] =
    React.useState(null)
  const invalidTransferCleanupApplyLockRef = React.useRef(false)
  const [orphanPlayerCleanupPreview, setOrphanPlayerCleanupPreview] =
    React.useState(null)
  const [orphanPlayerCleanupRun, setOrphanPlayerCleanupRun] =
    React.useState(null)
  const orphanPlayerCleanupApplyLockRef = React.useRef(false)

  React.useEffect(() => {
    console.log(
      '[playersDatabase] Orphan cleanup target playerDocumentIds:',
      orphanPlayerCleanupPreview?.playerDocumentIds
    )
  }, [orphanPlayerCleanupPreview?.playerDocumentIds])

  const search = useSearchPage()

  const partialAuditDefaults = React.useMemo(
    () => buildPartialAuditDefaults(search.rows),
    [search.rows]
  )

  const searchReport = useSearchReport({
    rows: search.rows,
    queryFilters: search.queryFilters,
    queryActiveItems: search.queryActiveItems,
    resultFilters: search.resultFilters,
    summary: search.summary,
    loadedEntityType: search.loadedEntityType,
  })

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'חיפוש במאגר' },
  ])

  const handleEntityOpen = row => {
    const navigationState = {
      state: {
        from: `${location.pathname}${location.search}`,
        fromPage: 'search',
      },
    }

    if (row.entityType === 'birthTeamSeason') {
      navigate(
        PLAYERS_DATABASE_UI_ROUTES.team({
          leagueId: row.leagueId,
          teamId: row.birthTeamId || row.teamId || row.id,
          seasonKey: row.seasonKey,
        }),
        navigationState
      )
      return
    }

    navigate(
      PLAYERS_DATABASE_UI_ROUTES.player({
        playerId: row.playerDocumentId || row.id,
        seasonKey: row.seasonKey,
        teamId: row.teamId,
        leagueId: row.leagueId,
      }),
      navigationState
    )
  }

  const handleCreateReport = async reportDetails => {
    const published = await searchReport.publishAndOpen(reportDetails)

    if (published) {
      setReportNameOpen(false)
    }
  }

  const resetAuditActions = () => {
    setScoutAuditError('')
    setScoutRepairPreview(null)
    setScoutRepairResult(null)
    setEngineRefreshPreview(null)
    setEngineRefreshResult(null)
    setDocumentRewritePreview(null)
    setDocumentRewriteResult(null)
    setGlobalRepairPreview(null)
    setDataHealthResults({})
    setGlobalDirectRepairResult(null)
    setGlobalRegularRepairResult(null)
    setGlobalSelectedRepairResult(null)
    setGlobalOverlapRepairResult(null)
  }

  const buildRegularPreviewTelemetry = ({ preview, deferredIssueIds = [] } = {}) => {
    const deferredIssueIdSet = new Set(deferredIssueIds)
    const regularDeferredIssueIds = [
      ...(Array.isArray(preview?.targetDocuments?.teams)
        ? preview.targetDocuments.teams
        : []),
      ...(Array.isArray(preview?.targetDocuments?.players)
        ? preview.targetDocuments.players
        : []),
      ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
        ? preview.targetDocuments.searchIndexes
        : []),
    ]
      .filter(target => {
        const repairClasses = Array.isArray(target?.repairClasses)
          ? target.repairClasses
          : []

        return repairClasses.length === 1 && repairClasses[0] === 'regularRepair'
      })
      .flatMap(target => Array.isArray(target?.issueIds) ? target.issueIds : [])
      .filter(issueId => deferredIssueIdSet.has(issueId))

    return {
      ...(preview?.regularPreviewTelemetry || {}),
      regularIssuesDeferredCount: [...new Set(regularDeferredIssueIds)].length,
    }
  }

  const handleGlobalRepairPreview = async () => {
    if (scoutAuditBusy || scoutRepairBusy) return

    const confirmed = window.confirm(
      globalAudit?.mode === 'read-only'
        ? 'Global Preview ישתמש ב-Full Audit שכבר נטען כדי לבנות תצוגה מקדימה בלבד. לא יתבצעו קריאות Audit נוספות ולא יתבצעו כתיבות Firestore. להמשיך?'
        : 'Global Preview יקרא את מאגר הסקאוטינג המלא כדי לבנות תצוגה מקדימה בלבד. לא יתבצעו כתיבות Firestore. להמשיך?'
    )
    if (!confirmed) return

    setScoutAuditBusy(true)
    resetAuditActions()

    try {
      let sourceAudit = globalAudit?.mode === 'read-only'
        ? globalAudit
        : null
      let excludedIssueIds = globalResolvedIssueIds
      let deferredIssueIds = globalDeferredIssueIds

      if (!sourceAudit) {
        sourceAudit = await buildPlayerScoutRulesAudit({
          includeRepairData: true,
        })
        assertFullGlobalAuditLoaded(sourceAudit)
        setGlobalAudit(sourceAudit)
        setGlobalResolvedIssueIds([])
        setGlobalDeferredIssueIds([])
        excludedIssueIds = []
        deferredIssueIds = []
      }

      const result = await buildPlayerScoutGlobalRepairPreview({
        audit: sourceAudit,
        excludedIssueIds,
      })
      const regularPreviewTelemetry = buildRegularPreviewTelemetry({
        preview: result,
        deferredIssueIds,
      })
      console.log('[playersDatabase] Global regular preview diagnostics:', {
        regularIssuesByType: regularPreviewTelemetry.regularIssuesByType || {},
        regularTargetDocumentsByType:
          regularPreviewTelemetry.regularTargetDocumentsByType || {},
        regularPlayerDocumentIds:
          regularPreviewTelemetry.regularPlayerDocumentIds || [],
        playerDocumentsObserved:
          regularPreviewTelemetry.playerDocumentsObserved || 0,
        regularIssuesPreviouslyResolvedCount:
          regularPreviewTelemetry.regularIssuesPreviouslyResolvedCount || 0,
        regularIssuesDeferredCount:
          regularPreviewTelemetry.regularIssuesDeferredCount || 0,
        regularIssuesCount: regularPreviewTelemetry.regularIssuesCount || 0,
        regularTargetDocumentsCount:
          regularPreviewTelemetry.regularTargetDocumentsCount || 0,
      })
      setGlobalRepairPreview({
        ...result,
        regularPreviewTelemetry,
        deferredIssueIds,
        stale: false,
        staleReason: '',
      })
      setGlobalDirectRepairResult(null)
      setGlobalRegularRepairResult(null)
      setGlobalSelectedRepairResult(null)
      setGlobalOverlapRepairResult(null)
    } catch (error) {
      console.error('[playersDatabase] Global scout repair preview failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Global Repair Preview נכשל'
      )
    } finally {
      setScoutAuditBusy(false)
    }
  }

  const reconcileGlobalRepairResult = async ({
    result,
    staleReason,
  }) => {
    const nextResolvedIssueIds = unique([
      ...globalResolvedIssueIds,
      ...getVerifiedSelectedIssueIds(result),
    ])
    const nextDeferredIssueIds = unique([
      ...globalDeferredIssueIds,
      ...(Array.isArray(result?.verificationCoverage?.attemptedUnverifiedIssueIds)
        ? result.verificationCoverage.attemptedUnverifiedIssueIds
        : []),
    ]).filter(issueId => !nextResolvedIssueIds.includes(issueId))

    setGlobalResolvedIssueIds(nextResolvedIssueIds)
    setGlobalDeferredIssueIds(nextDeferredIssueIds)

    try {
      const nextPreview = await buildPlayerScoutGlobalRepairPreview({
        audit: globalAudit,
        excludedIssueIds: nextResolvedIssueIds,
      })
      const regularPreviewTelemetry = buildRegularPreviewTelemetry({
        preview: nextPreview,
        deferredIssueIds: nextDeferredIssueIds,
      })

      setGlobalRepairPreview({
        ...nextPreview,
        regularPreviewTelemetry,
        deferredIssueIds: nextDeferredIssueIds,
        stale: false,
        staleReason: '',
      })
      return true
    } catch (error) {
      console.error('[playersDatabase] Global repair reconcile failed:', error)
      setGlobalRepairPreview(current => (
        current
          ? {
              ...current,
              stale: true,
              staleReason,
            }
          : current
      ))
      setScoutAuditError(
        error instanceof Error
          ? `התיקון הושלם, אך עדכון ה-Preview נכשל: ${error.message}`
          : 'התיקון הושלם, אך עדכון ה-Preview נכשל'
      )
      return false
    }
  }

  const handleGlobalDirectRepairApply = async () => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !globalAudit ||
      !globalRepairPreview
    ) {
      return
    }

    const directCount = Number(
      globalRepairPreview?.safeRepairCandidates?.byClass?.directRepair?.documentsCount || 0
    )
    if (!directCount) return

    const confirmed = window.confirm(
      `לתקן ${directCount} מסמכי SearchIndex במסלול Direct בלבד וללא overlaps? הפעולה תבצע כתיבות Firestore רק למסמכי SearchIndex שנמצאים במסלול Direct יחיד.`
    )
    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutGlobalDirectSearchIndexRepair({
        confirmed: true,
        audit: globalAudit,
        globalPreview: globalRepairPreview,
        verifySelected: true,
      })
      setGlobalDirectRepairResult(result)
      await reconcileGlobalRepairResult({
        result,
        staleReason: 'global_direct_search_index_reconcile_failed',
      })
    } catch (error) {
      console.error('[playersDatabase] Global direct SearchIndex repair failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Global Direct SearchIndex Repair נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleGlobalRegularRepairApply = async ({
    maxDocuments = 5,
  } = {}) => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !globalAudit ||
      !globalRepairPreview
    ) {
      return
    }

    const normalizedMaxDocuments = maxDocuments === null
      ? null
      : Number.isFinite(Number(maxDocuments)) && Number(maxDocuments) > 0
        ? Math.floor(Number(maxDocuments))
        : 5
    const regularTargets = [
      ...(Array.isArray(globalRepairPreview?.targetDocuments?.teams)
        ? globalRepairPreview.targetDocuments.teams
        : []),
      ...(Array.isArray(globalRepairPreview?.targetDocuments?.players)
        ? globalRepairPreview.targetDocuments.players
        : []),
      ...(Array.isArray(globalRepairPreview?.targetDocuments?.searchIndexes)
        ? globalRepairPreview.targetDocuments.searchIndexes
        : []),
    ].filter(target => (
      Array.isArray(target?.repairClasses) &&
      target.repairClasses.length === 1 &&
      target.repairClasses[0] === 'regularRepair'
    ))
    const selectedTargets = normalizedMaxDocuments === null
      ? regularTargets
      : regularTargets.slice(0, normalizedMaxDocuments)
    const regularIssueIds = [
      ...new Set(
        selectedTargets
          .flatMap(target => Array.isArray(target?.issueIds) ? target.issueIds : [])
          .map(clean)
          .filter(Boolean)
      ),
    ]
    if (!selectedTargets.length || !regularIssueIds.length) return

    const confirmed = window.confirm(
      `לתקן Regular Repair ללא overlaps בלבד? ייבחרו ${regularIssueIds.length} issues על ${selectedTargets.length} מסמכים מתוך ${regularTargets.length}. הפעולה עשויה לכתוב Team/Player לפי ה-Preview, אבל לא תיגע במסמכי overlap.`
    )
    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutGlobalRegularRepair({
        confirmed: true,
        audit: globalAudit,
        globalPreview: globalRepairPreview,
        verifySelected: true,
        maxDocuments: normalizedMaxDocuments,
      })
      console.log('[playersDatabase] Global regular repair diagnostics:', {
        selectedIssueIds: result?.regularDiagnostics?.selectedIssueIds,
        selectedIssuesByType: result?.regularDiagnostics?.selectedIssuesByType,
        verificationCoverage: result?.regularDiagnostics?.verificationCoverage,
        verificationFailures: result?.regularDiagnostics?.verificationFailures,
        playerSchemaDiagnostics: result?.regularDiagnostics?.playerSchemaDiagnostics,
        writeSummary: result?.regularDiagnostics?.writeSummary,
        targetedVerification: result?.targetedVerification,
      })
      setGlobalRegularRepairResult(result)
      await reconcileGlobalRepairResult({
        result,
        staleReason: 'global_regular_repair_reconcile_failed',
      })
    } catch (error) {
      console.error('[playersDatabase] Global regular repair failed:', error)

      if (error?.playerScoutGlobalRepairPostWriteFailure === true) {
        setGlobalRepairPreview(current => (
          current
            ? {
                ...current,
                stale: true,
                staleReason: 'global_regular_repair_post_write_failure',
              }
            : current
        ))
      }

      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Global Regular Repair נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleGlobalSelectedRepairApply = async ({
    selectedIssueIds = [],
    repairClass = '',
    maxDocuments = 5,
    repairLabel = 'בחירה בטוחה',
  } = {}) => {
    if (scoutRepairBusy || scoutAuditBusy) {
      return
    }

    if (!globalRepairPreview) {
      setScoutAuditError('יש לבנות Global Preview לפני הפעלת תיקון נבחר.')
      return
    }

    if (!globalAudit || globalAudit.mode !== 'read-only') {
      setScoutAuditError(
        'Global Preview קיים אך ה-Full Audit שעליו הוא מבוסס אינו טעון בזיכרון. יש לבנות מחדש Global Preview לפני Apply.'
      )
      return
    }

    const safeSelectedIssueIds = Array.isArray(selectedIssueIds)
      ? selectedIssueIds.map(clean).filter(Boolean)
      : []
    const safeRepairClass = clean(repairClass)
    if (!safeSelectedIssueIds.length && !safeRepairClass) return

    const batchLabel = maxDocuments === null
      ? 'כל המסמכים הזמינים'
      : `עד ${Number(maxDocuments) > 0 ? Math.floor(Number(maxDocuments)) : 5} מסמכים`
    const confirmed = window.confirm(
      safeRepairClass
        ? `לתקן ${batchLabel} במסלול ${repairLabel}? בחירת מסמכי היעד תתבצע בשירות ולא תחרוג ממגבלת ה-batch.`
        : `לתקן ${safeSelectedIssueIds.length} issues במסלול ${repairLabel}? הפעולה לא תיגע במסמכי overlap ותשתמש ב-Repair הקיים עם selectedIssueIds.`
    )
    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutGlobalSelectedSafeRepair({
        confirmed: true,
        audit: globalAudit,
        globalPreview: globalRepairPreview,
        selectedIssueIds: safeSelectedIssueIds,
        repairClass: safeRepairClass,
        verifySelected: true,
        maxDocuments,
      })
      setGlobalSelectedRepairResult(result)
      await reconcileGlobalRepairResult({
        result,
        staleReason: 'global_selected_safe_repair_reconcile_failed',
      })
    } catch (error) {
      console.error('[playersDatabase] Global selected safe repair failed:', error)

      if (error?.playerScoutGlobalRepairPostWriteFailure === true) {
        setGlobalRepairPreview(current => (
          current
            ? {
                ...current,
                stale: true,
                staleReason: 'global_selected_safe_repair_post_write_failure',
              }
            : current
        ))
      }

      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Global Selected Repair נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleGlobalSafeDependencyOverlapRepairApply = async ({
    maxDocuments = 5,
  } = {}) => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !globalAudit ||
      !globalRepairPreview
    ) {
      return
    }

    const normalizedMaxDocuments = maxDocuments === null
      ? null
      : Number.isFinite(Number(maxDocuments)) && Number(maxDocuments) > 0
        ? Math.floor(Number(maxDocuments))
        : 5
    const maxWriteDocuments = 80
    const maxWriteOperations = 150

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const writeBudgetPlan = await buildPlayerScoutSafeDependencyWriteBudgetPlan({
        audit: globalAudit,
        preview: globalRepairPreview,
        maxDocuments: normalizedMaxDocuments,
        maxWriteDocuments,
        maxWriteOperations,
      })

      if (!writeBudgetPlan.selectedIssueIds.length) {
        console.log(
          '[playersDatabase] Safe dependency write budget diagnostics:',
          writeBudgetPlan
        )
        setScoutAuditError(
          writeBudgetPlan.skippedByWriteBudgetCount
            ? `אין Dependency batch שנכנס בתקציב הכתיבה הנוכחי: עד ${maxWriteDocuments} מסמכים ייחודיים ועד ${maxWriteOperations} פעולות כתיבה.`
            : 'אין כרגע Dependency issues בטוחים לתיקון.'
        )
        return
      }

      const breakdown = writeBudgetPlan.breakdown || {}
      const uniqueBreakdown = breakdown.uniqueDocuments || {}
      const operationBreakdown = breakdown.writeOperations || {}
      const confirmed = window.confirm(
        `לתקן ${writeBudgetPlan.selectedIssueIds.length} issues מתוך ${writeBudgetPlan.selectedDependencyTargets} מסמכי Dependency?\n\n` +
        `אומדן עליון לפני Apply:\n` +
        `${writeBudgetPlan.estimatedUniqueWriteDocuments} מסמכים ייחודיים ` +
        `(Team ${Number(uniqueBreakdown.teams || 0)}, Player ${Number(uniqueBreakdown.players || 0)}, SearchIndex ${Number(uniqueBreakdown.searchIndexes || 0)})\n` +
        `${writeBudgetPlan.estimatedWriteOperations} פעולות כתיבה ` +
        `(Repair ${Number(operationBreakdown.repair || 0)}, Engine ${Number(operationBreakdown.engine || 0)})\n\n` +
        `תקציב: עד ${writeBudgetPlan.maxWriteDocuments} מסמכים ייחודיים ועד ${writeBudgetPlan.maxWriteOperations} פעולות. ` +
        `זהו אומדן עליון; בפועל ייתכנו פחות כתיבות בגלל no_changes/missing. ` +
        `Regular/Migration ירוצו קודם, Engine אחריהם, ואז Verification ממוקד. לא יתבצע Global Audit נוסף.`
      )
      if (!confirmed) {
        invalidTransferCleanupApplyLockRef.current = false
        return
      }

      const result = await applyPlayerScoutGlobalSafeDependencyOverlapRepair({
        confirmed: true,
        audit: globalAudit,
        globalPreview: globalRepairPreview,
        verifySelected: true,
        maxDocuments: normalizedMaxDocuments,
        maxWriteDocuments,
        maxWriteOperations,
      })
      setGlobalOverlapRepairResult(result)
      await reconcileGlobalRepairResult({
        result,
        staleReason: 'global_safe_dependency_overlap_reconcile_failed',
      })
    } catch (error) {
      console.error('[playersDatabase] Global safe dependency overlap repair failed:', error)

      if (error?.playerScoutGlobalRepairPostWriteFailure === true) {
        setGlobalRepairPreview(current => (
          current
            ? {
                ...current,
                stale: true,
                staleReason: 'global_safe_dependency_overlap_post_write_failure',
              }
            : current
        ))
      }

      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Global Safe Dependency Overlap Repair נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleGlobalOverlapRepairApply = async ({
    selectedIssueIds = [],
  } = {}) => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !globalAudit ||
      !globalRepairPreview
    ) {
      return
    }

    const overlapSelectedIssueIds = Array.isArray(selectedIssueIds)
      ? selectedIssueIds.map(clean).filter(Boolean)
      : []
    if (!overlapSelectedIssueIds.length) return

    const confirmed = window.confirm(
      `לתקן ${overlapSelectedIssueIds.length} issues מתוך Overlap במסלול אחד לכל מסמך? הפעולה לא תערבב כמה סוגי Repair על אותו מסמך באותה ריצה.`
    )
    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutGlobalSelectedOverlapRepair({
        confirmed: true,
        audit: globalAudit,
        globalPreview: globalRepairPreview,
        selectedIssueIds: overlapSelectedIssueIds,
        verifySelected: true,
      })
      setGlobalOverlapRepairResult(result)
      await reconcileGlobalRepairResult({
        result,
        staleReason: 'global_overlap_selected_repair_reconcile_failed',
      })
    } catch (error) {
      console.error('[playersDatabase] Global overlap selected repair failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Global Overlap Selected Repair נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }


  const handleDataHealthRun = async scope => {
    if (scoutAuditBusy || scoutRepairBusy || dataHealthBusyScope) return

    const scopeLabels = {
      leagues: 'מסמכי הליגה',
      teams: 'מסמכי הקבוצות',
      players: 'מסמכי השחקנים',
      teamIndexes: 'אינדקסי הקבוצות',
      playerIndexes: 'אינדקסי השחקנים',
    }
    const scopeLabel = scopeLabels[scope] || 'האזור שנבחר'
    const confirmed = window.confirm(
      `הבדיקה תקרא את כל ${scopeLabel} ותיעצר לפני 49,000 קריאות. לא יתבצעו שינויים בדאטה. להמשיך?`
    )
    if (!confirmed) return

    setScoutAuditError('')
    setDataHealthBusyScope(scope)

    try {
      const result = await buildPlayerScoutDataHealthAudit({ scope })
      setDataHealthResults(current => ({
        ...current,
        [scope]: result,
      }))
    } catch (error) {
      console.error('[playersDatabase] Data health audit failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'בדיקת מצב הדאטה נכשלה'
      )
    } finally {
      setDataHealthBusyScope('')
    }
  }

  const handleScoutAuditFullRun = async () => {
    if (scoutAuditBusy || scoutRepairBusy) return

    const confirmed = window.confirm(
      'בדיקת מערכת מלאה עשויה לבצע אלפי קריאות Firestore. להמשיך בבדיקה בלבד? לא יתבצעו כתיבות.'
    )
    if (!confirmed) return

    setScoutAuditBusy(true)
    resetAuditActions()

    try {
      const result = await buildPlayerScoutRulesAudit({
        includeRepairData: true,
      })
      assertFullGlobalAuditLoaded(result)
      setGlobalAudit(result)
      setGlobalRepairPreview(null)
      setGlobalResolvedIssueIds([])
      setGlobalDeferredIssueIds([])
    } catch (error) {
      console.error('[playersDatabase] Full scout rules audit failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'בדיקת המערכת המלאה נכשלה'
      )
    } finally {
      setScoutAuditBusy(false)
    }
  }

  const handleScoutAuditPartialRun = async ({
    teamDocumentId,
    seasonKey,
  }) => {
    if (scoutAuditBusy || scoutRepairBusy) return

    const safeTeamDocumentId = clean(teamDocumentId)
    const safeSeasonKey = clean(seasonKey).replace(/\//g, '_')

    if (!safeTeamDocumentId || !safeSeasonKey) {
      setScoutAuditError(
        'לאודיט חלקי נדרשים מזהה מסמך קבוצה ועונה.'
      )
      return
    }

    setScoutAuditBusy(true)
    resetAuditActions()

    try {
      const result = await buildScopedPlayerScoutRulesAudit({
        teamDocumentId: safeTeamDocumentId,
        seasonKey: safeSeasonKey,
        includeRepairData: true,
      })
      setScoutAudit(result)
    } catch (error) {
      console.error('[playersDatabase] Partial scout rules audit failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'האודיט החלקי נכשל'
      )
    } finally {
      setScoutAuditBusy(false)
    }
  }

  const handleEngineRefreshPreview = async () => {
    if (scoutRepairBusy || scoutAuditBusy || !scoutAudit) return

    setScoutRepairBusy(true)
    setScoutAuditError('')
    setEngineRefreshResult(null)

    try {
      const result = buildPlayerScoutEngineRefreshPreview({
        audit: scoutAudit,
      })
      setEngineRefreshPreview(result)
    } catch (error) {
      console.error('[playersDatabase] Engine refresh preview failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'תצוגת Refresh Engine State נכשלה'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleEngineRefreshApply = async () => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !engineRefreshPreview ||
      !scoutAudit
    ) {
      return
    }

    const confirmed = window.confirm(
      'לרענן את מצב הסקאוטינג לפי הסדר: מסמכי קבוצה, מסמכי שחקן ואינדקס החיפוש? מידע אנושי והיסטוריית מדידות לא ישתנו.'
    )

    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutEngineRefresh({
        confirmed: true,
        audit: scoutAudit,
      })
      setEngineRefreshResult(result)
      setEngineRefreshPreview(null)
    } catch (error) {
      console.error('[playersDatabase] Engine refresh failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Refresh Engine State נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleScoutRepairPreview = async ({
    selectedIssueIds = [],
  } = {}) => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !scoutAudit
    ) {
      return
    }

    setScoutRepairBusy(true)
    setScoutAuditError('')
    setScoutRepairResult(null)

    try {
      const result = await buildPlayerScoutRepairPreview({
        audit: scoutAudit,
        selectedIssueIds,
      })
      setScoutRepairPreview(result)
    } catch (error) {
      console.error('[playersDatabase] Scout repair preview failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'תצוגת Repair נכשלה'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleScoutRepairApply = async () => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !scoutRepairPreview ||
      !scoutAudit
    ) {
      return
    }

    const confirmed = window.confirm(
      'לבצע Repair לפרופילי Scout לפי ה-Preview? הפעולה תבצע כתיבות ל-Firestore.'
    )

    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const selectedIssueIds = Array.isArray(
        scoutRepairPreview?.selection?.selectedIssueIds
      )
        ? scoutRepairPreview.selection.selectedIssueIds
        : []
      const result = await applyPlayerScoutRepair({
        confirmed: true,
        audit: scoutAudit,
        selectedIssueIds,
        verifySelected: true,
      })
      setScoutRepairResult(result)
      setScoutRepairPreview(null)
    } catch (error) {
      console.error('[playersDatabase] Scout repair failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Repair פרופילי Scout נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
      setScoutAuditBusy(false)
    }
  }

  const handleDocumentRewritePreview = () => {
    if (scoutRepairBusy || scoutAuditBusy || !scoutAudit) return

    setScoutAuditError('')
    setDocumentRewriteResult(null)

    try {
      setDocumentRewritePreview(
        buildPlayerScoutDocumentRewritePreview({
          audit: scoutAudit,
        })
      )
    } catch (error) {
      console.error('[playersDatabase] Document rewrite preview failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'תצוגת שכתוב המסמכים נכשלה'
      )
    }
  }

  const handleDocumentRewriteApply = async () => {
    if (
      scoutRepairBusy ||
      scoutAuditBusy ||
      !scoutAudit ||
      !documentRewritePreview
    ) {
      return
    }

    const confirmed = window.confirm(
      'לשכתב את מסמכי הקבוצה, השחקנים וה-SearchIndex לפי ה-Catalog הנוכחי? השכתוב יסיר שדות שאינם ב-direct document catalogs ויוסיף שדות חסרים. Apply אינו מבצע קריאות Firestore נוספות.'
    )

    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutDocumentRewrite({
        confirmed: true,
        audit: scoutAudit,
      })
      setDocumentRewriteResult(result)
      setDocumentRewritePreview(null)
    } catch (error) {
      console.error('[playersDatabase] Document rewrite failed:', error)
      const baseMessage = error instanceof Error
        ? error.message
        : 'שכתוב המסמכים נכשל'
      const batchDetails = Number.isFinite(error?.failedBatchIndex)
        ? ` | batch ${error.failedBatchIndex + 1} נכשל | ${Number(error.batchesCommitted || 0)} batches הושלמו | ${Number(error.writesCommitted || 0)} writes הושלמו`
        : ''
      setScoutAuditError(`${baseMessage}${batchDetails}`)
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleInvalidTransferCleanupPreview = async () => {
    if (scoutAuditBusy || scoutRepairBusy) return

    setScoutAuditBusy(true)
    setScoutAuditError('')

    try {
      const result = await buildInvalidTransferPlayerCleanupPreview()
      const gate = buildInvalidTransferCleanupGate(result)

      setInvalidTransferCleanupPreview({
        ...result,
        gate,
      })
      setInvalidTransferCleanupRun({
        status: gate.ready ? 'ready' : 'blocked',
        failedPhase: '',
        steps: buildCleanupSteps(),
        results: {},
        verification: null,
        error: gate.ready
          ? ''
          : `ה-Preview אינו תואם ל-baseline המאושר: ${gate.mismatches.join(' | ')}`,
      })
    } catch (error) {
      console.error(
        '[playersDatabase] Invalid transfer cleanup preview failed:',
        error
      )
      setInvalidTransferCleanupPreview(null)
      setInvalidTransferCleanupRun({
        status: 'error',
        failedPhase: 'preview',
        steps: buildCleanupSteps(),
        results: {},
        verification: null,
        error: error instanceof Error
          ? error.message
          : 'בדיקת ניקוי מסמכי TRANSFER נכשלה',
      })
    } finally {
      setScoutAuditBusy(false)
    }
  }

  const updateInvalidTransferCleanupStep = ({
    step,
    status,
    result,
    verification,
  } = {}) => {
    setInvalidTransferCleanupRun(current => ({
      ...(current || {}),
      status: status === 'failed' ? 'error' : 'running',
      failedPhase: status === 'failed' ? step : '',
      steps: {
        ...buildCleanupSteps(),
        ...(current?.steps || {}),
        [step]: status,
      },
      results: {
        ...(current?.results || {}),
        ...(result ? { [step]: result } : {}),
      },
      verification: verification || current?.verification || null,
    }))
  }

  const assertCleanupVerification = ({
    phase,
    verification,
    targetCount,
    expectedSearchIndexes,
  } = {}) => {
    const remainingPlayers = Number(
      verification?.remainingTargetPlayerDocuments || 0
    )
    const remainingTeamReferences = Number(
      verification?.remainingTeamPlayerReferences || 0
    )
    const remainingSearchIndexes = Number(
      verification?.remainingSearchIndexDocuments || 0
    )

    if (phase === 'teamCleanup') {
      if (
        remainingPlayers !== targetCount ||
        remainingTeamReferences !== 0 ||
        remainingSearchIndexes !== expectedSearchIndexes
      ) {
        throw new Error(
          'אימות לאחר ניקוי Team נכשל: מצב הנתונים אינו תואם ל-Preview המאושר'
        )
      }
      return
    }

    if (phase === 'searchIndexCleanup') {
      if (
        remainingPlayers !== targetCount ||
        remainingTeamReferences !== 0 ||
        remainingSearchIndexes !== 0
      ) {
        throw new Error(
          'אימות לאחר ניקוי SearchIndex נכשל: נשארו references או שמסמכי היעד השתנו'
        )
      }
      return
    }

    if (phase === 'playerDelete' && verification?.complete !== true) {
      throw new Error(
        'האימות הסופי נכשל: נשארו מסמכי שחקן או references של אוכלוסיית היעד'
      )
    }
  }

  const handleInvalidTransferCleanupApply = async () => {
    if (
      invalidTransferCleanupApplyLockRef.current ||
      scoutAuditBusy ||
      scoutRepairBusy ||
      !invalidTransferCleanupPreview
    ) {
      return
    }

    invalidTransferCleanupApplyLockRef.current = true

    const gate = buildInvalidTransferCleanupGate(
      invalidTransferCleanupPreview
    )

    if (!gate.ready) {
      setScoutAuditError(
        `הניקוי חסום: ${gate.mismatches.join(' | ')}`
      )
      invalidTransferCleanupApplyLockRef.current = false
      return
    }

    const playerDocumentIds = Array.isArray(
      invalidTransferCleanupPreview.playerDocumentIds
    )
      ? invalidTransferCleanupPreview.playerDocumentIds
      : []
    const targetFingerprint = clean(
      invalidTransferCleanupPreview.targetFingerprint
    )

    if (
      playerDocumentIds.length !== INVALID_TRANSFER_CLEANUP_BASELINE.candidateCount ||
      !targetFingerprint
    ) {
      setScoutAuditError(
        'הניקוי חסום: רשימת היעד או targetFingerprint אינם תקינים'
      )
      invalidTransferCleanupApplyLockRef.current = false
      return
    }

    const currentFailedPhase = clean(
      invalidTransferCleanupRun?.failedPhase
    )
    const isResume = [
      'teamCleanup',
      'searchIndexCleanup',
      'playerDelete',
    ].includes(currentFailedPhase)

    if (!isResume) {
      const confirmed = window.confirm(
        'להתחיל את ניקוי מסמכי ה-TRANSFER השגויים?\\n\\n' +
        '709 מסמכי שחקן מיועדים למחיקה.\\n' +
        '801 הפניות במסמכי קבוצה ינוקו.\\n' +
        '801 מסמכי אינדקס חיפוש יימחקו.\\n\\n' +
        'התהליך יבצע אימות אחרי כל שלב וייעצר אוטומטית אם המספרים אינם תואמים.'
      )

      if (!confirmed) {
        invalidTransferCleanupApplyLockRef.current = false
        return
      }
    }

    const phaseOrder = [
      'teamCleanup',
      'searchIndexCleanup',
      'playerDelete',
    ]
    const startIndex = isResume
      ? phaseOrder.indexOf(currentFailedPhase)
      : 0
    const targetCount = playerDocumentIds.length
    const expectedSearchIndexes = Number(
      invalidTransferCleanupPreview.searchIndexDocumentsToDelete || 0
    )

    setScoutRepairBusy(true)
    setScoutAuditError('')
    setInvalidTransferCleanupRun(current => ({
      ...(current || {}),
      status: 'running',
      failedPhase: '',
      error: '',
      steps: isResume
        ? current?.steps || buildCleanupSteps()
        : buildCleanupSteps(),
      results: current?.results || {},
    }))

    let activePhase = phaseOrder[startIndex]

    try {
      for (
        let phaseIndex = startIndex;
        phaseIndex < phaseOrder.length;
        phaseIndex += 1
      ) {
        activePhase = phaseOrder[phaseIndex]

        updateInvalidTransferCleanupStep({
          step: activePhase,
          status: 'running',
        })

        let result = null

        if (activePhase === 'teamCleanup') {
          result = await applyInvalidTransferPlayerTeamCleanup({
            playerDocumentIds,
            targetFingerprint,
          })
        } else if (activePhase === 'searchIndexCleanup') {
          result = await applyInvalidTransferPlayerSearchIndexCleanup({
            playerDocumentIds,
            targetFingerprint,
          })
        } else {
          result = await applyInvalidTransferPlayerDocumentDelete({
            playerDocumentIds,
            targetFingerprint,
          })
        }

        const verification = await verifyInvalidTransferPlayerCleanup({
          playerDocumentIds,
          targetFingerprint,
        })

        assertCleanupVerification({
          phase: activePhase,
          verification,
          targetCount,
          expectedSearchIndexes:
            activePhase === 'teamCleanup'
              ? expectedSearchIndexes
              : 0,
        })

        updateInvalidTransferCleanupStep({
          step: activePhase,
          status: 'complete',
          result,
          verification,
        })
      }

      const finalVerification = await verifyInvalidTransferPlayerCleanup({
        playerDocumentIds,
        targetFingerprint,
      })

      assertCleanupVerification({
        phase: 'playerDelete',
        verification: finalVerification,
        targetCount,
        expectedSearchIndexes: 0,
      })

      setInvalidTransferCleanupRun(current => ({
        ...(current || {}),
        status: 'complete',
        failedPhase: '',
        error: '',
        steps: {
          ...(current?.steps || buildCleanupSteps()),
          verification: 'complete',
        },
        verification: finalVerification,
      }))
    } catch (error) {
      console.error(
        '[playersDatabase] Invalid transfer cleanup failed:',
        error
      )
      const message = error instanceof Error
        ? error.message
        : 'ניקוי מסמכי TRANSFER נכשל'

      setInvalidTransferCleanupRun(current => ({
        ...(current || {}),
        status: 'error',
        failedPhase: activePhase,
        error: message,
        steps: {
          ...buildCleanupSteps(),
          ...(current?.steps || {}),
          [activePhase]: 'failed',
        },
      }))
      setScoutAuditError(message)
    } finally {
      invalidTransferCleanupApplyLockRef.current = false
      setScoutRepairBusy(false)
    }
  }

  const handleOrphanPlayerCleanupPreview = async () => {
    if (scoutAuditBusy || scoutRepairBusy) return

    setScoutAuditBusy(true)
    setScoutAuditError('')

    try {
      const result = await buildOrphanPlayerDocumentCleanupPreview()
      const gate = buildOrphanPlayerCleanupGate(result)

      setOrphanPlayerCleanupPreview({
        ...result,
        gate,
      })
      setOrphanPlayerCleanupRun({
        status: gate.ready ? 'ready' : 'blocked',
        failedPhase: '',
        steps: buildCleanupSteps(),
        results: {},
        verification: null,
        error: gate.ready
          ? ''
          : `ה-Preview אינו תואם ל-baseline המאושר: ${gate.mismatches.join(' | ')}`,
      })
    } catch (error) {
      console.error(
        '[playersDatabase] Orphan player cleanup preview failed:',
        error
      )
      setOrphanPlayerCleanupPreview(null)
      setOrphanPlayerCleanupRun({
        status: 'error',
        failedPhase: 'preview',
        steps: buildCleanupSteps(),
        results: {},
        verification: null,
        error: error instanceof Error
          ? error.message
          : 'בדיקת ניקוי מסמכי שחקן ללא זכאות נכשלה',
      })
    } finally {
      setScoutAuditBusy(false)
    }
  }

  const updateOrphanPlayerCleanupStep = ({
    step,
    status,
    result,
    verification,
  } = {}) => {
    setOrphanPlayerCleanupRun(current => ({
      ...(current || {}),
      status: status === 'failed' ? 'error' : 'running',
      failedPhase: status === 'failed' ? step : '',
      steps: {
        ...buildCleanupSteps(),
        ...(current?.steps || {}),
        [step]: status,
      },
      results: {
        ...(current?.results || {}),
        ...(result ? { [step]: result } : {}),
      },
      verification: verification || current?.verification || null,
    }))
  }

  const handleOrphanPlayerCleanupApply = async () => {
    if (
      orphanPlayerCleanupApplyLockRef.current ||
      scoutAuditBusy ||
      scoutRepairBusy ||
      !orphanPlayerCleanupPreview
    ) {
      return
    }

    orphanPlayerCleanupApplyLockRef.current = true

    const currentFailedPhase = clean(
      orphanPlayerCleanupRun?.failedPhase
    )
    const hasPersistedResolvedTeamScope = Boolean(
      orphanPlayerCleanupRun?.resolvedTeamScope
        ?.teamDocumentIdsAffected?.length &&
      orphanPlayerCleanupRun?.resolvedTeamScope
        ?.teamDocumentIdsAffectedFingerprint
    )
    const isLegacyPlayerDeleteResume = (
      currentFailedPhase === 'playerDelete' &&
      !hasPersistedResolvedTeamScope &&
      !Array.isArray(
        orphanPlayerCleanupPreview.teamDocumentIdsAffected
      )
    )

    const gate = buildOrphanPlayerCleanupGate(
      orphanPlayerCleanupPreview,
      {
        allowLegacyTeamScope:
          isLegacyPlayerDeleteResume ||
          hasPersistedResolvedTeamScope,
        resolvedTeamScope:
          orphanPlayerCleanupRun?.resolvedTeamScope || null,
      }
    )

    if (!gate.ready) {
      setScoutAuditError(
        `ניקוי המסמכים ללא זכאות חסום: ${gate.mismatches.join(' | ')}`
      )
      orphanPlayerCleanupApplyLockRef.current = false
      return
    }

    const playerDocumentIds = Array.isArray(
      orphanPlayerCleanupPreview.playerDocumentIds
    )
      ? orphanPlayerCleanupPreview.playerDocumentIds
      : []
    const targetFingerprint = clean(
      orphanPlayerCleanupPreview.targetFingerprint
    )
    const persistedResolvedTeamScope =
      orphanPlayerCleanupRun?.resolvedTeamScope || null
    let teamDocumentIdsAffected = Array.isArray(
      persistedResolvedTeamScope?.teamDocumentIdsAffected
    )
      ? persistedResolvedTeamScope.teamDocumentIdsAffected
      : (
          Array.isArray(
            orphanPlayerCleanupPreview.teamDocumentIdsAffected
          )
            ? orphanPlayerCleanupPreview.teamDocumentIdsAffected
            : []
        )
    let teamDocumentIdsAffectedFingerprint = clean(
      persistedResolvedTeamScope
        ?.teamDocumentIdsAffectedFingerprint ||
      orphanPlayerCleanupPreview
        .teamDocumentIdsAffectedFingerprint
    )

    const persistOrphanResolvedTeamScope = scope => {
      const resolvedTeamDocumentIds = Array.isArray(
        scope?.teamDocumentIdsAffected
      )
        ? scope.teamDocumentIdsAffected
        : []
      const resolvedTeamFingerprint = clean(
        scope?.teamDocumentIdsAffectedFingerprint
      )

      if (
        !resolvedTeamDocumentIds.length ||
        resolvedTeamDocumentIds.length !== Number(
          orphanPlayerCleanupPreview.teamDocumentsAffected || 0
        ) ||
        !resolvedTeamFingerprint ||
        buildPlayerCleanupTargetFingerprint(
          resolvedTeamDocumentIds
        ) !== resolvedTeamFingerprint
      ) {
        return false
      }

      teamDocumentIdsAffected = resolvedTeamDocumentIds
      teamDocumentIdsAffectedFingerprint =
        resolvedTeamFingerprint

      setOrphanPlayerCleanupRun(current => ({
        ...(current || {}),
        resolvedTeamScope: {
          teamDocumentIdsAffected:
            resolvedTeamDocumentIds,
          teamDocumentIdsAffectedFingerprint:
            resolvedTeamFingerprint,
        },
      }))

      return true
    }

    if (
      playerDocumentIds.length !== ORPHAN_PLAYER_CLEANUP_BASELINE.candidateCount ||
      !targetFingerprint ||
      (
        !isLegacyPlayerDeleteResume &&
        (
          teamDocumentIdsAffected.length !== Number(
            orphanPlayerCleanupPreview.teamDocumentsAffected || 0
          ) ||
          !teamDocumentIdsAffectedFingerprint
        )
      )
    ) {
      setScoutAuditError(
        'ניקוי המסמכים ללא זכאות חסום: רשימת היעד או targetFingerprint אינם תקינים'
      )
      orphanPlayerCleanupApplyLockRef.current = false
      return
    }

    const isResume = [
      'teamCleanup',
      'searchIndexCleanup',
      'playerDelete',
    ].includes(currentFailedPhase)

    if (!isResume) {
      const candidateCount = Number(
        orphanPlayerCleanupPreview.candidateCount || 0
      )
      const teamReferences = Number(
        orphanPlayerCleanupPreview.teamPlayerReferencesToClear || 0
      )
      const searchIndexes = Number(
        orphanPlayerCleanupPreview.searchIndexDocumentsToDelete || 0
      )
      const confirmed = window.confirm(
        'להתחיל ניקוי מסמכי שחקן ללא זכאות?\\n\\n' +
        `${candidateCount} מסמכי שחקן מיועדים למחיקה.\\n` +
        `${teamReferences} הפניות במסמכי קבוצה ינוקו.\\n` +
        `${searchIndexes} מסמכי אינדקס חיפוש יימחקו.\\n\\n` +
        'בזמן התהליך אסור לבצע כתיבות מקבילות למסמכי הקבוצה.\\n' +
        'Team truth ייבדק מחדש במסמכי הקבוצה שננעלו ב-Preview לפני המחיקה.'
      )

      if (!confirmed) {
        orphanPlayerCleanupApplyLockRef.current = false
        return
      }
    }

    const phaseOrder = [
      'teamCleanup',
      'searchIndexCleanup',
      'playerDelete',
    ]
    const startIndex = isResume
      ? phaseOrder.indexOf(currentFailedPhase)
      : 0
    const targetCount = playerDocumentIds.length
    const expectedSearchIndexes = Number(
      orphanPlayerCleanupPreview.searchIndexDocumentsToDelete || 0
    )

    setScoutRepairBusy(true)
    setScoutAuditError('')
    setOrphanPlayerCleanupRun(current => ({
      ...(current || {}),
      status: 'running',
      failedPhase: '',
      error: '',
      steps: isResume
        ? current?.steps || buildCleanupSteps()
        : buildCleanupSteps(),
      results: current?.results || {},
    }))

    let activePhase = phaseOrder[startIndex]

    try {
      for (
        let phaseIndex = startIndex;
        phaseIndex < phaseOrder.length;
        phaseIndex += 1
      ) {
        activePhase = phaseOrder[phaseIndex]

        updateOrphanPlayerCleanupStep({
          step: activePhase,
          status: 'running',
        })

        let result = null

        if (activePhase === 'teamCleanup') {
          result = await applyOrphanPlayerDocumentTeamCleanup({
            playerDocumentIds,
            targetFingerprint,
          })
        } else if (activePhase === 'searchIndexCleanup') {
          result = await applyOrphanPlayerDocumentSearchIndexCleanup({
            playerDocumentIds,
            targetFingerprint,
          })
        } else {
          result = await applyOrphanPlayerDocumentDelete({
            playerDocumentIds,
            targetFingerprint,
            teamDocumentIdsAffected,
            teamDocumentIdsAffectedFingerprint,
            expectedTeamDocumentsAffected: Number(
              orphanPlayerCleanupPreview.teamDocumentsAffected || 0
            ),
            legacyTeamScopeRecoveryFromTeamsConfirmed:
              isLegacyPlayerDeleteResume,
            exclusiveDbBirthTeamsWriteWindowConfirmed: true,
          })

          if (
            Array.isArray(result?.teamDocumentIdsAffected) &&
            result.teamDocumentIdsAffected.length &&
            !persistOrphanResolvedTeamScope(result)
          ) {
            throw new Error(
              'ניקוי המסמכים ללא זכאות נעצר: Team scope ששוחזר לפני המחיקה אינו תקין'
            )
          }
        }

        const verification = await verifyOrphanPlayerDocumentCleanup({
          playerDocumentIds,
          targetFingerprint,
          teamDocumentIdsAffected,
          teamDocumentIdsAffectedFingerprint,
          expectedTeamDocumentsAffected: Number(
            orphanPlayerCleanupPreview.teamDocumentsAffected || 0
          ),
          exclusiveDbBirthTeamsWriteWindowConfirmed: true,
        })

        assertCleanupVerification({
          phase: activePhase,
          verification,
          targetCount,
          expectedSearchIndexes:
            activePhase === 'teamCleanup'
              ? expectedSearchIndexes
              : 0,
        })

        updateOrphanPlayerCleanupStep({
          step: activePhase,
          status: 'complete',
          result,
          verification,
        })
      }

      const finalVerification = await verifyOrphanPlayerDocumentCleanup({
        playerDocumentIds,
        targetFingerprint,
        teamDocumentIdsAffected,
        teamDocumentIdsAffectedFingerprint,
        expectedTeamDocumentsAffected: Number(
          orphanPlayerCleanupPreview.teamDocumentsAffected || 0
        ),
        exclusiveDbBirthTeamsWriteWindowConfirmed: true,
      })

      assertCleanupVerification({
        phase: 'playerDelete',
        verification: finalVerification,
        targetCount,
        expectedSearchIndexes: 0,
      })

      setOrphanPlayerCleanupRun(current => ({
        ...(current || {}),
        status: 'complete',
        failedPhase: '',
        error: '',
        steps: {
          ...(current?.steps || buildCleanupSteps()),
          verification: 'complete',
        },
        verification: finalVerification,
      }))
    } catch (error) {
      console.error(
        '[playersDatabase] Orphan player cleanup failed:',
        error
      )

      if (
        activePhase === 'playerDelete' &&
        error?.playerDocumentCleanupTeamScope
      ) {
        persistOrphanResolvedTeamScope(
          error.playerDocumentCleanupTeamScope
        )
      }

      const message = error instanceof Error
        ? error.message
        : 'ניקוי מסמכי שחקן ללא זכאות נכשל'

      setOrphanPlayerCleanupRun(current => ({
        ...(current || {}),
        status: 'error',
        failedPhase: activePhase,
        error: message,
        steps: {
          ...buildCleanupSteps(),
          ...(current?.steps || {}),
          [activePhase]: 'failed',
        },
      }))
      setScoutAuditError(message)
    } finally {
      orphanPlayerCleanupApplyLockRef.current = false
      setScoutRepairBusy(false)
    }
  }

  const handleScoutAuditOpen = () => {
    setScoutAuditOpen(true)
    setScoutAuditError('')
    setScoutRepairPreview(null)
    setScoutRepairResult(null)
    setEngineRefreshPreview(null)
    setEngineRefreshResult(null)
    setDocumentRewritePreview(null)
    setDocumentRewriteResult(null)
    setGlobalRepairPreview(null)
    setDataHealthResults({})
  }

  const handleScoutAuditDownload = () => {
    downloadPlayerScoutRulesAudit(scoutAudit)
  }

  return (
    <>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues())}
          onReport={() => setReportNameOpen(true)}
          onScoutAudit={handleScoutAuditOpen}
          reportDisabled={!search.hasLoaded || !search.rows.length}
        />

        <SearchWorkspace
          search={search}
          onEntityOpen={handleEntityOpen}
        />
      </Box>

      <ReportNameModal
        open={reportNameOpen}
        busy={searchReport.busy}
        error={searchReport.error}
        entityType={search.loadedEntityType}
        onClose={() => setReportNameOpen(false)}
        onConfirm={handleCreateReport}
      />

      <PlayerScoutAuditModal
        open={scoutAuditOpen}
        busy={scoutAuditBusy}
        error={scoutAuditError}
        audit={scoutAudit}
        repairBusy={scoutRepairBusy}
        repairPreview={scoutRepairPreview}
        repairResult={scoutRepairResult}
        globalAudit={globalAudit}
        globalRepairPreview={globalRepairPreview}
        globalDirectRepairResult={globalDirectRepairResult}
        globalRegularRepairResult={globalRegularRepairResult}
        globalSelectedRepairResult={globalSelectedRepairResult}
        globalOverlapRepairResult={globalOverlapRepairResult}
        invalidTransferCleanupPreview={invalidTransferCleanupPreview}
        invalidTransferCleanupRun={invalidTransferCleanupRun}
        orphanPlayerCleanupPreview={orphanPlayerCleanupPreview}
        orphanPlayerCleanupRun={orphanPlayerCleanupRun}
        engineRefreshPreview={engineRefreshPreview}
        engineRefreshResult={engineRefreshResult}
        partialAuditDefaults={partialAuditDefaults}
        dataHealthResults={dataHealthResults}
        dataHealthBusyScope={dataHealthBusyScope}
        onRunDataHealth={handleDataHealthRun}
        onRunFull={handleScoutAuditFullRun}
        onRunGlobalPreview={handleGlobalRepairPreview}
        onGlobalDirectRepairApply={handleGlobalDirectRepairApply}
        onGlobalRegularRepairApply={handleGlobalRegularRepairApply}
        onGlobalSelectedRepairApply={handleGlobalSelectedRepairApply}
        onGlobalSafeDependencyOverlapRepairApply={handleGlobalSafeDependencyOverlapRepairApply}
        onGlobalOverlapRepairApply={handleGlobalOverlapRepairApply}
        onInvalidTransferCleanupPreview={handleInvalidTransferCleanupPreview}
        onInvalidTransferCleanupApply={handleInvalidTransferCleanupApply}
        onOrphanPlayerCleanupPreview={handleOrphanPlayerCleanupPreview}
        onOrphanPlayerCleanupApply={handleOrphanPlayerCleanupApply}
        onRunPartial={handleScoutAuditPartialRun}
        onDownload={handleScoutAuditDownload}
        onRepairPreview={handleScoutRepairPreview}
        onRepairApply={handleScoutRepairApply}
        onEngineRefreshPreview={handleEngineRefreshPreview}
        onEngineRefreshApply={handleEngineRefreshApply}
        documentRewritePreview={documentRewritePreview}
        documentRewriteResult={documentRewriteResult}
        onDocumentRewritePreview={handleDocumentRewritePreview}
        onDocumentRewriteApply={handleDocumentRewriteApply}
        onClose={() => setScoutAuditOpen(false)}
      />
    </>
  )
}

export default function SearchPage() {
  return (
    <PlayersDatabaseLayout>
      <SearchPageContent />
    </PlayersDatabaseLayout>
  )
}
