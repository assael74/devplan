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
  ReportNameModal,
} from '../../components/modals/index.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const buildSearchAuditRoute = rows => {
  const scopes = [
    ...new Map((Array.isArray(rows) ? rows : []).map(row => {
      const scope = {
        leagueId: clean(row && row.leagueId),
        teamId: clean(row && row.teamId),
        seasonId: clean(row && row.seasonId),
      }
      return [`${scope.leagueId}::${scope.teamId}::${scope.seasonId}`, scope]
    })).values(),
  ].filter(scope => scope.leagueId && scope.teamId && scope.seasonId)

  return scopes.length === 1
    ? PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit({ type: 'team', ...scopes[0] })
    : PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit()
}

function SearchPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reportNameOpen, setReportNameOpen] = React.useState(false)
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

    navigate(
      PLAYERS_DATABASE_UI_ROUTES.player({
        playerId: row.playerId,
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


  return (
    <>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues())}
          onReport={() => setReportNameOpen(true)}
          onScoutAudit={() => navigate(buildSearchAuditRoute(search.rows))}
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

