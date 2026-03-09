// previewDomainCard/domains/team/players/TeamPlayersDomainModal.js
import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'
import TeamPlayersKpi from './components/TeamPlayersKpi'
import TeamPlayersFilters from './components/TeamPlayersFilters'
import TeamPlayersTable from './components/TeamPlayersTable'
import EditDrawer from './components/drawer/EditDrawer.js'
import { resolveTeamPlayersDomain } from './logic/teamPlayers.domain.logic'
import { modalRootSx } from './sx/teamPlayersModal.sx'

export default function TeamPlayersDomainModal({ entity }) {
  const [q, setQ] = useState('')
  const [minutesBelow, setMinutesBelow] = React.useState(50)
  const [onlyKey, setOnlyKey] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)

  const { summary, rows } = resolveTeamPlayersDomain(entity, {
    q,
    onlyKey,
    minutesBelow,
  })

  if (!entity) return null

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
    </Box>
  )
}
