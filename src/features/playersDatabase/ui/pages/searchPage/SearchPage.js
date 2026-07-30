// features/playersDatabase/ui/pages/searchPage/SearchPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import SearchHeader from './SearchHeader.js'
import SearchWorkspace from './SearchWorkspace.js'
import useSearchPage from './hooks/useSearchPage.js'
import { ReportPreviewModal } from '../../../../reports/external/ui/index.js'
import { useSearchReport } from './report/index.js'
import DbSearchReportNameModal from './report/DbSearchReportNameModal.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

function SearchPageContent() {
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
    navigate(PLAYERS_DATABASE_UI_ROUTES.player(row.id))
  }

  return (
    <>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)}
          onReport={() => setReportNameOpen(true)}
          reportDisabled={
            !search.hasLoaded ||
            !search.rows.length
          }
        />

        <SearchWorkspace
          search={search}
          onEntityOpen={handleEntityOpen}
        />
      </Box>

      <DbSearchReportNameModal
        open={reportNameOpen}
        busy={searchReport.busy}
        entityType={search.loadedEntityType}
        onClose={() => setReportNameOpen(false)}
        onConfirm={reportName => {
          setReportNameOpen(false)
          searchReport.openPreview(reportName)
        }}
      />

      <ReportPreviewModal
        open={searchReport.open}
        draft={searchReport.draft}
        busy={searchReport.busy}
        publication={searchReport.publication}
        onPublish={searchReport.publish}
        onClose={searchReport.closePreview}
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
