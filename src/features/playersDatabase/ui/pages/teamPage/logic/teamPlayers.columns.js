// features/playersDatabase/ui/pages/teamPage/logic/teamPlayers.columns.js

import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import ScoutCompactTooltip from '../../../components/scout/ScoutCompactTooltip.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import { buildScoutCompactView } from '../../../components/scout/scoutDisplay.model.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import {
  PlayerPositionChip,
  getPlayerLayerLabel,
  getPlayerPositionLabel,
} from '../../../components/playerPosition/index.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { TEAM_PLAYERS_TABLE_WIDTHS } from './teamTableWidths.js'
import { teamPlayersColumnsSx as sx } from '../sx/teamPlayers.columns.sx.js'

const PLAYER_STATUS_DISPLAY = {
  youngerAgeGroup: {
    label: 'שנתון צעיר',
    iconId: 'rosterYounger',
    color: 'primary',
  },
  transferredOut: {
    label: 'עזב במהלך העונה',
    iconId: 'rosterLeft',
    color: 'danger',
  },
  retired: {
    label: 'פרש',
    iconId: 'rosterRetired',
    color: 'neutral',
  },
  transferredIn: {
    label: 'הצטרף במהלך העונה',
    iconId: 'rosterJoined',
    color: 'success',
  },
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
    <Box sx={sx.playerNameContent}>
      <Box component='span' sx={sx.playerNameText}>
        {row.fullName || '-'}
      </Box>

      {status ? (
        <Tooltip title={status.label}>
          <Box
            component='span'
            aria-label={status.label}
            sx={sx.playerStatusBadge(status.color)}
          >
            {iconUi({
              id: status.iconId,
              size: 'sm',
            })}
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  )
}

export const buildTeamPlayersColumns = ({
  onPlayerOpen,
  onRoleOpen,
  onPlayerUrlEdit,
}) => [
  {
    key: 'number',
    label: '#',
    sortable: false,
    sx: {
      ...sx.indexColumn,
      ...columnWidth('number'),
    },
    render: (row, index) => index + 1,
  },
  {
    key: 'avatar',
    label: '',
    sortable: false,
    sx: {
      ...sx.avatarColumn,
      ...columnWidth('avatar'),
    },
    render: row => (
      <Box
        component='img'
        src={row.avatarUrl || playerImage}
        alt=''
        sx={sx.playerAvatar}
      />
    ),
  },
  {
    key: 'fullName',
    label: 'שם שחקן',
    sx: {
      ...sx.playerNameColumn,
      ...columnWidth('fullName'),
    },
    headerSx: sx.playerNameHeader,
    cellSx: sx.playerNameCell,
    getHref: row => row.playerUrl,
    getLinkAriaLabel: row => `פתיחת קישור השחקן ${row.fullName || ''}`,
    getSortValue: row => row.fullName || '',
    render: renderPlayerName,
  },
  {
    key: 'positionLayer',
    label: 'חוליה',
    sx: {
      ...sx.layerColumn,
      ...columnWidth('positionLayer'),
    },
    getSortValue: row => getPlayerLayerLabel(row.positionLayer),
    render: row => (
      <PlayerPositionChip
        type='layer'
        positionLayer={row.positionLayer}
        primaryPosition={row.primaryPosition}
        onClick={() => onRoleOpen(row)}
      />
    ),
  },
  {
    key: 'primaryPosition',
    label: 'עמדה',
    sx: {
      ...sx.positionColumn,
      ...columnWidth('primaryPosition'),
    },
    getSortValue: row => getPlayerPositionLabel(row.primaryPosition),
    render: row => (
      <PlayerPositionChip
        type='position'
        positionLayer={row.positionLayer}
        primaryPosition={row.primaryPosition}
        onClick={() => onRoleOpen(row)}
      />
    ),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: {
      ...sx.statColumn,
      ...columnWidth('games'),
    },
    getSortValue: row => toCount(row.games),
  },
  {
    key: 'goals',
    label: 'שערים',
    sx: {
      ...sx.statColumn,
      ...columnWidth('goals'),
    },
    getSortValue: row => toCount(row.goals),
  },
  {
    key: 'starts',
    label: 'הרכב',
    sx: {
      ...sx.statColumn,
      ...columnWidth('starts'),
    },
    getSortValue: row => toCount(row.starts),
  },
  {
    key: 'yellowCards',
    label: 'צהובים',
    sx: {
      ...sx.statColumn,
      ...columnWidth('yellowCards'),
    },
    getSortValue: row => toCount(row.yellowCards),
  },
  {
    key: 'minutes',
    label: 'דקות',
    sx: {
      ...sx.minutesColumn,
      ...columnWidth('minutes'),
    },
    defaultSortDirection: 'desc',
    getSortValue: row => toCount(row.minutes),
  },
  {
    key: 'profile',
    label: 'פרופיל סקאוט',
    sx: {
      ...sx.profileColumn,
      ...columnWidth('profile'),
    },
    getSortValue: row => buildScoutCompactView({
      profiles: row.scoutProfiles,
      combinations: row.scoutCombinations,
      display: row.scoutProfileDisplay,
      fallbackLabel: row.profile,
    }).label,
    render: row => {
      const profileDisplay = row.scoutProfileDisplay || {}
      const profileView = buildScoutCompactView({
        profiles: row.scoutProfiles,
        combinations: row.scoutCombinations,
        display: profileDisplay,
        fallbackLabel: row.profile,
      })
      const reliability = (
        profileDisplay.reliability?.level ||
        row.reliability ||
        ''
      )

      if (!profileView.label || profileView.label === '-') return '-'

      return (
        <Box sx={sx.profileCell}>
          <ScoutProfileChip
            label={
              reliability && reliability !== '-'
                ? `${profileView.label} · ${reliability}`
                : profileView.label
            }
            tooltip={(
              <ScoutCompactTooltip
                title={profileView.tooltipTitle}
                items={profileView.tooltipItems}
                isCombination={profileView.isCombination}
              />
            )}
            variant={profileView.variant}
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
      ...sx.actionsColumn,
      ...columnWidth('actions'),
    },
    render: row => (
      <Box sx={sx.rowActions}>
        <Tooltip title='כניסה לשחקן'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='כניסה לשחקן'
            sx={sx.tableIconButton}
            onClick={() => onPlayerOpen(row)}
          >
            {iconUi({
              id: 'view',
              size: 'sm',
            })}
          </IconButton>
        </Tooltip>

        <Tooltip title='פעולות נוספות'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='פעולות נוספות'
            sx={sx.tableIconButton}
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
