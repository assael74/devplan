// src/features/playersDatabase/ui/pages/leaguePage/LeagueActionsPanel.js

import {
  Box,
  Button,
  Divider,
  IconButton,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import PageSidePanel from '../../components/page/PageSidePanel.js'
import ScoutPrioritySelect from '../../components/filters/ScoutPrioritySelect.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { WorkTaskList } from '../../components/modals/index.js'
import { leagueActionsPanelSx as sx } from './sx/leagueActionsPanel.sx.js'

export default function LeagueActionsPanel({
  selectedSeasonKey,
  seasonOptions = [],
  onSeasonChange,
  attackPriorityFilter,
  defensePriorityFilter,
  attackPriorityCounts = {},
  defensePriorityCounts = {},
  onAttackPriorityFilterChange,
  onDefensePriorityFilterChange,
  onLoad,
  onLeagueUrlEdit,
  hasLeagueUrl = false,
  loadDisabled = false,
  loadDisabledReason = '',
  onDeleteTeams,
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
    if (!nextValue || nextValue === selectedSeasonKey) return
    onSeasonChange(nextValue)
  }

  return (
    <PageSidePanel>
      <Box sx={sx.actionSelectorsRow}>
        <Box sx={sx.actionSeasonBox}>
          <Typography level='body-xs' sx={sx.actionSeasonLabel}>
            גרסת ליגה
          </Typography>

          <Select
            value={seasonSelectValue}
            size='sm'
            disabled={!seasonOptions.length}
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

      <Box sx={sx.priorityFiltersRow}>
        <ScoutPrioritySelect
          label='עדיפות התקפית'
          value={attackPriorityFilter}
          fontSize={11}
          thresholdMode
          counts={attackPriorityCounts}
          onChange={onAttackPriorityFilterChange}
        />

        <ScoutPrioritySelect
          label='עדיפות הגנתית'
          value={defensePriorityFilter}
          fontSize={11}
          thresholdMode
          counts={defensePriorityCounts}
          onChange={onDefensePriorityFilterChange}
        />
      </Box>

      <Divider sx={sx.sidePanelDivider} />

      <Box sx={sx.actionsRow}>
        <Button
          variant='outlined'
          startDecorator={iconUi({id: 'addTeams', size: 'sm'})}
          disabled={loadDisabled}
          sx={sx.sideLoadButton}
          title={loadDisabled ? loadDisabledReason : undefined}
          onClick={onLoad}
        >
          טעינת נתוני ליגה
        </Button>

        <Tooltip title={hasLeagueUrl ? 'עריכת קישור לליגה' : 'הוספת קישור לליגה'}>
          <IconButton
            variant='outlined'
            aria-label={hasLeagueUrl ? 'עריכת קישור לליגה' : 'הוספת קישור לליגה'}
            sx={sx.sideLinkButton}
            onClick={onLeagueUrlEdit}
          >
            {iconUi({id: 'link', size: 'sm'})}
          </IconButton>
        </Tooltip>

        <Tooltip title='תצוגה ופרסום דוח'>
          <IconButton
            variant='outlined'
            aria-label='תצוגה ופרסום דוח'
            sx={sx.sideReportButton}
            onClick={onReport}
          >
            {iconUi({id: 'print', size: 'sm'})}
          </IconButton>
        </Tooltip>

        <Tooltip title='מחיקת קבוצות לעונה'>
          <IconButton
            variant='outlined'
            aria-label='מחיקת קבוצות לעונה'
            sx={sx.sideDeleteButton}
            onClick={onDeleteTeams}
          >
            {iconUi({id: 'delete', size: 'sm'})}
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
