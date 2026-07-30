// features/playersDatabase/ui/pages/leaguePage/LeagueTeamsTable.js

import * as React from 'react'

import DataTable from '../../components/tables/DataTable.js'
import { buildLeagueTeamsColumns } from './logic/leagueTeams.columns.js'
import { leagueContentSx as sx } from './sx/leagueContent.sx.js'

const clean = value => String(value || '').trim()
const resolveTeamUrl = row => clean(row?.teamUrl || row?.teamStats?.teamUrl)
const resolveTeamName = row => clean(row?.name || row?.teamName || row?.displayName)

const buildTeamLinksExportConfig = selectedSeasonOption => ({
  enabled: true,
  placementColumnKey: 'actions',
  buttonLabel: 'Excel',
  tooltip: 'הורדת קישורי קבוצות',
  fileName: `league-team-links-${clean(selectedSeasonOption?.seasonKey) || 'season'}`,
  sheetName: 'Team Links',
  rawRows: Array.isArray(selectedSeasonOption?.season?.tableRank)
    ? selectedSeasonOption.season.tableRank
    : [],
  getRows: rows => rows.filter(row => resolveTeamUrl(row)),
  columns: [
    {
      key: 'teamName',
      label: 'שם קבוצה',
      value: row => resolveTeamName(row),
    },
    {
      key: 'teamUrl',
      label: 'קישור',
      value: row => resolveTeamUrl(row),
    },
  ],
})

export default function LeagueTeamsTable({
  rows = [],
  loading = false,
  error = '',
  selectedSeasonOption = null,
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
  const exportConfig = React.useMemo(
    () => buildTeamLinksExportConfig(selectedSeasonOption),
    [selectedSeasonOption]
  )

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
      exportConfig={exportConfig}
    />
  )
}
