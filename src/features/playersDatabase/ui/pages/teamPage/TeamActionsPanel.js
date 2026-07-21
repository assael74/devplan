// features/playersDatabase/ui/pages/teamPage/TeamActionsPanel.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamContentSx as sx } from './sx/teamContent.sx.js'

const buildActions = ({ hasTeamPlayers }) => [
  {
    id: 'players',
    label: hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל',
    iconId: 'upload',
    primary: true,
    disabled: false,
  },
  {
    id: 'stats',
    label: 'טעינת סטטיסטיקות',
    iconId: 'addStats',
    disabled: !hasTeamPlayers,
  },
  {
    id: 'deletePlayers',
    label: 'מחיקת שחקנים',
    iconId: 'delete',
    danger: true,
    disabled: !hasTeamPlayers,
  },
  {
    id: 'link',
    label: 'עריכת קישור שנתון',
    iconId: 'addLink',
    disabled: false,
  },
]

export default function TeamActionsPanel({
  selectedSeasonKey,
  seasonOptions,
  hasTeamPlayers,
  profileOnly,
  onSeasonChange,
  onProfileOnlyChange,
  onPlayersImport,
  onStatsImport,
}) {
  const actions = buildActions({ hasTeamPlayers })

  const handleAction = actionId => {
    if (actionId === 'players') {
      onPlayersImport()
      return
    }

    if (actionId === 'stats') onStatsImport()
  }

  return (
    <Card sx={sx.actionsPanel}>
      <Typography level='title-lg' sx={sx.panelTitle}>
        פעולות אפשריות
      </Typography>

      <Box sx={sx.actionSeasonBox}>
        <Typography level='body-xs' sx={sx.actionSeasonLabel}>
          עונת משחקים
        </Typography>

        <Select
          size='sm'
          value={selectedSeasonKey || ''}
          onChange={(_, value) => onSeasonChange(value || '')}
          sx={sx.actionSeasonSelect}
        >
          {seasonOptions.length ? (
            seasonOptions.map(option => (
              <Option
                key={`${option.target}-${option.seasonKey}`}
                value={option.seasonKey}
              >
                {option.seasonKey}
              </Option>
            ))
          ) : (
            <Option value=''>אין עונות</Option>
          )}
        </Select>
      </Box>

      <Box sx={sx.actionFiltersRow}>
        <Chip
          variant={profileOnly ? 'solid' : 'soft'}
          startDecorator={iconUi({ id: 'profile', size: 'sm' })}
          onClick={() => onProfileOnlyChange(!profileOnly)}
          sx={profileOnly ? sx.actionFilterChipActive : sx.actionFilterChip}
        >
          רק שחקנים עם פרופיל
        </Chip>
      </Box>

      <Divider sx={sx.actionDivider} />

      <Stack spacing={1} className='dpScrollThin' sx={sx.actionsList}>
        {actions.map(action => (
          <Button
            key={action.id}
            disabled={action.disabled}
            variant={action.primary ? 'solid' : 'outlined'}
            startDecorator={iconUi({ id: action.iconId, size: 'sm' })}
            sx={
              action.primary
                ? sx.primaryActionButton
                : action.danger
                  ? sx.dangerActionButton
                  : sx.secondaryActionButton
            }
            onClick={() => handleAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Card>
  )
}
