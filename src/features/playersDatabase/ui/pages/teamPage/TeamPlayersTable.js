// features/playersDatabase/ui/pages/teamPage/TeamPlayersTable.js

import * as React from 'react'
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/joy'

import DataTable from '../../components/tables/DataTable.js'
import { buildTableColumnWidth } from '../../components/tables/tableWidths.js'
import ScoutProfileChip from '../../components/scout/ScoutProfileChip.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import {
  POSITION_LAYER_OPTIONS,
  POSITION_OPTIONS,
} from './logic/teamPage.constants.js'
import { TEAM_PLAYERS_TABLE_WIDTHS } from './logic/teamTableWidths.js'
import { getOptionLabel } from './logic/teamPage.utils.js'
import { teamContentSx as sx } from './sx/teamContent.sx.js'

const toCount = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const hasRoleValue = value => {
  const nextValue = String(value || '').trim()
  return !!nextValue && nextValue !== 'none' && nextValue !== '-'
}

const columnWidth = key => buildTableColumnWidth(
  TEAM_PLAYERS_TABLE_WIDTHS[key]
)

const buildProfileTooltip = profileDisplay => {
  if (profileDisplay?.type !== 'combination') {
    return profileDisplay?.label || ''
  }

  return (
    <Box sx={sx.profileTooltip}>
      <Box sx={sx.profileTooltipTitle}>
        {profileDisplay.label}
      </Box>

      <Box sx={sx.profileTooltipMeta}>
        פרופיל משולב מתוך:
      </Box>

      <Box sx={sx.profileTooltipList}>
        {(profileDisplay.baseProfiles || []).map(profile => (
          <Box key={profile.id} sx={sx.profileTooltipItem}>
            {profile.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default function TeamPlayersTable({
  players,
  onPlayerOpen,
  onRoleOpen,
  onPlayerUrlEdit,
}) {
  const columns = React.useMemo(() => [
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
    },
    {
      key: 'positionLayer',
      label: 'חוליה',
      sx: {
        ...sx.layerColumn,
        ...columnWidth('positionLayer'),
      },
      getSortValue: row => (
        getOptionLabel(POSITION_LAYER_OPTIONS, row.positionLayer) || ''
      ),
      render: row => (
        <Chip
          variant='soft'
          onClick={() => onRoleOpen(row)}
          sx={[
            sx.roleChip,
            hasRoleValue(row.positionLayer) && sx.roleChipSelected,
          ]}
        >
          {getOptionLabel(POSITION_LAYER_OPTIONS, row.positionLayer)}
        </Chip>
      ),
    },
    {
      key: 'primaryPosition',
      label: 'עמדה',
      sx: {
        ...sx.positionColumn,
        ...columnWidth('primaryPosition'),
      },
      getSortValue: row => (
        getOptionLabel(POSITION_OPTIONS, row.primaryPosition) || ''
      ),
      render: row => (
        <Chip
          variant='soft'
          onClick={() => onRoleOpen(row)}
          sx={[
            sx.roleChip,
            hasRoleValue(row.primaryPosition) && sx.roleChipSelected,
          ]}
        >
          {getOptionLabel(POSITION_OPTIONS, row.primaryPosition)}
        </Chip>
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
      getSortValue: row => (
        row.scoutProfileDisplay?.label ||
        row.profile ||
        ''
      ),
      render: row => {
        const profileDisplay = row.scoutProfileDisplay || {}
        const profileLabel = profileDisplay.label || row.profile || ''
        const reliability = profileDisplay.reliability || row.reliability || ''

        if (!profileLabel || profileLabel === '-') return '-'

        return (
          <Box sx={sx.profileCell}>
            <ScoutProfileChip
              label={
                reliability && reliability !== '-'
                  ? `${profileLabel} · ${reliability}`
                  : profileLabel
              }
              tooltip={buildProfileTooltip(profileDisplay)}
              variant={
                profileDisplay.type === 'combination'
                  ? 'combination'
                  : 'default'
              }
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
              {iconUi({ id: 'view', size: 'sm' })}
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
              {iconUi({ id: 'more', size: 'sm' })}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [onPlayerOpen, onPlayerUrlEdit, onRoleOpen])

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
    />
  )
}
