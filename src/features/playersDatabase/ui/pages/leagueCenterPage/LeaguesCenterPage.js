// features/playersDatabase/ui/pages/leagueCenterPage/LeaguesCenterPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeagueCenter } from '../../hooks/useLeagueCenter.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueCenterHeader from './LeagueCenterHeader.js'
import LeagueCenterOverview from './LeagueCenterOverview.js'
import LeagueCenterFilters from './LeagueCenterFilters.js'
import LeagueCenterTable from './LeagueCenterTable.js'
import LeagueCenterMissingPanel from './LeagueCenterMissingPanel.js'
import LeagueCenterSeasonModal from './LeagueCenterSeasonModal.js'
import useLeagueSeasonCreate from './hooks/useLeagueSeasonCreate.js'
import { buildLeagueCenterColumns } from './logic/leagueCenter.columns.js'
import { buildMissingItems } from './logic/leagueCenter.logic.js'
import { leagueCenterPageSx as pageSx } from './sx/leagueCenterPage.sx.js'
import { leagueCenterContentSx as contentSx } from './sx/leagueCenterContent.sx.js'

export default function LeaguesCenterPage() {
  const navigate = useNavigate()
  const model = useLeagueCenter()
  const seasonCreate = useLeagueSeasonCreate()
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'מרכז ליגות' },
  ])

  const columns = React.useMemo(() => buildLeagueCenterColumns({
    onCreateSeason: seasonCreate.open,
    onOpenLeague: row => navigate(PLAYERS_DATABASE_UI_ROUTES.league(row.leagueId)),
  }), [navigate, seasonCreate.open])

  return (
    <PlayersDatabaseLayout>
      <Box sx={pageSx.page}>
        <LeagueCenterHeader
          breadcrumbs={breadcrumbs}
          onNavigateToSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onNavigateToEntry={() => navigate(PLAYERS_DATABASE_UI_ROUTES.entry)}
        />

        <LeagueCenterOverview summary={model.summary} />
        <LeagueCenterFilters model={model} />

        <Box sx={contentSx.contentGrid}>
          <LeagueCenterTable columns={columns} model={model} />
          <LeagueCenterMissingPanel items={buildMissingItems(model.summary)} />
        </Box>
      </Box>

      <LeagueCenterSeasonModal
        controller={seasonCreate}
        defaultSeasonKey={model.seasonKey}
      />
    </PlayersDatabaseLayout>
  )
}
