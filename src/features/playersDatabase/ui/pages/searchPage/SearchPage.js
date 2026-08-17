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
  applyPlayerScoutEngineRefresh,
  applyPlayerScoutRepair,
  buildPlayerScoutEngineRefreshPreview,
  buildPlayerScoutRepairPreview,
  buildPlayerScoutRulesAudit,
  buildPlayerScoutShadowComparison,
  buildScopedPlayerScoutRulesAudit,
  downloadPlayerScoutRulesAudit,
} from '../../../services/audit/index.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

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
  }

  const handleScoutAuditFullRun = async () => {
    if (scoutAuditBusy || scoutRepairBusy) return

    setScoutAuditBusy(true)
    resetAuditActions()

    try {
      const result = await buildPlayerScoutRulesAudit({
        includeRepairData: true,
      })
      setScoutAudit(result)
    } catch (error) {
      console.error('[playersDatabase] Full scout rules audit failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'בדיקת פרופילי Scout נכשלה'
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
    const safeSeasonKey = clean(seasonKey)

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
      'לרענן את ה-Engine Computed State במסמכי השחקנים? scoutVerification ונתונים אנושיים לא ישתנו.'
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

  const handleScoutRepairPreview = async () => {
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
      const result = await applyPlayerScoutRepair({
        confirmed: true,
        audit: scoutAudit,
      })
      setScoutRepairResult(result)
      setScoutRepairPreview(null)
      setScoutRepairBusy(false)
      setScoutAuditBusy(true)

      const verificationScopes = Array.isArray(result.verificationScopes)
        ? result.verificationScopes
        : result.results
      const scopedAudits = await Promise.all(
        verificationScopes.map(scope => buildScopedPlayerScoutRulesAudit({
          teamDocumentId: scope.teamDocumentId,
          seasonKey: scope.seasonKey,
        }))
      )
      const issues = scopedAudits.flatMap(audit => audit.issues || [])
      const recalculatedRows = scopedAudits.flatMap(
        audit => audit.recalculatedRows || []
      )

      const verificationAudit = {
        generatedAt: new Date().toISOString(),
        mode: 'read-only-scoped-verification',
        purpose: 'verify-repaired-player-scout-scopes',
        summary: {
          checkedTeamPlayerRows: recalculatedRows.length,
          skippedRows: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.skippedRows || 0)
          ), 0),
          playerSeasonRows: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.playerSeasonRows || 0)
          ), 0),
          searchPlayerDocuments: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.searchPlayerDocuments || 0)
          ), 0),
          teamSeasonIndexes: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.teamSeasonIndexes || 0)
          ), 0),
          totalIssues: issues.length,
          syncIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.syncIssuesCount || 0)
          ), 0),
          engineDiagnosticIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.engineDiagnosticIssuesCount || 0)
          ), 0),
          repairableIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.repairableIssuesCount || 0)
          ), 0),
          reportOnlyIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.reportOnlyIssuesCount || 0)
          ), 0),
          rowsWithProfileDiff: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.rowsWithProfileDiff || 0)
          ), 0),
          missingProfilesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.missingProfilesCount || 0)
          ), 0),
          extraProfilesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.extraProfilesCount || 0)
          ), 0),
          reliabilityIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.reliabilityIssuesCount || 0)
          ), 0),
          seasonStatusIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.seasonStatusIssuesCount || 0)
          ), 0),
          historyStatusIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.historyStatusIssuesCount || 0)
          ), 0),
          schemaIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.schemaIssuesCount || 0)
          ), 0),
          schemaAutoRepairIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.schemaAutoRepairIssuesCount || 0)
          ), 0),
          schemaSafeDeleteIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.schemaSafeDeleteIssuesCount || 0)
          ), 0),
          schemaReportOnlyIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.schemaReportOnlyIssuesCount || 0)
          ), 0),
          measurementIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.measurementIssuesCount || 0)
          ), 0),
          trackingIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.trackingIssuesCount || 0)
          ), 0),
          projectionIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.projectionIssuesCount || 0)
          ), 0),
          stateIssuesCount: scopedAudits.reduce((sum, audit) => (
            sum + Number(audit.summary?.stateIssuesCount || 0)
          ), 0),
          issuesByType: issues.reduce((result, issue) => {
            const type = issue.type || 'unknown'
            result[type] = Number(result[type] || 0) + 1
            return result
          }, {}),
          issuesBySource: issues.reduce((result, issue) => {
            const source = issue.source || 'unknown'
            result[source] = Number(result[source] || 0) + 1
            return result
          }, {}),
        },
        issues,
        recalculatedRows,
      }

      setScoutAudit({
        ...verificationAudit,
        shadow: buildPlayerScoutShadowComparison({
          audit: verificationAudit,
        }),
      })
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

  const handleScoutAuditOpen = () => {
    setScoutAuditOpen(true)
    setScoutAuditError('')
    setScoutRepairPreview(null)
    setScoutRepairResult(null)
    setEngineRefreshPreview(null)
    setEngineRefreshResult(null)
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
        engineRefreshPreview={engineRefreshPreview}
        engineRefreshResult={engineRefreshResult}
        partialAuditDefaults={partialAuditDefaults}
        onRunFull={handleScoutAuditFullRun}
        onRunPartial={handleScoutAuditPartialRun}
        onDownload={handleScoutAuditDownload}
        onRepairPreview={handleScoutRepairPreview}
        onRepairApply={handleScoutRepairApply}
        onEngineRefreshPreview={handleEngineRefreshPreview}
        onEngineRefreshApply={handleEngineRefreshApply}
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
