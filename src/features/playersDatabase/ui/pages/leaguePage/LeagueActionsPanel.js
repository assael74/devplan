// features/playersDatabase/ui/pages/leaguePage/LeagueActionsPanel.js

import {
  Box,
  Button,
  Divider,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import InfoPanel from '../../components/cards/InfoPanel.js'
import ScoutPrioritySelect from '../../components/filters/ScoutPrioritySelect.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueActionsPanelSx as sx } from './sx/leagueActionsPanel.sx.js'

export default function LeagueActionsPanel({
  selectedSeasonKey,
  seasonOptions = [],
  onSeasonChange,
  attackPriorityFilter,
  defensePriorityFilter,
  onAttackPriorityFilterChange,
  onDefensePriorityFilterChange,
  onLoad,
  onDeleteTeams,
  onReport,
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
    <InfoPanel sx={sx.insightsPanel}>
      <Stack spacing={1} className="dpScrollThin" sx={sx.insightsList}>
        <Box sx={sx.actionSelectorsRow}>
          <Box sx={sx.actionSeasonBox}>
            <Typography level="body-xs" sx={sx.actionSeasonLabel}>
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
            onChange={onAttackPriorityFilterChange}
          />

          <ScoutPrioritySelect
            label='עדיפות הגנתית'
            value={defensePriorityFilter}
            fontSize={11}
            onChange={onDefensePriorityFilterChange}
          />
        </Box>

        <Divider sx={sx.sidePanelDivider} />

        <Button
          variant="outlined"
          startDecorator={iconUi({
            id: 'print',
            size: 'sm',
          })}
          sx={sx.sideReportButton}
          onClick={onReport}
        >
          תצוגה ופרסום דוח
        </Button>

        <Button
          startDecorator={iconUi({
            id: 'upload',
            size: 'sm',
          })}
          sx={sx.sideLoadButton}
          onClick={onLoad}
        >
          טעינת נתוני ליגה
        </Button>

        <Button
          variant="outlined"
          startDecorator={iconUi({
            id: 'delete',
            size: 'sm',
          })}
          sx={sx.sideDeleteButton}
          onClick={onDeleteTeams}
        >
          מחיקת קבוצות לעונה
        </Button>
      </Stack>
    </InfoPanel>
  )
}
