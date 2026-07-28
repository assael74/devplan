// features/playersDatabase/ui/pages/searchPage/SearchPage.js

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
import { searchPageSx as sx } from './sx/searchPage.sx.js'

export default function SearchPage() {
  const navigate = useNavigate()
  const search = useSearchPage()
  const searchReport = useSearchReport({
    rows: search.rows,
    queryFilters: search.queryFilters,
    summary: search.summary,
  })

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'חיפוש במאגר' },
  ])

  const handleEntityOpen = row => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.player(row.id))
  }

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)}
          onReport={searchReport.openPreview}
          reportDisabled={!search.hasLoaded || !search.rows.length}
        />

        <SearchWorkspace
          search={search}
          onEntityOpen={handleEntityOpen}
        />
      </Box>

      <ReportPreviewModal
        open={searchReport.open}
        draft={searchReport.draft}
        busy={searchReport.busy}
        publication={searchReport.publication}
        onPublish={searchReport.publish}
        onClose={searchReport.closePreview}
      />
    </PlayersDatabaseLayout>
  )
}
