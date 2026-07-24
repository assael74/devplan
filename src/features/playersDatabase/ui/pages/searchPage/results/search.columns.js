// features/playersDatabase/ui/pages/searchPage/results/search.columns.js

import { Box, Button } from '@mui/joy'

import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { searchResultsTableSx as sx } from './sx/searchResultsTable.sx.js'

const buildProfileTooltip = profileDisplay => {
  if (profileDisplay?.type !== 'combination') {
    return profileDisplay?.label || ''
  }

  return [
    profileDisplay.label,
    ...(profileDisplay.baseProfiles || []).map(profile => profile.label),
  ]
    .filter(Boolean)
    .join(' · ')
}

export function buildSearchColumns({ onEntityOpen }) {
  return [
    {
      key: 'avatar',
      label: '',
      sx: sx.avatarColumn,
      render: row => (
        <Box
          component='img'
          src={row.avatarUrl || playerImage}
          alt=''
          sx={sx.avatar}
        />
      ),
    },
    {
      key: 'playerName',
      label: 'שחקן',
      sx: sx.playerColumn,
    },
    {
      key: 'birthYear',
      label: 'שנתון',
      sx: sx.yearColumn,
    },
    {
      key: 'teamName',
      label: 'קבוצה',
      sx: sx.teamColumn,
    },
    {
      key: 'leagueName',
      label: 'ליגה',
      sx: sx.leagueColumn,
    },
    {
      key: 'leagueLevel',
      label: 'רמה',
      sx: sx.levelColumn,
    },
    {
      key: 'minutes',
      label: 'דקות',
      sx: sx.numberColumn,
    },
    {
      key: 'appearances',
      label: 'הופעות',
      sx: sx.numberColumn,
    },
    {
      key: 'starts',
      label: 'הרכב',
      sx: sx.numberColumn,
    },
    {
      key: 'goals',
      label: 'שערים',
      sx: sx.numberColumn,
    },
    {
      key: 'primaryProfile',
      label: 'פרופיל סקאוט',
      sx: sx.profileColumn,
      render: row => {
        const profileDisplay = row.scoutProfileDisplay || {}
        const profileLabel = profileDisplay.label || row.primaryProfile || ''

        if (!profileLabel || profileLabel === '-') {
          return '-'
        }

        return (
          <ScoutProfileChip
            label={profileLabel}
            tooltip={buildProfileTooltip(profileDisplay)}
            variant={profileDisplay.type === 'combination' ? 'combination' : 'default'}
            fontSize={11}
          />
        )
      },
    },
    {
      key: 'score',
      label: 'הציון',
      sx: sx.scoreColumn,
    },
    {
      key: 'actions',
      label: 'פעולות',
      sx: sx.actionsColumn,
      render: row => (
        <Button
          size='sm'
          variant='outlined'
          sx={sx.actionButton}
          onClick={() => onEntityOpen(row)}
        >
          כניסה
        </Button>
      ),
    },
  ]
}
