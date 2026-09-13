import { Box, IconButton, Tooltip } from '@mui/joy'

import LeagueName from '../../../components/entities/LeagueName.js'
import TeamName from '../../../components/entities/TeamName.js'
import ScoutBadge from '../../../components/scout/shared/ScoutBadge.js'
import TableRankBadge from '../../../components/tables/TableRankBadge.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { clubExpandedTeamColumnWidth } from './clubExpandedTeamTableWidths.js'

const displayNumber = value => (
  value === null || value === undefined || value === '' ? '?' : value
)

export const buildClubExpandedTeamColumns = ({
  onOpenTeam,
  onOpenTeamDocumentJson,
  sx,
} = {}) => [
  {
    key: 'team',
    label: 'קבוצה',
    sortable: false,
    sx: { ...sx.teamTableTeamColumn, ...clubExpandedTeamColumnWidth('team') },
    cellSx: { verticalAlign: 'middle' },
    headerSx: sx.teamTableTeamHeader,
    render: row => (
      <Box
        sx={[
          sx.teamTableIdentity,
          row.fullWidthMessage && sx.missingTeamTableIdentity,
        ]}
        onClick={row.fullWidthMessage ? undefined : () => onOpenTeam?.(row)}
      >
        <TeamName value={row.teamName} slot={row.slot} fontSize={12} />
        <Box component='span' sx={sx.teamTableBirthYear}>
          {row.birthYear || '?'}
        </Box>
      </Box>
    ),
  },
  {
    key: 'league',
    label: 'ליגה',
    sortable: false,
    sx: { ...sx.teamTableLeagueColumn, ...clubExpandedTeamColumnWidth('league') },
    headerSx: sx.teamTableHeader,
    render: row => (
      <LeagueName
        value={row.leagueName}
        level={row.leagueLevel}
        showLevel
        fontSize={11}
        levelFontSize={9}
      />
    ),
  },
  {
    key: 'tableRank',
    label: 'מיקום',
    sx: { ...sx.teamTableNumericColumn, ...clubExpandedTeamColumnWidth('tableRank') },
    headerSx: sx.teamTableHeader,
    render: row => <TableRankBadge value={row.tableRank} />,
  },
  {
    key: 'gamesPlayed',
    label: 'משחקים',
    sx: { ...sx.teamTableNumericColumn, ...clubExpandedTeamColumnWidth('gamesPlayed') },
    headerSx: sx.teamTableHeader,
    render: row => displayNumber(row.gamesPlayed),
  },
  {
    key: 'playersCount',
    label: 'שחקנים בסגל',
    sx: { ...sx.teamTableNumericColumn, ...clubExpandedTeamColumnWidth('playersCount') },
    headerSx: sx.teamTableHeader,
    render: row => displayNumber(row.playersCount),
  },
  {
    key: 'defensePriority',
    label: 'עדיפות הגנתית',
    sx: { ...sx.teamTablePriorityColumn, ...clubExpandedTeamColumnWidth('defensePriority') },
    headerSx: sx.teamTableHeader,
    render: row => (
      <ScoutBadge
        value={row.defensePriorityValue}
        label={row.defensePriorityLabel}
        short={!row.defensePriorityLabel}
        fontSize={10}
      />
    ),
  },
  {
    key: 'offensePriority',
    label: 'עדיפות התקפית',
    sx: { ...sx.teamTablePriorityColumn, ...clubExpandedTeamColumnWidth('offensePriority') },
    headerSx: sx.teamTableHeader,
    render: row => (
      <ScoutBadge
        value={row.offensePriorityValue}
        label={row.offensePriorityLabel}
        short={!row.offensePriorityLabel}
        fontSize={10}
      />
    ),
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    sx: { ...sx.teamTableActionColumn, ...clubExpandedTeamColumnWidth('actions') },
    headerSx: sx.teamTableHeader,
    render: row => (
      <Tooltip title='הצגת מסמך קבוצה קנוני'>
        <IconButton
          size='sm'
          variant='plain'
          aria-label='הצגת מסמך קבוצה קנוני'
          onClick={() => onOpenTeamDocumentJson?.(row)}
        >
          {iconUi({ id: 'dataShow', size: 'sm' })}
        </IconButton>
      </Tooltip>
    ),
  },
]
