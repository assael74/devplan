// domains/player/games/PlayerGamesDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import {
  resolvePlayerGamesDomain,
  filterPlayerGames,
  buildPlayerGamesFilterCounts,
} from './logic/playerGames.domain.logic.js'
import PlayerGamesKpi from './components/PlayerGamesKpi.js'
import PlayerGamesFilters from './components/PlayerGamesFilters.js'
import PlayerGamesTable from './components/PlayerGamesTable.js'
import EditDrawer from './components/enrtyDrawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'
import NewExFormDrawer from './components/newExForm/NewExFormDrawer.js'
import EditExDrawer from './components/drawerEx/EditExDrawer.js'

export default function PlayerGamesDomainModal({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const isPrivatePlayer = livePlayer?.isPrivatePlayer === true

  const { rows, summary } = useMemo(() => resolvePlayerGamesDomain(livePlayer), [livePlayer])

  const [typeFilter, setTypeFilter] = useState('all')
  const [homeFilter, setHomeFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [addPlayerGame, setAddPlayerGame] = useState(false)
  const [addExternalGame, setAddExternalGame] = useState(false)
  const [activeGame, setActiveGame] = useState(null)

  const filtered = useMemo(() => {
    return filterPlayerGames(rows, {
      typeFilter,
      homeFilter,
      resultFilter,
      diffFilter,
    })
  }, [rows, typeFilter, homeFilter, resultFilter, diffFilter])

  const filterCounts = useMemo(() => {
    return buildPlayerGamesFilterCounts(rows, {
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

  const handleEdit = (game) => {
    setActiveGame(game)
  }

  const handleAddPlayerToGame = () => {
    if (isPrivatePlayer) {
      setAddExternalGame(true)
      return
    }

    setAddPlayerGame(true)
  }

  return (
    <>
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
          <PlayerGamesKpi
            entity={livePlayer}
            summary={summary}
            filteredCount={filtered.length}
          />

          <PlayerGamesFilters
            typeFilter={typeFilter}
            homeFilter={homeFilter}
            resultFilter={resultFilter}
            diffFilter={diffFilter}
            counts={filterCounts}
            isPrivatePlayer={isPrivatePlayer}
            onChangeTypeFilter={setTypeFilter}
            onChangeHomeFilter={setHomeFilter}
            onChangeResultFilter={setResultFilter}
            onChangeDiffFilter={setDiffFilter}
            onReset={handleReset}
            onAddPlayerToGame={handleAddPlayerToGame}
          />
        </Box>

        <PlayerGamesTable rows={filtered} onEditGame={handleEdit} />
      </Box>

      <NewFormDrawer
        open={addPlayerGame}
        onClose={() => setAddPlayerGame(false)}
        context={{
          ...context,
          player: livePlayer,
          playerId: livePlayer?.id || '',
          entity: livePlayer,
          teamId: livePlayer?.teamId || context?.teamId || '',
          clubId: livePlayer?.clubId || context?.clubId || '',
        }}
        game={{ ...activeGame, playerId: livePlayer?.id || '' }}
      />

      <NewExFormDrawer
        open={addExternalGame}
        onClose={() => setAddExternalGame(false)}
        onSaved={() => setAddExternalGame(false)}
        context={{
          ...context,
          player: livePlayer,
          playerId: livePlayer?.id || '',
          entity: livePlayer,
          teamId: livePlayer?.teamId || context?.teamId || '',
          clubId: livePlayer?.clubId || context?.clubId || '',
        }}
      />

      {isPrivatePlayer ? (
        <EditExDrawer
          open={!!activeGame}
          game={{ ...activeGame, playerId: livePlayer?.id || '' }}
          context={{
            ...context,
            player: livePlayer,
            playerId: livePlayer?.id || '',
            entity: livePlayer,
            teamId: livePlayer?.teamId || context?.teamId || '',
            clubId: livePlayer?.clubId || context?.clubId || '',
          }}
          onClose={() => setActiveGame(null)}
          onSaved={() => setActiveGame(null)}
        />
      ) : (
        <EditDrawer
          open={!!activeGame}
          setActiveGame={setActiveGame}
          game={{ ...activeGame, playerId: livePlayer?.id || '' }}
          context={{
            ...context,
            player: livePlayer,
            playerId: livePlayer?.id || '',
            entity: livePlayer,
            teamId: livePlayer?.teamId || context?.teamId || '',
            clubId: livePlayer?.clubId || context?.clubId || '',
          }}
          onClose={() => setActiveGame(null)}
          onSaved={() => setActiveGame(null)}
        />
      )}
    </>
  )
}
