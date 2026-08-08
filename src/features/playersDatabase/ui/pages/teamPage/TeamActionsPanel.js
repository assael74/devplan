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
import { teamActionsPanelSx as sx } from './sx/teamActionsPanel.sx.js'

const buildActions = ({ hasTeamPlayers, hasSeason }) => [
  {
    id: 'players',
    label: hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל',
    iconId: 'upload',
    primary: true,
    disabled: !hasSeason,
  },
  {
    id: 'stats',
    label: 'טעינת סטטיסטיקות',
    iconId: 'addStats',
    disabled: !hasTeamPlayers || !hasSeason,
  },
  {
    id: 'deletePlayers',
    label: 'מחיקת שחקנים',
    iconId: 'delete',
    danger: true,
    disabled: !hasTeamPlayers,
  },
  {
    id: 'report',
    label: 'תצוגה ופרסום דוח',
    iconId: 'print',
    disabled: !hasSeason,
  },
  {
    id: 'link',
    label: 'עריכת קישור שנתון',
    iconId: 'addLink',
    disabled: false,
  },
]

export default function TeamActionsPanel({
  selectedSeasonOptionKey,
  seasonOptions,
  hasTeamPlayers,
  profileOnly,
  onSeasonChange,
  onProfileOnlyChange,
  onPlayersImport,
  onStatsImport,
  onDeletePlayers,
  onReport,
}) {
  const hasSeason = Boolean(selectedSeasonOptionKey && seasonOptions.length)
  const actions = buildActions({
    hasTeamPlayers,
    hasSeason,
  })

  const handleAction = actionId => {
    if (actionId === 'players') {
      onPlayersImport()
      return
    }

    if (actionId === 'stats') {
      onStatsImport()
      return
    }

    if (actionId === 'deletePlayers') {
      onDeletePlayers()
      return
    }

    if (actionId === 'report') onReport()
  }

  return (
    <Card sx={sx.actionsPanel}>
      <Typography level='title-lg' sx={sx.panelTitle}>
        פעולות אפשריות
      </Typography>

      <Box sx={sx.actionSeasonBox}>
        <Typography level='body-xs' sx={sx.actionSeasonLabel}>
          גרסת קבוצה
        </Typography>

        <Select
          size='sm'
          value={selectedSeasonOptionKey || ''}
          onChange={(_, value) => onSeasonChange(value || '')}
          sx={sx.actionSeasonSelect}
          renderValue={selected => {
            const option = seasonOptions.find(item => item.optionKey === selected?.value)
            if (!option) return 'בחר גרסת קבוצה'

            return (
              <Box sx={sx.actionSeasonValue}>
                <Typography sx={sx.actionSeasonValuePrimary}>
                  {option.primaryLabel}
                </Typography>
                <Typography sx={sx.actionSeasonValueSecondary}>
                  {option.secondaryLabel}
                </Typography>
              </Box>
            )
          }}
        >
          {seasonOptions.length ? (
            seasonOptions.map(option => (
              <Option
                key={option.optionKey}
                value={option.optionKey}
                sx={sx.actionSeasonOption}
              >
                <Box sx={sx.actionSeasonOptionContent}>
                  <Typography sx={sx.actionSeasonOptionPrimary}>
                    {option.primaryLabel}
                  </Typography>
                  <Typography sx={sx.actionSeasonOptionSecondary}>
                    {option.secondaryLabel}
                  </Typography>
                </Box>
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
          startDecorator={iconUi({
            id: 'profile',
            size: 'sm',
          })}
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
            startDecorator={iconUi({
              id: action.iconId,
              size: 'sm',
            })}
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
