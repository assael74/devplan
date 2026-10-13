// src/features/playersDatabase/ui/pages/leaguePage/LeagueActionsPanel.js

import {
  Box,
  Button,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import PageSidePanel from '../../components/page/PageSidePanel.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { leagueActionsPanelSx as sx } from './sx/leagueActionsPanel.sx.js'

export default function LeagueActionsPanel({
  collapsible = false,
  collapsed = false,
  onCollapsedChange,
  selectedSeasonKey,
  seasonOptions = [],
  onSeasonChange,
  seasonDisabled = false,
  onLoad,
  onDownloadDocuments,
  onLeagueUrlEdit,
  downloadDisabled = false,
  loadDisabled = false,
  loadDisabledReason = '',
  onDeleteTeams,
  deleteTeamsDisabled = false,
  deleteTeamsDisabledReason = '',
  onRecheckDeleteTeams,
  nextDeleteAction = '',
  onNextDeleteAction,
  onReport,
  tasks = [],
  tasksLoading,
  onTaskCreate,
  onTaskEdit,
}) {
  const hasSelectedSeason = seasonOptions.some(option => (
    option.seasonKey === selectedSeasonKey
  ))
  const seasonSelectValue = hasSelectedSeason
    ? selectedSeasonKey
    : null

  const handleSeasonChange = (_, nextValue) => {
    if (seasonDisabled || !nextValue || nextValue === selectedSeasonKey) return
    onSeasonChange(nextValue)
  }

  return (
    <PageSidePanel
      scrollable={false}
      collapsible={collapsible}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      collapsedActions={[
        { label: 'טעינת נתוני הליגה', iconId: 'addTeams', onClick: onLoad, disabled: loadDisabled, disabledReason: loadDisabledReason },
        { label: 'הגדרות עונת ליגה', iconId: 'edit', onClick: onLeagueUrlEdit, disabled: !onLeagueUrlEdit },
      ]}
    >
      <Box sx={sx.actionSelectorsRow}>
        <Box sx={sx.actionSeasonBox}>
          <Typography level='body-xs' sx={sx.actionSeasonLabel}>
            גרסת ליגה
          </Typography>

          <Select
            value={seasonSelectValue}
            size='sm'
            disabled={seasonDisabled || !seasonOptions.length}
            sx={sx.actionSeasonSelect}
            onChange={handleSeasonChange}
            renderValue={selected => {
              const option = seasonOptions.find(item => (
                item.seasonKey === selected?.value
              ))

              if (!option) return 'בחר גרסת ליגה'

              return (
                <Box sx={sx.actionSeasonValue}>
                  <Typography sx={sx.actionSeasonValuePrimary}>
                    {option.primaryLabel || option.label}
                  </Typography>
                  <Typography sx={sx.actionSeasonValueSecondary}>
                    {option.secondaryLabel}
                  </Typography>
                </Box>
              )
            }}
          >
            {seasonOptions.map(option => (
              <Option
                key={`${option.target}_${option.seasonKey}`}
                value={option.seasonKey}
                sx={sx.actionSeasonOption}
              >
                <Box sx={sx.actionSeasonOptionContent}>
                  <Typography sx={sx.actionSeasonOptionPrimary}>
                    {option.primaryLabel || option.label}
                  </Typography>
                  <Typography sx={sx.actionSeasonOptionSecondary}>
                    {option.secondaryLabel}
                  </Typography>
                </Box>
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Divider sx={sx.sidePanelDivider} />

      <Box sx={sx.primaryActionsRow}>
        <Button
          variant='outlined'
          startDecorator={iconUi({id: 'addTeams', size: 'lg'})}
          disabled={loadDisabled}
          sx={sx.sideLoadButton}
          title={loadDisabled ? loadDisabledReason : undefined}
          onClick={onLoad}
        >
          טעינת נתוני הליגה
        </Button>

        <Dropdown>
          <Tooltip title='פעולות מחיקה לעונה'>
            <span>
              <MenuButton
                variant='outlined'
                aria-label='פעולות מחיקה לעונה'
                sx={sx.sideDeleteButton}
              >
                {iconUi({id: 'delete', size: 'md'})}
              </MenuButton>
            </span>
          </Tooltip>

          <Menu placement='bottom-end'>
            {nextDeleteAction && (
              <MenuItem onClick={onNextDeleteAction}>
                {nextDeleteAction === 'stats'
                  ? 'מעבר למחיקת סטטיסטיקה בקבוצה'
                  : 'מעבר למחיקת סגל בקבוצה'}
              </MenuItem>
            )}
            <MenuItem disabled={deleteTeamsDisabled} onClick={onDeleteTeams}>
              מחיקת קבוצות העונה
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>

      <Box sx={sx.secondaryActionsRow}>
        <Tooltip title='הורדת מסמך הליגה כ־JSON'>
          <span>
            <IconButton
              variant='outlined'
              aria-label='הורדת מסמך הליגה כ־JSON'
              disabled={downloadDisabled}
              sx={sx.sideDownloadButton}
              onClick={onDownloadDocuments}
            >
              {iconUi({id: 'download', size: 'md'})}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={onLeagueUrlEdit ? 'הגדרות עונת ליגה' : 'עריכת הגדרות עונת ליגה אינה זמינה כרגע'}>
          <span>
            <IconButton
              variant='outlined'
              aria-label='הגדרות עונת ליגה'
              disabled={!onLeagueUrlEdit}
              sx={sx.sideLinkButton}
              onClick={onLeagueUrlEdit}
            >
              {iconUi({id: 'edit', size: 'md'})}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title='תצוגה ופרסום דוח'>
          <IconButton
            variant='outlined'
            aria-label='תצוגה ופרסום דוח'
            sx={sx.sideReportButton}
            onClick={onReport}
          >
            {iconUi({id: 'print', size: 'md'})}
          </IconButton>
        </Tooltip>

      </Box>

      <Box sx={sx.taskSection}>
        <WorkTaskList
          tasks={tasks}
          loading={tasksLoading}
          onCreate={onTaskCreate}
          onEdit={onTaskEdit}
        />
      </Box>
    </PageSidePanel>
  )
}
