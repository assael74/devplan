// src/features/playersDatabase/ui/pages/teamPage/TeamActionsPanel.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageSidePanel from '../../components/page/PageSidePanel.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { teamActionsPanelSx as sx } from './sx/teamActionsPanel.sx.js'

const buildPrimaryAction = ({ hasTeamPlayers, hasTeamStats, hasSeason }) => {
  if (!hasTeamPlayers) {
    return {
      label: 'טעינת סגל',
      iconId: 'addPlayers',
      disabled: !hasSeason,
      action: 'players',
      disabledReason: 'יש לבחור גרסת קבוצה',
    }
  }

  return {
    label: 'טעינת סטטיסטיקה',
    iconId: 'addStats',
    disabled: !hasSeason || hasTeamStats,
    action: 'stats',
    disabledReason: hasTeamStats
      ? 'סטטיסטיקה כבר נטענה לקבוצה'
      : 'יש לבחור גרסת קבוצה',
  }
}

export default function TeamActionsPanel({
  selectedSeasonOptionKey,
  seasonOptions,
  hasTeamPlayers,
  hasTeamStats,
  profileOnly,
  onSeasonChange,
  onProfileOnlyChange,
  onPlayersImport,
  onStatsImport,
  onDeletePlayers,
  onReport,
  onTeamLink,
  tasks = [],
  tasksLoading,
  onTaskCreate,
  onTaskEdit,
}) {
  const hasSeason = Boolean(selectedSeasonOptionKey && seasonOptions.length)
  const primaryAction = React.useMemo(() => buildPrimaryAction({
    hasTeamPlayers,
    hasTeamStats,
    hasSeason,
  }), [
    hasSeason,
    hasTeamPlayers,
    hasTeamStats,
  ])

  const handlePrimaryAction = () => {
    if (primaryAction.disabled) return

    if (primaryAction.action === 'players') {
      onPlayersImport()
      return
    }

    if (primaryAction.action === 'stats') {
      onStatsImport()
    }
  }

  return (
    <PageSidePanel>
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
            const option = seasonOptions.find(item => (
              item.optionKey === selected?.value
            ))
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
          startDecorator={iconUi({id: 'profile', size: 'sm'})}
          onClick={() => onProfileOnlyChange(!profileOnly)}
          sx={profileOnly ? sx.actionFilterChipActive : sx.actionFilterChip}
        >
          רק שחקנים עם פרופיל
        </Chip>
      </Box>

      <Divider sx={sx.actionDivider} />

      <Box sx={sx.actionsRow}>
        <Tooltip title={primaryAction.disabled ? primaryAction.disabledReason : ''}>
          <Button
            variant='outlined'
            disabled={primaryAction.disabled}
            startDecorator={iconUi({id: primaryAction.iconId, size: 'md'})}
            sx={sx.primaryActionButton}
            onClick={handlePrimaryAction}
            size='sm'
          >
            {primaryAction.label}
          </Button>
        </Tooltip>

        <Tooltip title='עריכת קישור קבוצה'>
          <IconButton
            variant='outlined'
            aria-label='עריכת קישור קבוצה'
            sx={sx.secondaryIconButton}
            onClick={onTeamLink}
            size='sm'
          >
            {iconUi({id: 'addLink', size: 'sm'})}
          </IconButton>
        </Tooltip>

        <Tooltip title='תצוגה ופרסום דוח'>
          <IconButton
            variant='outlined'
            aria-label='תצוגה ופרסום דוח'
            disabled={!hasSeason}
            sx={sx.secondaryIconButton}
            onClick={onReport}
            size='sm'
          >
            {iconUi({id: 'print', size: 'sm'})}
          </IconButton>
        </Tooltip>

        <Tooltip title='מחיקת שחקנים'>
          <IconButton
            variant='outlined'
            aria-label='מחיקת שחקנים'
            disabled={!hasTeamPlayers}
            sx={sx.dangerIconButton}
            onClick={onDeletePlayers}
            size='sm'
          >
            {iconUi({id: 'delete', size: 'sm'})}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={sx.actionDivider} />

      <WorkTaskList
        title='משימות לקבוצה'
        emptyText='אין משימות פעילות לקבוצה ולעונה הנוכחית'
        tasks={tasks}
        loading={tasksLoading}
        onCreate={onTaskCreate}
        onEdit={onTaskEdit}
      />
    </PageSidePanel>
  )
}
