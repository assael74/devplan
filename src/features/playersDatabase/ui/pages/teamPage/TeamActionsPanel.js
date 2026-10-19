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
  collapsible = false,
  collapsed = false,
  onCollapsedChange,
  selectedSeasonOptionKey,
  seasonOptions,
  hasTeamPlayers,
  hasTeamStats,
  onPlayersImport,
  onStatsImport,
  onDeleteStats,
  onDeletePlayers,
  deleteSeasonOptions = [],
  getDeleteActionFor = () => null,
  deleteActionsError = '',
  onReport,
  onTeamLink,
  onNotebookOpen,
  hasTeamRoot = false,
  hasNotebookNote = false,
  hasOpenTasks = false,
  onDownloadJson,
  jsonDownloadDisabled = false,
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
  const deleteActions = deleteSeasonOptions.map(option => ({
    option,
    action: getDeleteActionFor(option),
  })).filter(item => item.action)

  return (
    <PageSidePanel
      scrollable={false}
      collapsible={collapsible}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      collapsedIndicator={hasOpenTasks ? { label: 'יש משימות פתוחות', color: 'danger' } : null}
      collapsedActions={[
        {
          label: hasTeamPlayers ? (hasTeamStats ? 'טעינת סטטיסטיקה מחדש' : 'טעינת סטטיסטיקה') : rosterAction.label,
          iconId: hasTeamPlayers ? 'addStats' : rosterAction.iconId,
          onClick: hasTeamPlayers ? onStatsImport : onPlayersImport,
          disabled: !hasSeason,
          disabledReason: rosterAction.disabledReason,
        },
        { label: 'עריכת קישור קבוצה', iconId: 'addLink', onClick: onTeamLink },
        {
          label: 'מחברת השנתון',
          iconId: 'notes',
          onClick: onNotebookOpen,
          disabled: !hasTeamRoot,
          disabledReason: 'המחברת זמינה לאחר טעינת סגל ראשונה',
          indicator: hasNotebookNote ? { label: 'יש הערה שמורה', color: 'success' } : null,
        },
      ]}
    >
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
          <Tooltip title={deleteActionsError || 'מחיקת נתוני עונה'}>
            <span>
              <MenuButton
                variant='outlined'
                aria-label='מחיקת נתוני עונה'
                disabled={!deleteActions.length}
                sx={sx.dangerIconButton}
                size='sm'
              >
                {iconUi({id: 'delete', size: 'sm'})}
              </MenuButton>
            </span>
          </Tooltip>
          <Menu placement='bottom-end'>
            {deleteActions.map(({ option, action }, index) => (
              <React.Fragment key={option.optionKey || `${option.leagueId}-${option.seasonKey}`}>
                {index > 0 && <Divider />}
                <Typography level='body-xs' sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
                  {`עונה ${option.seasonKey}`}
                </Typography>
                <MenuItem
                  onClick={() => (
                    action === 'stats'
                      ? onDeleteStats?.(option)
                      : onDeletePlayers?.(option)
                  )}
                >
                  {action === 'stats' ? 'מחיקת סטטס' : 'מחיקת סגל'}
                </MenuItem>
              </React.Fragment>
            ))}
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

        <Tooltip title='הורדת מסמכי העמוד כ־ZIP'>
          <span>
            <IconButton
              variant='outlined'
              aria-label='הורדת מסמכי העמוד כ־ZIP'
              disabled={jsonDownloadDisabled}
              sx={sx.secondaryIconButton}
              size='sm'
              onClick={onDownloadJson}
            >
              {iconUi({id: 'download', size: 'sm'})}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={hasTeamRoot ? 'מחברת השנתון' : 'המחברת זמינה לאחר טעינת סגל ראשונה'}>
          <span>
            <IconButton
              variant='outlined'
              aria-label='מחברת השנתון'
              disabled={!hasTeamRoot}
              sx={sx.secondaryIconButton}
              onClick={onNotebookOpen}
              size='sm'
            >
              {iconUi({ id: 'notes', size: 'sm' })}
            </IconButton>
          </span>
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
