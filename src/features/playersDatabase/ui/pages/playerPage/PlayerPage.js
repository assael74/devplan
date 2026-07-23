// features/playersDatabase/ui/pages/playerPage/PlayerPage.js

import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { usePlayerPage } from '../../hooks/usePlayerPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import PlayerHeader from './PlayerHeader.js'
import PlayerStatsOverview from './PlayerStatsOverview.js'
import PlayerHistorySection from './PlayerHistorySection.js'
import usePlayerHistoryView from './hooks/usePlayerHistoryView.js'
import { playerPageSx as sx } from './sx/playerPage.sx.js'

export default function PlayerPage() {
  const navigate = useNavigate()
  const { player } = usePlayerPage()
  const historyView = usePlayerHistoryView(player)

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'חיפוש מועמדים',
      to: PLAYERS_DATABASE_UI_ROUTES.search,
    },
    {
      label: player.fullName,
    },
  ])

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  const handleNavigateToTeam = () => {
    if (!player.leagueId || !player.teamId) return

    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: player.leagueId,
      teamId: player.teamId,
      seasonKey: player.seasonKey,
    }))
  }

  const handleHistoryOpen = row => {
    console.info('Player season context', row)
  }

  const handleAction = actionId => {
    console.info('Player placeholder action', actionId)
  }

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <PlayerHeader
          breadcrumbs={breadcrumbs}
          player={player}
          onSearch={handleNavigateToSearch}
          onTeam={handleNavigateToTeam}
        />

        <PlayerStatsOverview
          player={player}
          historyRows={historyView.rows}
        />

        <PlayerHistorySection
          rows={historyView.visibleRows}
          selectedSeasonKey={historyView.selectedSeasonKey}
          seasonOptions={historyView.seasonOptions}
          filter={historyView.filter}
          hasRealData={historyView.hasRealData}
          onSeasonChange={historyView.setSelectedSeasonKey}
          onFilterChange={historyView.setFilter}
          onRowOpen={handleHistoryOpen}
          onAction={handleAction}
        />
      </Box>
    </PlayersDatabaseLayout>
  )
}
