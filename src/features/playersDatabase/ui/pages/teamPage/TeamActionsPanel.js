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
  profileFilterKey = 'all',
  profileFilterOptions = [],
  onSeasonChange,
  teamNavigation,
  onTeamNavigate,
  onProfileOnlyChange,
  onProfileFilterChange,
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
  const teamNavigationOptions = teamNavigation?.options || []
  const canNavigateTeams = (
    typeof onTeamNavigate === 'function' &&
    teamNavigationOptions.length > 1
  )
  const currentNavigationOption = teamNavigationOptions.find(option => (
    option.value === teamNavigation?.value
  ))
  const selectedProfileFilter = profileFilterOptions.find(option => (
    option.value === profileFilterKey
  )) || profileFilterOptions[0]
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

      {canNavigateTeams ? (
        <Box sx={sx.teamNavigationBox}>
          <Typography level='body-xs' sx={sx.teamNavigationLabel}>
            מעבר בין קבוצות
          </Typography>

          <Box sx={sx.teamNavigationControls}>
            <Tooltip title='קבוצה קודמת בטבלה'>
              <span>
                <IconButton
                  variant='outlined'
                  aria-label='קבוצה קודמת בטבלה'
                  disabled={!teamNavigation?.previousValue}
                  sx={sx.teamNavigationButton}
                  onClick={() => onTeamNavigate(teamNavigation.previousValue)}
                  size='sm'
                >
                  {iconUi({id: 'back', size: 'sm'})}
                </IconButton>
              </span>
            </Tooltip>

            <Select
              size='sm'
              value={teamNavigation?.value || null}
              onChange={(_, value) => onTeamNavigate(value || '')}
              sx={sx.teamNavigationSelect}
              slotProps={{
                listbox: {
                  sx: sx.teamNavigationListbox,
                },
              }}
              renderValue={() => {
                if (!currentNavigationOption) return 'בחר קבוצה'

                return (
                  <Box sx={sx.teamNavigationValue}>
                    <Typography sx={sx.teamNavigationValuePrimary}>
                      {currentNavigationOption.label}
                    </Typography>
                    <Typography sx={sx.teamNavigationValueSecondary}>
                      {currentNavigationOption.secondaryLabel}
                    </Typography>
                  </Box>
                )
              }}
            >
              {teamNavigationOptions.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                  sx={sx.teamNavigationOption}
                >
                  <Box sx={sx.teamNavigationOptionContent}>
                    <Typography sx={sx.teamNavigationOptionPrimary}>
                      {option.label}
                    </Typography>
                    <Typography sx={sx.teamNavigationOptionSecondary}>
                      {option.secondaryLabel}
                    </Typography>
                  </Box>
                </Option>
              ))}
            </Select>

            <Tooltip title='קבוצה הבאה בטבלה'>
              <span>
                <IconButton
                  variant='outlined'
                  aria-label='קבוצה הבאה בטבלה'
                  disabled={!teamNavigation?.nextValue}
                  sx={sx.teamNavigationButton}
                  onClick={() => onTeamNavigate(teamNavigation.nextValue)}
                  size='sm'
                >
                  {iconUi({id: 'forward', size: 'sm'})}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      ) : null}

      <Box sx={sx.actionFiltersRow}>
        <Tooltip title='מציג רק שחקנים שיש להם לפחות פרופיל סקאוט אחד'>
          <Chip
            variant={profileOnly ? 'solid' : 'soft'}
            startDecorator={iconUi({id: 'profile', size: 'sm'})}
            onClick={() => onProfileOnlyChange(!profileOnly)}
            sx={profileOnly ? sx.actionFilterChipActive : sx.actionFilterChip}
          >
            רק עם פרופיל סקאוט
          </Chip>
        </Tooltip>
        <Select
          size='sm'
          value={profileFilterKey || 'all'}
          onChange={(_, value) => onProfileFilterChange(value || 'all')}
          disabled={!profileFilterOptions.length}
          indicator={null}
          sx={sx.profileFilterSelect}
          slotProps={{
            listbox: {
              sx: sx.profileFilterListbox,
            },
          }}
          renderValue={() => {
            if (!selectedProfileFilter) return 'כל הפרופילים'

            return (
              <Box sx={sx.profileFilterValue}>
                <Typography sx={sx.profileFilterValuePrimary}>
                  {selectedProfileFilter.label}
                </Typography>
                <Typography sx={sx.profileFilterValueCount}>
                  {selectedProfileFilter.count}
                </Typography>
              </Box>
            )
          }}
        >
          {profileFilterOptions.map(option => (
            <Option
              key={option.value}
              value={option.value}
              sx={sx.profileFilterOption}
            >
              <Box sx={sx.profileFilterOptionContent}>
                <Typography sx={sx.profileFilterOptionLabel}>
                  {option.label}
                </Typography>
                <Box component='span' sx={sx.profileFilterOptionCount}>
                  {option.count}
                </Box>
              </Box>
            </Option>
          ))}
        </Select>
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
