// features/playersDatabase/ui/pages/teamPage/logic/teamPlayers.columns.js

import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { dataTableColumnsSx as columnSx } from '../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { dataTableActionsSx as actionSx } from '../../../components/tables/dataTable/sx/dataTableActions.sx.js'
import ScoutStoryChip from '../../../components/scout/ScoutStoryChip.js'
import { buildScoutCompactView } from '../../../components/scout/scoutDisplay.model.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import PlayerLineClassificationChip from '../../../components/playerMeta/PlayerLineClassificationChip.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { TEAM_PLAYERS_TABLE_WIDTHS } from './teamTableWidths.js'
import { teamPlayersColumnsSx as sx } from '../sx/teamPlayers.columns.sx.js'

const PLAYER_STATUS_DISPLAY = {
  youngerAgeGroup: { label: 'שנתון צעיר', iconId: 'rosterYounger', color: 'primary' },
  transferredOut: { label: 'עזב במהלך העונה', iconId: 'rosterLeft', color: 'danger' },
  retired: { label: 'פרש', iconId: 'rosterRetired', color: 'neutral' },
  transferredIn: { label: 'הצטרף במהלך העונה', iconId: 'rosterJoined', color: 'success' },
}

const toCount = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const columnWidth = key => buildTableColumnWidth(
  TEAM_PLAYERS_TABLE_WIDTHS[key]
)

const renderPlayerName = row => {
  const status = PLAYER_STATUS_DISPLAY[row.rosterStatus]

  return (
    <Box sx={columnSx.nameContent}>
      <Box component='span' sx={columnSx.nameText}>{row.fullName || '-'}</Box>
      {status ? (
        <Tooltip title={status.label}>
          <Box component='span' aria-label={status.label} sx={sx.playerStatusBadge(status.color)}>
            {iconUi({ id: status.iconId, size: 'sm' })}
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  )
}

export const buildTeamPlayersColumns = ({ onPlayerOpen, onPlayerUrlEdit }) => [
  {
    key: 'number',
    label: '#',
    sortable: false,
    sx: {
      ...columnSx.indexColumn,
      ...columnWidth('number'),
    },
    render: (row, index) => index + 1,
  },
  {
    key: 'avatar',
    label: '',
    sortable: false,
    sx: {
      ...columnSx.avatarColumn,
      ...columnWidth('avatar'),
    },
    render: row => (
      <Box
        component='img'
        src={row.avatarUrl || playerImage}
        alt=''
        sx={columnSx.avatarImage}
      />
    ),
  },
  {
    key: 'fullName',
    label: 'שם שחקן',
    sx: {
      ...columnSx.nameColumn,
      ...columnWidth('fullName'),
    },
    headerSx: columnSx.nameHeader,
    cellSx: columnSx.nameCell,
    getHref: row => row.playerUrl,
    getLinkAriaLabel: row => `פתיחת קישור השחקן ${row.fullName || ''}`,
    getSortValue: row => row.fullName || '',
    render: renderPlayerName,
  },
  {
    key: 'lineClassification',
    label: 'חוליה / עמדה',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('lineClassification'),
    },
    getSortValue: row => [
      row.lineClassification?.line || '',
      row.lineClassification?.position || '',
    ].join(' '),
    render: row => (
      <PlayerLineClassificationChip
        classification={row.lineClassification}
      />
    ),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('games'),
    },
    getSortValue: row => toCount(row.games),
  },
  {
    key: 'goals',
    label: 'שערים',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('goals'),
    },
    getSortValue: row => toCount(row.goals),
  },
  {
    key: 'starts',
    label: 'הרכב',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('starts'),
    },
    getSortValue: row => toCount(row.starts),
  },
  {
    key: 'yellowCards',
    label: 'צהובים',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('yellowCards'),
    },
    getSortValue: row => toCount(row.yellowCards),
  },
  {
    key: 'minutes',
    label: 'דקות',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('minutes'),
    },
    defaultSortDirection: 'desc',
    getSortValue: row => toCount(row.minutes),
  },
  {
    key: 'profile',
    label: 'פרופיל סקאוט',
    sx: {
      ...columnSx.profileColumn,
      ...columnWidth('profile'),
    },
    getSortValue: row => buildScoutCompactView({
      profiles: row.scoutProfiles,
      combinations: row.scoutCombinations,
      display: row.scoutProfileDisplay,
      fallbackLabel: row.profile,
      player: row,
    }).label,
    render: row => {
      const profileDisplay = row.scoutProfileDisplay || {}
      const profileView = buildScoutCompactView({
        profiles: row.scoutProfiles,
        combinations: row.scoutCombinations,
        display: profileDisplay,
        fallbackLabel: row.profile,
        player: row,
      })
      const chipLabel = profileView.label

      return (
        <Box sx={sx.profileCell}>
          <ScoutStoryChip
            player={row}
            label={chipLabel}
            fontSize={11}
          />
        </Box>
      )
    },
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    sx: {
      ...columnSx.actionsColumn,
      ...columnWidth('actions'),
    },
    render: row => (
      <Box sx={actionSx.rowActions}>
        {onPlayerOpen ? (
          <Tooltip title='כניסה לשחקן'>
            <IconButton
              size='sm'
              variant='outlined'
              aria-label='כניסה לשחקן'
              sx={actionSx.actionButton}
              onClick={() => onPlayerOpen(row)}
            >
              {iconUi({
                id: 'view',
                size: 'sm',
              })}
            </IconButton>
          </Tooltip>
        ) : null}

        <Tooltip title='פעולות נוספות'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='פעולות נוספות'
            sx={actionSx.actionButton}
            onClick={event => {
              event.stopPropagation()
              onPlayerUrlEdit(row)
            }}
          >
            {iconUi({
              id: 'more',
              size: 'sm',
            })}
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
]
