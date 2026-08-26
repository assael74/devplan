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
  PlayerDatabaseAuditModal,
  ReportNameModal,
} from '../../components/modals/index.js'
import {
  applyPlayerDatabaseRepairPlan,
  buildPlayerDatabaseRepairPlan,
  runPlayerDatabaseAudit,
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
  const [auditOpen, setAuditOpen] = React.useState(false)
  const [auditBusy, setAuditBusy] = React.useState(false)
  const [auditError, setAuditError] = React.useState('')
  const [auditResult, setAuditResult] = React.useState(null)
  const [auditRepairPlan, setAuditRepairPlan] = React.useState(null)
  const [auditApplyResult, setAuditApplyResult] = React.useState(null)
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

  const handleAuditOpen = () => {
    setAuditOpen(true)
    setAuditError('')
  }

  const handleAuditRun = async scope => {
    if (auditBusy) return

    setAuditBusy(true)
    setAuditError('')

    try {
      const result = await runPlayerDatabaseAudit({ scope })
      setAuditResult(result)
      setAuditRepairPlan(null)
      setAuditApplyResult(null)
    } catch (error) {
      console.error('[playersDatabase] Data audit failed:', error)
      setAuditError(
        error instanceof Error
          ? error.message
          : 'בדיקת מצב הנתונים נכשלה'
      )
    } finally {
      setAuditBusy(false)
    }
  }

  const handlePrepareRepair = () => {
    if (!auditResult || auditBusy) return

    try {
      const plan = buildPlayerDatabaseRepairPlan({
        audit: auditResult,
      })
      setAuditRepairPlan(plan)
      setAuditApplyResult(null)
      setAuditError('')
    } catch (error) {
      console.error('[playersDatabase] Repair plan failed:', error)
      setAuditError(
        error instanceof Error
          ? error.message
          : 'הכנת תוכנית התיקון נכשלה'
      )
    }
  }


  const handleApplyRepair = async () => {
    if (!auditResult || !auditRepairPlan || auditBusy) return

    setAuditBusy(true)
    setAuditError('')

    try {
      const result = await applyPlayerDatabaseRepairPlan({
        audit: auditResult,
        plan: auditRepairPlan,
        confirmed: true,
        verify: true,
      })
      setAuditApplyResult(result)
    } catch (error) {
      console.error('[playersDatabase] Automatic repair failed:', error)
      setAuditError(
        error instanceof Error
          ? error.message
          : 'ביצוע התיקון האוטומטי נכשל'
      )
    } finally {
      setAuditBusy(false)
    }
  }

  return (
    <>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues())}
          onReport={() => setReportNameOpen(true)}
          onScoutAudit={handleAuditOpen}
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

      <PlayerDatabaseAuditModal
        open={auditOpen}
        busy={auditBusy}
        error={auditError}
        result={auditResult}
        repairPlan={auditRepairPlan}
        applyResult={auditApplyResult}
        defaultTeamDocumentId={partialAuditDefaults.teamDocumentId}
        defaultSeasonKey={partialAuditDefaults.seasonKey}
        onRun={handleAuditRun}
        onPrepareRepair={handlePrepareRepair}
        onApplyRepair={handleApplyRepair}
        onClose={() => setAuditOpen(false)}
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
