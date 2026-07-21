// features/playersDatabase/ui/pages/leaguePage/LeagueTeamsTable.js

import { Box, IconButton, Tooltip } from '@mui/joy'

import DataTable from '../../components/tables/DataTable.js'
import { buildTableColumnWidth } from '../../components/tables/tableWidths.js'
import ScoutBadge from '../../components/scout/ScoutBadge.js'
import TeamName from '../../components/teams/TeamName.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { LEAGUE_TEAMS_TABLE_WIDTHS } from './logic/leagueTableWidths.js'
import { leagueContentSx as sx } from './sx/leagueContent.sx.js'

const toCount = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const toNumericValue = value => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const normalizedValue = String(value)
    .replace('%', '')
    .replace(',', '.')
    .trim()

  const nextValue = Number(normalizedValue)

  return Number.isFinite(nextValue)
    ? nextValue
    : null
}

const resolvePrioritySortValue = value => {
  const directValue = toNumericValue(value)
  if (directValue !== null) return directValue

  if (!value || typeof value !== 'object') {
    return String(value || '')
  }

  const numericCandidates = [
    value.percentage,
    value.percent,
    value.performancePercentage,
    value.targetPercentage,
    value.score,
    value.value,
    value.ratio,
  ]

  for (const candidate of numericCandidates) {
    const numericValue = toNumericValue(candidate)

    if (numericValue !== null) {
      return numericValue
    }
  }

  return (
    value.label ||
    value.level ||
    value.priority ||
    ''
  )
}

const columnWidth = key => buildTableColumnWidth(
  LEAGUE_TEAMS_TABLE_WIDTHS[key]
)

const resolveTeamNameStatus = row => {
  const playersCount = toCount(
    row.playersCount ||
    row.rosterCount ||
    row.teamPlayersCount
  )
  const profilesCount = toCount(
    row.profilesCount ||
    row.scoutProfilesCount ||
    row.scoutProfilesSummary?.total
  )

  if (!playersCount) return 'emptyRoster'
  if (!profilesCount) return 'rosterOnly'

  return 'hasProfiles'
}

const resolveTeamNameSx = row => (
  sx.teamNameStatus[resolveTeamNameStatus(row)]
)

const buildColumns = ({ onTeamOpen, onTeamUrlEdit }) => [
  {
    key: 'tableRank',
    label: 'מיקום',
    sx: {
      ...sx.rankColumn,
      ...columnWidth('tableRank'),
    },
    defaultSortDirection: 'asc',
    getSortValue: row => toCount(row.tableRank),
    render: row => (
      <Box sx={sx.rankBadge}>
        {row.tableRank || '-'}
      </Box>
    ),
  },
  {
    key: 'teamAvatar',
    label: '',
    sortable: false,
    sx: {
      ...sx.avatarColumn,
      ...columnWidth('teamAvatar'),
    },
    render: row => (
      <Box
        component='img'
        src={buildFallbackAvatar({
          entityType: 'team',
          id: row.id,
          name: row.name,
          subline: row.teamSlot && row.teamSlot !== '1'
            ? row.teamSlot
            : '',
        })}
        alt=''
        sx={sx.teamAvatar}
      />
    ),
  },
  {
    key: 'name',
    label: 'קבוצה',
    sx: {
      ...sx.teamNameColumn,
      ...columnWidth('name'),
    },
    headerSx: sx.teamNameHeader,
    cellSx: row => ({
      ...sx.teamNameCell,
      ...resolveTeamNameSx(row),
    }),
    getHref: row => row.teamUrl,
    getLinkAriaLabel: row => (
      `פתיחת קישור הקבוצה ${row.name || ''}`
    ),
    getSortValue: row => row.name || '',
    linkSx: row => resolveTeamNameSx(row),
    render: row => (
      <TeamName
        value={row.name}
        slot={row.teamSlot}
        fontSize={13}
        nameSx={sx.teamNameInherit}
      />
    ),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('games'),
    },
    getSortValue: row => toCount(row.games),
  },
  {
    key: 'goalsFor',
    label: 'שערים שכבשו',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('goalsFor'),
    },
    getSortValue: row => toCount(row.goalsFor),
  },
  {
    key: 'goalsAgainst',
    label: 'שערים שספגו',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('goalsAgainst'),
    },
    getSortValue: row => toCount(row.goalsAgainst),
  },
  {
    key: 'points',
    label: 'נקודות',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('points'),
    },
    getSortValue: row => toCount(row.points),
  },
  {
    key: 'attackPriority',
    label: 'ביצוע התקפי',
    sx: {
      ...sx.priorityColumn,
      ...columnWidth('attackPriority'),
    },
    getSortValue: row => (
      resolvePrioritySortValue(row.attackPriority)
    ),
    render: row => (
      <ScoutBadge
        value={row.attackPriority}
        short
        fontSize={11}
      />
    ),
  },
  {
    key: 'defensePriority',
    label: 'ביצוע הגנתי',
    sx: {
      ...sx.priorityColumn,
      ...columnWidth('defensePriority'),
    },
    getSortValue: row => (
      resolvePrioritySortValue(row.defensePriority)
    ),
    render: row => (
      <ScoutBadge
        value={row.defensePriority}
        short
        fontSize={11}
      />
    ),
  },
  {
    key: 'rosterProfiles',
    label: 'סגל / פרופילים',
    sx: {
      ...sx.rosterProfilesColumn,
      ...columnWidth('rosterProfiles'),
    },
    getSortValue: row => (
      (toCount(row.playersCount) * 10000) +
      toCount(row.profilesCount)
    ),
    render: row => (
      <Box sx={sx.rosterProfilesCell}>
        <Box
          component='span'
          sx={sx.rosterProfilesValue}
        >
          {row.playersCount || 0}
        </Box>

        <Box
          component='span'
          sx={sx.rosterProfilesDivider}
        >
          /
        </Box>

        <Box
          component='span'
          sx={sx.rosterProfilesValue}
        >
          {row.profilesCount || 0}
        </Box>
      </Box>
    ),
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    sx: {
      ...sx.actionColumn,
      ...columnWidth('actions'),
    },
    render: row => (
      <Box sx={sx.rowActions}>
        <Tooltip title='כניסה לקבוצה'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='כניסה לקבוצה'
            sx={sx.tableButton}
            onClick={() => onTeamOpen(row)}
          >
            {iconUi({ id: 'view', size: 'sm' })}
          </IconButton>
        </Tooltip>

        <Tooltip title='פעולות נוספות'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='פעולות נוספות'
            sx={sx.tableButton}
            onClick={event => {
              event.stopPropagation()
              onTeamUrlEdit(row)
            }}
          >
            {iconUi({ id: 'more', size: 'sm' })}
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
]

export default function LeagueTeamsTable({
  rows = [],
  loading = false,
  error = '',
  onTeamOpen,
  onTeamUrlEdit,
}) {
  return (
    <DataTable
      className='dpScrollThin'
      columns={buildColumns({
        onTeamOpen,
        onTeamUrlEdit,
      })}
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
