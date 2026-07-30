// features/playersDatabase/ui/pages/leaguePage/LeagueTeamsTable.js

import * as React from 'react'

import DataTable from '../../components/tables/DataTable.js'
import { buildLeagueTeamsColumns } from './logic/leagueTeams.columns.js'
import { leagueContentSx as sx } from './sx/leagueContent.sx.js'

export default function LeagueTeamsTable({
  rows = [],
  loading = false,
  error = '',
  onTeamOpen,
  onTeamUrlEdit,
  onFavoriteToggle,
}) {
  const columns = React.useMemo(() => (
    buildLeagueTeamsColumns({
      onTeamOpen,
      onTeamUrlEdit,
      onFavoriteToggle: row => {
        Promise.resolve(onFavoriteToggle?.(row)).catch(() => {})
      },
    })
  ), [onFavoriteToggle, onTeamOpen, onTeamUrlEdit])

  return (
    <DataTable
      className='dpScrollThin'
      columns={columns}
      rows={rows}
      getRowKey={row => row.id}
      defaultSort={{
        key: 'tableRank',
        direction: 'asc',
      }}
      emptyText={
        loading
          ? 'טוען נתוני ליגה...'
          : error || 'אין נתוני טבלה לעונה שנבחרה'
      }
      tableSx={sx.leagueTable}
    />
  )
}
