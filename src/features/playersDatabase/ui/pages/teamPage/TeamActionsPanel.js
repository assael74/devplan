// src/features/playersDatabase/ui/pages/teamPage/TeamActionsPanel.js

import * as React from 'react'
import {
  Box,
  Button,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageSidePanel from '../../components/page/PageSidePanel.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { teamActionsPanelSx as sx } from './sx/teamActionsPanel.sx.js'

const buildRosterAction = ({ hasSeason }) => ({
  label: 'טעינת סגל',
  iconId: 'addPlayers',
  disabled: !hasSeason,
  disabledReason: 'יש לבחור גרסת קבוצה',
})

export default function TeamActionsPanel({
  selectedSeasonOptionKey,
  seasonOptions,
  hasTeamPlayers,
  hasTeamStats,
  onPlayersImport,
  onStatsImport,
  onDeleteStats,
  onDeletePlayers,
  onReport,
  onTeamLink,
  onTeamDataRepair,
  tasks = [],
  tasksLoading,
  onTaskCreate,
  onTaskEdit,
}) {
  const hasSeason = Boolean(selectedSeasonOptionKey && seasonOptions.length)
  const selectedSeason = seasonOptions.find(option => (
    option.optionKey === selectedSeasonOptionKey
  ))
  const rosterAction = React.useMemo(() => buildRosterAction({ hasSeason }), [hasSeason])

  return (
    <PageSidePanel>
      <Box sx={sx.actionsSection}>
        <Typography level='body-xs' sx={sx.sectionLabel}>
          {selectedSeason?.seasonKey ? `פעולות לעונת ${selectedSeason.seasonKey}` : 'פעולות עונה'}
        </Typography>
        <Box sx={sx.actionsRow}>
        <Box sx={sx.primaryActionsRow}>
        {!hasTeamPlayers ? <Tooltip title={rosterAction.disabled ? rosterAction.disabledReason : ''}>
          <Button
            variant='outlined'
            disabled={rosterAction.disabled}
            startDecorator={iconUi({id: rosterAction.iconId, size: 'md'})}
            sx={sx.primaryActionButton}
            onClick={onPlayersImport}
            size='sm'
          >
            {rosterAction.label}
          </Button>
        </Tooltip> : null}
        {hasTeamPlayers ? (
          <Button
            variant='outlined'
            disabled={!hasSeason}
            startDecorator={iconUi({id: 'addStats', size: 'md'})}
            sx={sx.primaryActionButton}
            onClick={onStatsImport}
            size='sm'
          >
            {hasTeamStats ? 'טעינת סטטיסטיקה מחדש' : 'טעינת סטטיסטיקה'}
          </Button>
        ) : null}
        <Dropdown>
          <Tooltip title='מחיקת נתוני עונה'>
            <span>
              <MenuButton
                variant='outlined'
                aria-label='מחיקת נתוני עונה'
                disabled={!hasSeason || !hasTeamPlayers}
                sx={sx.dangerIconButton}
                size='sm'
              >
                {iconUi({id: 'delete', size: 'sm'})}
              </MenuButton>
            </span>
          </Tooltip>
          <Menu placement='bottom-end'>
            <MenuItem disabled={!hasTeamStats} onClick={onDeleteStats}>
              מחיקת סטטיסטיקה בלבד
            </MenuItem>
            <MenuItem onClick={onDeletePlayers}>
              מחיקת סגל מלא
            </MenuItem>
          </Menu>
        </Dropdown>
        </Box>


        <Box sx={sx.secondaryActionsRow}>

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

        <Tooltip title='תיקוני דאטה לקבוצה'>
          <IconButton
            variant='outlined'
            aria-label='תיקוני דאטה לקבוצה'
            sx={sx.dataRepairButton}
            onClick={onTeamDataRepair}
            size='sm'
          >
            {iconUi({id: 'search', size: 'sm'})}
          </IconButton>
        </Tooltip>
        </Box>
        </Box>
      </Box>

      <Divider sx={sx.actionDivider} />

      <Box sx={sx.tasksSection}>
        <WorkTaskList
          title='משימות לקבוצה'
          emptyText='אין משימות פעילות לקבוצה ולעונה הנוכחית'
          tasks={tasks}
          loading={tasksLoading}
          onCreate={onTaskCreate}
          onEdit={onTaskEdit}
        />
      </Box>
    </PageSidePanel>
  )
}
