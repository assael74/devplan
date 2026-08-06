// features/playersDatabase/ui/pages/teamPage/TeamPlayersTable.js

import * as React from 'react'

import DataTable from '../../components/tables/DataTable.js'
import { buildTeamPlayersColumns } from './logic/teamPlayers.columns.js'
import { teamContentSx as sx } from './sx/teamContent.sx.js'

export default function TeamPlayersTable({
  players,
  onPlayerOpen,
  onRoleOpen,
  onPlayerUrlEdit,
  onFavoriteToggle,
}) {
  const columns = React.useMemo(() => (
    buildTeamPlayersColumns({
      onPlayerOpen,
      onRoleOpen,
      onPlayerUrlEdit,
      onFavoriteToggle: row => {
        Promise.resolve(onFavoriteToggle?.(row)).catch(() => {})
      },
    })
  ), [onFavoriteToggle, onPlayerOpen, onPlayerUrlEdit, onRoleOpen])

  return (
    <DataTable
      className='dpScrollThin'
      columns={columns}
      rows={players}
      getRowKey={row => row.id}
      defaultSort={{
        key: 'minutes',
        direction: 'desc',
      }}
      wrapSx={sx.tableWrap}
      tableSx={sx.playersTable}
      getRowSx={row => (
        row.rosterStatus === 'youngerAgeGroup'
          ? sx.youngerAgeRow
          : null
      )}
    />
  )
}
