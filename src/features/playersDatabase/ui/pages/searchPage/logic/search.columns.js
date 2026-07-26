// features/playersDatabase/ui/pages/searchPage/logic/search.columns.js

import { Box, IconButton } from '@mui/joy'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'

import ScoutPriority from '../../../components/scout/ScoutPriority.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import ScoutProfileTooltip from '../../../components/scout/ScoutProfileTooltip.js'
import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { buildPlayerScoutProfileOptions } from '../../../logic/scoutDisplay.logic.js'
import { searchResultsTableSx as sx } from '../results/sx/searchResultsTable.sx.js'
import { SEARCH_RESULTS_TABLE_WIDTHS } from './searchTableWidths.js'

const columnWidth = key => buildTableColumnWidth(SEARCH_RESULTS_TABLE_WIDTHS[key])

const PROFILE_OPTION_BY_ID = buildPlayerScoutProfileOptions().reduce((map, option) => {
  map[option.value] = option
  return map
}, {})

const buildProfileTooltip = profileDisplay => {
  const option = PROFILE_OPTION_BY_ID[profileDisplay?.id]
  if (!option?.profile) return profileDisplay?.label || profileDisplay?.id || ''

  return (
    <ScoutProfileTooltip
      profile={option.profile}
      fields={[
        'parameters',
        'group',
        'interest',
        'teamFilter',
        'positionContext',
        'positionDependency',
        'reviews',
      ]}
    />
  )
}

const buildIndexColumn = () => ({
  key: 'number',
  label: '#',
  sortable: false,
  sx: { ...sx.indexColumn, ...columnWidth('number') },
  render: (row, index) => index + 1,
})

const buildActionsColumn = () => ({
  key: 'actions',
  label: '',
  sortable: false,
  sx: { ...sx.actionsColumn, ...columnWidth('actions') },
  render: (row, index, context = {}) => (
    <IconButton
      size='sm'
      variant='outlined'
      aria-label={context.isExpanded ? 'סגירת פרטים' : 'פתיחת פרטים'}
      sx={sx.actionButton}
      onClick={event => {
        event.stopPropagation()
        context.toggleExpanded?.()
      }}
    >
      {context.isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </IconButton>
  ),
})

export function buildPlayerSearchColumns() {
  return [
    buildIndexColumn(),
    {
      key: 'avatar', label: '', sortable: false,
      sx: { ...sx.avatarColumn, ...columnWidth('avatar') },
      render: row => <Box component='img' src={row.avatarUrl || playerImage} alt='' sx={sx.avatar} />,
    },
    { key: 'playerName', label: 'שחקן', sx: { ...sx.playerColumn, ...columnWidth('playerName') } },
    { key: 'birthYear', label: 'שנתון', sx: { ...sx.yearColumn, ...columnWidth('birthYear') } },
    { key: 'seasonKey', label: 'עונה', sx: { ...sx.seasonColumn, ...columnWidth('seasonKey') } },
    { key: 'teamName', label: 'קבוצה', sx: { ...sx.teamColumn, ...columnWidth('teamName') } },
    { key: 'leagueName', label: 'ליגה', sx: { ...sx.leagueColumn, ...columnWidth('leagueName') } },
    { key: 'minutes', label: 'דקות', sx: { ...sx.numberColumn, ...columnWidth('minutes') } },
    {
      key: 'startsAppearances', label: 'הרכב',
      sx: { ...sx.numberColumn, ...columnWidth('startsAppearances') },
      render: row => `${Number(row.starts || 0)}/${Number(row.appearances || 0)}`,
      getSortValue: row => Number(row.starts || 0),
    },
    { key: 'goals', label: 'שערים', sx: { ...sx.numberColumn, ...columnWidth('goals') } },
    {
      key: 'primaryProfile', label: 'פרופיל סקאוט',
      sx: { ...sx.profileColumn, ...columnWidth('primaryProfile') },
      render: row => {
        const display = row.scoutProfileDisplay || {}
        if (!display.label || display.label === '-') return '-'
        return (
          <Box sx={sx.profileCell}>
            <ScoutProfileChip
              label={display.label}
              tooltip={buildProfileTooltip(display)}
              variant={display.type === 'combination' ? 'combination' : 'default'}
              fontSize={11}
            />
          </Box>
        )
      },
    },
    buildActionsColumn(),
  ]
}

export function buildTeamSearchColumns() {
  return [
    buildIndexColumn(),
    { key: 'teamName', label: 'קבוצה', sx: { ...sx.teamColumn, ...columnWidth('teamName') } },
    { key: 'birthYear', label: 'שנתון', sx: { ...sx.yearColumn, ...columnWidth('birthYear') } },
    { key: 'seasonKey', label: 'עונה', sx: { ...sx.seasonColumn, ...columnWidth('seasonKey') } },
    { key: 'leagueName', label: 'ליגה', sx: { ...sx.leagueColumn, ...columnWidth('leagueName') } },
    { key: 'tableRank', label: 'מיקום', sx: { ...sx.numberColumn, ...columnWidth('tableRank') } },
    { key: 'appearances', label: 'משחקים', sx: { ...sx.numberColumn, ...columnWidth('appearances') } },
    { key: 'goalsFor', label: 'זכות', sx: { ...sx.numberColumn, ...columnWidth('goalsFor') } },
    { key: 'goalsAgainst', label: 'חובה', sx: { ...sx.numberColumn, ...columnWidth('goalsAgainst') } },
    {
      key: 'attackPriority', label: 'ביצוע התקפי',
      sx: { ...sx.priorityColumn, ...columnWidth('attackPriority') },
      render: row => <ScoutPriority value={row.offense?.priorityLevel} short fontSize={11} />,
      getSortValue: row => Number(row.offense?.priorityRate || 0),
    },
    {
      key: 'defensePriority', label: 'ביצוע הגנתי',
      sx: { ...sx.priorityColumn, ...columnWidth('defensePriority') },
      render: row => <ScoutPriority value={row.defense?.priorityLevel} short fontSize={11} />,
      getSortValue: row => Number(row.defense?.priorityRate || 0),
    },
    { key: 'playersCount', label: 'שחקנים', sx: { ...sx.numberColumn, ...columnWidth('playersCount') } },
    buildActionsColumn(),
  ]
}

export function buildSearchColumns({ entityType = 'player' } = {}) {
  return entityType === 'team'
    ? buildTeamSearchColumns()
    : buildPlayerSearchColumns()
}
