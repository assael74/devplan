// src/features/playersDatabase/ui/pages/leaguePage/LeagueTeamsTable.js

import * as React from 'react'

import PageContentPanel from '../../components/page/PageContentPanel.js'
import DataTable from '../../components/tables/dataTable/index.js'
import { buildLeagueTeamsColumns } from './logic/leagueTeams.columns.js'
import { leagueTeamsTableSx as sx } from './sx/leagueTeamsTable.sx.js'

const clean = value => String(value || '').trim()
const toNumber = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const PRIORITY_LABELS = {
  elite: 'יעד מוביל',
  high: 'עדיפות גבוהה',
  positive: 'חיובי',
  neutral: 'רגיל',
  low: 'עדיפות נמוכה',
  unavailable: 'לא זמין',
}

const resolveTeamUrl = row => clean(row?.teamUrl || row?.teamStats?.teamUrl)
const resolveTeamName = row => clean(row?.name || row?.teamName || row?.displayName)
const resolveTeamStats = row => row?.teamStats || {}
const resolvePriorityLabel = value => PRIORITY_LABELS[clean(value)] || clean(value)

const buildLeagueTableExportConfig = ({
  selectedSeasonOption,
  rowsCount = 0,
} = {}) => ({
  enabled: rowsCount > 0,
  placementColumnKey: 'actions',
  align: 'end',
  buttonLabel: 'Excel',
  tooltip: 'הורדת טבלת הליגה המלאה',
  fileName: `league-table-${clean(selectedSeasonOption?.seasonKey) || 'season'}`,
  sheetName: 'League Table',
  getRows: rows => rows,
  columns: [
    {
      key: 'tableRank',
      label: 'מיקום',
      value: row => toNumber(row?.tableRank),
    },
    {
      key: 'teamName',
      label: 'קבוצה',
      value: row => resolveTeamName(row),
    },
    {
      key: 'games',
      label: 'משחקים',
      value: row => toNumber(row?.games),
    },
    {
      key: 'wins',
      label: 'ניצחונות',
      value: row => toNumber(resolveTeamStats(row).wins),
    },
    {
      key: 'draws',
      label: 'תיקו',
      value: row => toNumber(resolveTeamStats(row).draws),
    },
    {
      key: 'losses',
      label: 'הפסדים',
      value: row => toNumber(resolveTeamStats(row).losses),
    },
    {
      key: 'goalsFor',
      label: 'שערי זכות',
      value: row => toNumber(row?.goalsFor),
    },
    {
      key: 'goalsAgainst',
      label: 'שערי חובה',
      value: row => toNumber(row?.goalsAgainst),
    },
    {
      key: 'goalDifference',
      label: 'הפרש שערים',
      value: row => (
        toNumber(row?.goalsFor) -
        toNumber(row?.goalsAgainst)
      ),
    },
    {
      key: 'points',
      label: 'נקודות',
      value: row => toNumber(row?.points),
    },
    {
      key: 'attackPriority',
      label: 'עדיפות התקפית',
      value: row => resolvePriorityLabel(row?.attackPriority),
    },
    {
      key: 'defensePriority',
      label: 'עדיפות הגנתית',
      value: row => resolvePriorityLabel(row?.defensePriority),
    },
    {
      key: 'playersCount',
      label: 'שחקנים',
      value: row => toNumber(row?.playersCount),
    },
    {
      key: 'profilesCount',
      label: 'פרופילים',
      value: row => toNumber(row?.profilesCount),
    },
    {
      key: 'profileAssignmentsCount',
      label: 'שיוכי פרופילים',
      value: row => toNumber(row?.profileAssignmentsCount),
    },
    {
      key: 'teamUrl',
      label: 'קישור מועדון',
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
    () => buildLeagueTableExportConfig({
      selectedSeasonOption,
      rowsCount: rows.length,
    }),
    [rows.length, selectedSeasonOption]
  )

  return (
    <PageContentPanel
      title='טבלת ליגה'
      meta={`${rows.length} קבוצות`}
    >
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
        wrapSx={sx.tableWrap}
        tableSx={sx.leagueTable}
        exportConfig={exportConfig}
      />
    </PageContentPanel>
  )
}
