// preview/previewDomainCard/domains/club/players/ClubPlayersDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import ClubPlayersKpi from './components/ClubPlayersKpi'
import ClubPlayersFilters from './components/ClubPlayersFilters'
import ClubPlayersTable from './components/ClubPlayersTable'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'

import { resolveClubPlayersDomain } from './logic/clubPlayers.domain.logic'
import { modalRootSx } from './sx/clubPlayersModal.sx'

export default function ClubPlayersDomainModal({ entity, context }) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((c) => c?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [q, setQ] = useState('')
  const [minutesBelow, setMinutesBelow] = React.useState(100)
  const [onlyKey, setOnlyKey] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [openCreatePlayer, setOpenCreatePlayer] = useState(false)

  const { summary, rows } = resolveClubPlayersDomain(entity, {
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
        <ClubPlayersKpi entity={entity} summary={summary} />

        <ClubPlayersFilters
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

      <ClubPlayersTable
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
        context={{ ...context, clubId: entity?.id || '', club: liveClub }}
      />
    </Box>
  )
}
