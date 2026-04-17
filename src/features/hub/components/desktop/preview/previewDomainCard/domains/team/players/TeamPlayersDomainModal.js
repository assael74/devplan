// previewDomainCard/domains/team/players/TeamPlayersDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import TeamPlayersKpi from './components/TeamPlayersKpi'
import TeamPlayersFilters from './components/TeamPlayersFilters'
import TeamPlayersTable from './components/TeamPlayersTable'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'

import { resolveTeamPlayersDomain } from './logic/teamPlayers.domain.logic'
import { modalRootSx } from './sx/teamPlayersModal.sx'

export default function TeamPlayersDomainModal({ entity, context }) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const [q, setQ] = useState('')
  const [minutesBelow, setMinutesBelow] = React.useState(100)
  const [onlyKey, setOnlyKey] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [openCreatePlayer, setOpenCreatePlayer] = useState(false)

  const { summary, rows } = resolveTeamPlayersDomain(entity, {
    q,
    onlyKey,
    minutesBelow,
  })

  if (!entity) return null

  const handleCreateClose = () => {
    setOpenCreatePlayer(false)
  }

  const handleCreateOpen = () => {
    setOpenCreatePlayer(true)
  }

  const handleCreateSaved = () => {
    setOpenCreatePlayer(false)
  }

  return (
    <Box sx={modalRootSx}>
      <Box sx={{ position: 'sticky', top: -15, zIndex: 5, borderRadius: 12, bgcolor: 'background.body' }}>
        <TeamPlayersKpi entity={entity} summary={summary} />

        <TeamPlayersFilters
          q={q}
          onlyKey={onlyKey}
          minutesBelow={minutesBelow}
          summary={summary}
          onChangeQ={setQ}
          onChangeOnlyKey={setOnlyKey}
          onChangeMinutesBelow={setMinutesBelow}
          openCreatePlayer={handleCreateOpen}
        />
      </Box>

      <TeamPlayersTable
        rows={rows}
        onEditPlayer={(row) => setEditingPlayer(row?.player || null)}
      />

      <EditDrawer
        open={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onSaved={() => {}}
      />

      <NewFormDrawer
        open={openCreatePlayer}
        onClose={handleCreateClose}
        onSaved={handleCreateSaved}
        context={{ ...context, teamId: entity?.id || '', team: liveTeam }}
      />
    </Box>
  )
}
