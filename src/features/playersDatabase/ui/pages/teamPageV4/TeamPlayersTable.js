// features/playersDatabase/ui/pages/teamPage/TeamPlayersTable.js

import * as React from 'react'

import DataTable from '../../components/tables/dataTable/index.js'
import { buildTeamPlayersColumns } from './logic/teamPlayers.columns.js'
import { teamPlayersTableSx as sx } from './sx/teamPlayersTable.sx.js'


const clean = value => String(
  value === null || value === undefined ? '' : value
).trim()

const toNumber = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const ROSTER_STATUS_LABELS = {
  regular: 'בסגל',
  youngerAgeGroup: 'שנתון צעיר',
  transferredOut: 'עזב במהלך העונה',
  transferredIn: 'הצטרף במהלך העונה',
  retired: 'פרש',
}

const TRANSFER_DIRECTION_LABELS = {
  up: 'עלה ברמה',
  lateral: 'אותה רמה',
  down: 'ירד ברמה',
  unknown: 'לא ידוע',
}

const resolveActual = row => (
  row?.stats?.actual ||
  row?.playerStats ||
  {}
)

const buildTeamPlayersExportConfig = ({ players, team, seasonKey }) => ({
  enabled: players.length > 0,
  placementColumnKey: 'actions',
  align: 'end',
  buttonLabel: 'Excel',
  tooltip: 'הורדת גיבוי סגל וסטטיסטיקה',
  fileName: [
    'team-backup',
    clean(team?.name) || 'team',
    clean(seasonKey) || 'season',
  ].join('-'),
  sheetName: 'Team Backup',
  columns: [
    {
      key: 'index',
      label: 'אינדקס',
      value: (row, index) => index + 1,
    },
    {
      key: 'fullName',
      label: 'שם השחקן',
      value: row => clean(row?.fullName),
    },
    {
      key: 'rosterStatus',
      label: 'סטטוס סגל',
      value: row => ROSTER_STATUS_LABELS[clean(row?.rosterStatus)] || 'בסגל',
    },
    {
      key: 'manualTransferDirection',
      label: 'כיוון מעבר',
      value: row => clean(row?.rosterStatus) === 'transferredOut'
        ? (TRANSFER_DIRECTION_LABELS[clean(row?.manualTransferDirection)] || 'לא ידוע')
        : '',
    },
    {
      key: 'birthYear',
      label: 'שנתון',
      value: row => toNumber(
        row?.season?.birthYear ||
        team?.birthYear
      ),
    },
    {
      key: 'externalPlayerId',
      label: 'מזהה שחקן',
      value: row => clean(row?.externalPlayerId),
    },
    {
      key: 'playerUrl',
      label: 'קישור שחקן',
      value: row => clean(row?.playerUrl),
    },
    {
      key: 'numShirt',
      label: 'מספר חולצה',
      value: row => clean(row?.numShirt),
    },
    {
      key: 'games',
      label: 'משחקי ליגה',
      value: row => toNumber(row?.games),
    },
    {
      key: 'goals',
      label: 'שערי ליגה',
      value: row => toNumber(row?.goals),
    },
    {
      key: 'yellowCards',
      label: 'צהובים ליגה',
      value: row => toNumber(row?.yellowCards),
    },
    {
      key: 'starts',
      label: 'הרכב פותח',
      value: row => toNumber(row?.starts),
    },
    {
      key: 'substituteIn',
      label: 'נכנס כמחליף',
      value: row => toNumber(resolveActual(row).substituteIn),
    },
    {
      key: 'substitutedOut',
      label: 'הוחלף',
      value: row => toNumber(resolveActual(row).substitutedOut),
    },
    {
      key: 'minutes',
      label: 'דקות ליגה',
      value: row => toNumber(row?.minutes),
    },
    {
      key: 'positionLayer',
      label: 'חוליה',
      value: row => clean(row?.positionLayer),
    },
    {
      key: 'primaryPosition',
      label: 'עמדה',
      value: row => clean(row?.primaryPosition),
    },
    {
      key: 'profile',
      label: 'פרופיל סקאוט',
      value: row => clean(row?.profile),
    },
  ],
})

export default function TeamPlayersTable({
  players,
  team,
  seasonKey,
  onPlayerOpen,
  onPlayerUrlEdit,
  onFavoriteToggle,
}) {
  const columns = React.useMemo(() => (
    buildTeamPlayersColumns({
      onPlayerOpen,
      onPlayerUrlEdit,
      onFavoriteToggle: row => {
        Promise.resolve(onFavoriteToggle?.(row)).catch(() => {})
      },
    })
  ), [onFavoriteToggle, onPlayerOpen, onPlayerUrlEdit])

  const exportConfig = React.useMemo(
    () => buildTeamPlayersExportConfig({
      players,
      team,
      seasonKey,
    }),
    [players, seasonKey, team]
  )

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
      exportConfig={exportConfig}
    />
  )
}
