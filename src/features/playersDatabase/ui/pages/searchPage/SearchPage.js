// features/playersDatabase/ui/pages/searchPage/SearchPage.js

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
  applyPlayerScoutRepair,
  buildPlayerScoutRepairPreview,
  buildPlayerScoutRulesAudit,
  downloadPlayerScoutRulesAudit,
} from '../../../services/audit/index.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

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

  const search = useSearchPage()

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

  const handleScoutAuditRun = async () => {
    if (scoutAuditBusy) return

    setScoutAuditBusy(true)
    setScoutAuditError('')

    try {
      const result = await buildPlayerScoutRulesAudit()
      setScoutAudit(result)
    } catch (error) {
      console.error('[playersDatabase] Scout rules audit failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'בדיקת פרופילי Scout נכשלה'
      )
    } finally {
      setScoutAuditBusy(false)
    }
  }


  const handleScoutRepairPreview = async () => {
    if (scoutRepairBusy || scoutAuditBusy) return

    setScoutRepairBusy(true)
    setScoutAuditError('')
    setScoutRepairResult(null)

    try {
      const result = await buildPlayerScoutRepairPreview()
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
    if (scoutRepairBusy || scoutAuditBusy || !scoutRepairPreview) return

    const confirmed = window.confirm(
      'לבצע Repair לפרופילי Scout לפי ה-Preview? הפעולה תבצע כתיבות ל-Firestore.'
    )
    if (!confirmed) return

    setScoutRepairBusy(true)
    setScoutAuditError('')

    try {
      const result = await applyPlayerScoutRepair({
        confirmed: true,
      })
      setScoutRepairResult(result)
      setScoutRepairPreview(null)

      const nextAudit = await buildPlayerScoutRulesAudit()
      setScoutAudit(nextAudit)
    } catch (error) {
      console.error('[playersDatabase] Scout repair failed:', error)
      setScoutAuditError(
        error instanceof Error
          ? error.message
          : 'Repair פרופילי Scout נכשל'
      )
    } finally {
      setScoutRepairBusy(false)
    }
  }

  const handleScoutAuditOpen = () => {
    setScoutAuditOpen(true)
    setScoutRepairPreview(null)
    setScoutRepairResult(null)
    handleScoutAuditRun()
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
          scoutAuditBusy={scoutAuditBusy}
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
        onRun={handleScoutAuditRun}
        onDownload={handleScoutAuditDownload}
        onRepairPreview={handleScoutRepairPreview}
        onRepairApply={handleScoutRepairApply}
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
