// features/playersDatabase/ui/pages/searchPage/SearchPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import SearchDocumentsModal from './import/SearchDocumentsModal.js'
import SearchHeader from './SearchHeader.js'
import SearchWorkspace from './SearchWorkspace.js'
import usePlayerSearch from './hooks/usePlayerSearch.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

export default function SearchPage() {
  const navigate = useNavigate()
  const search = usePlayerSearch()
  const [importOpen, setImportOpen] = React.useState(false)

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'חיפוש שחקנים' },
  ])

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onImport={() => setImportOpen(true)}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)}
        />

        <SearchWorkspace
          search={search}
          onPlayerOpen={row => navigate(PLAYERS_DATABASE_UI_ROUTES.player(row.id))}
        />
      </Box>

      <SearchDocumentsModal open={importOpen} onClose={() => setImportOpen(false)} />
    </PlayersDatabaseLayout>
  )
}
