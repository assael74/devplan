// domains/team/games/TeamGamesDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import {
  resolveTeamGamesDomain,
  filterTeamGames,
  buildTeamGamesFilterCounts,
} from './logic/teamGames.domain.logic.js'
import TeamGamesKpi from './components/TeamGamesKpi.js'
import TeamGamesFilters from './components/TeamGamesFilters.js'
import TeamGamesTable from './components/TeamGamesTable.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'

export default function TeamGamesDomainModal({ entity, context }) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const { rows, summary } = useMemo(() => resolveTeamGamesDomain(liveTeam), [liveTeam])

  const [typeFilter, setTypeFilter] = useState('all')
  const [homeFilter, setHomeFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [activeGame, setActiveGame] = useState(null)
  const [openCreateGame, setOpenCreateGame] = useState(false)

  const filtered = useMemo(() => {
    return filterTeamGames(rows, {
      typeFilter,
      homeFilter,
      resultFilter,
      diffFilter,
    })
  }, [rows, typeFilter, homeFilter, resultFilter, diffFilter])

  const filterCounts = useMemo(() => {
    return buildTeamGamesFilterCounts(rows, {
      typeFilter,
      homeFilter,
      resultFilter,
      diffFilter,
    })
  }, [rows, typeFilter, homeFilter, resultFilter, diffFilter])

  const handleReset = () => {
    setTypeFilter('all')
    setHomeFilter('all')
    setResultFilter('all')
    setDiffFilter('all')
  }

  const handleOpenCreate = () => {
    setOpenCreateGame(true)
  }

  const handleCloseCreate = () => {
    setOpenCreateGame(false)
  }

  const handleCreateSaved = () => {
    setOpenCreateGame(false)
  }

  return (
    <Box sx={{ minWidth: 0, display: 'grid', gap: 1 }}>
      <Box
        sx={{
          position: 'sticky',
          top: -15,
          zIndex: 5,
          borderRadius: 12,
          bgcolor: 'background.body',
        }}
      >
        <TeamGamesKpi entity={liveTeam} summary={summary} filteredCount={filtered.length} />

        <TeamGamesFilters
          typeFilter={typeFilter}
          homeFilter={homeFilter}
          resultFilter={resultFilter}
          diffFilter={diffFilter}
          counts={filterCounts}
          onChangeTypeFilter={setTypeFilter}
          onChangeHomeFilter={setHomeFilter}
          onChangeResultFilter={setResultFilter}
          onChangeDiffFilter={setDiffFilter}
          onReset={handleReset}
          onCreateGame={handleOpenCreate}
        />
      </Box>

      <TeamGamesTable
        rows={filtered}
        onEditGame={(row) => setActiveGame(row?.raw || row || null)}
      />

      <NewFormDrawer
        open={openCreateGame}
        onClose={handleCloseCreate}
        onSaved={handleCreateSaved}
        context={{ ...context, teamId: entity?.id || '', team: liveTeam }}
      />

      <EditDrawer
        open={!!activeGame}
        context={context}
        game={{ ...activeGame, team: liveTeam }}
        onClose={() => setActiveGame(null)}
        onSaved={() => setActiveGame(null)}
      />
    </Box>
  )
}
