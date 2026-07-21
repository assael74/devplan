// features/playersDatabase/ui/pages/leaguePage/LeagueActionsPanel.js

import { Box, Button, Divider, Option, Select, Stack, Typography } from '@mui/joy'

import InfoPanel from '../../components/cards/InfoPanel.js'
import ScoutPrioritySelect from '../../components/filters/ScoutPrioritySelect.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueContentSx as sx } from './sx/leagueContent.sx.js'

export default function LeagueActionsPanel({
  selectedSeasonKey,
  seasonOptions = [],
  selectedBirthYear,
  birthYearOptions = [],
  onSeasonChange,
  onBirthYearChange,
  attackPriorityFilter,
  defensePriorityFilter,
  onAttackPriorityFilterChange,
  onDefensePriorityFilterChange,
  onLoad,
}) {
  return (
    <InfoPanel title='פעולות אפשריות' sx={sx.insightsPanel}>
      <Stack spacing={1} className='dpScrollThin' sx={sx.insightsList}>
        <Box sx={sx.actionSeasonBox}>
          <Typography level='body-xs' sx={sx.actionSeasonLabel}>עונת משחקים</Typography>
          <Select
            value={selectedSeasonKey || ''}
            size='sm'
            sx={sx.actionSeasonSelect}
            onChange={(event, nextValue) => onSeasonChange(nextValue || '')}
          >
            {seasonOptions.length ? seasonOptions.map(option => (
              <Option key={`${option.target}_${option.seasonKey}`} value={option.seasonKey}>
                {option.seasonKey}
              </Option>
            )) : <Option value=''>אין עונות</Option>}
          </Select>
        </Box>

        <Box sx={sx.actionSeasonBox}>
          <Typography level='body-xs' sx={sx.actionSeasonLabel}>שנתון</Typography>
          <Select
            value={selectedBirthYear ? String(selectedBirthYear) : ''}
            size='sm'
            sx={sx.actionSeasonSelect}
            onChange={(event, nextValue) => onBirthYearChange(nextValue || '')}
          >
            {birthYearOptions.length ? birthYearOptions.map(year => (
              <Option key={year} value={String(year)}>{year}</Option>
            )) : <Option value=''>אין שנתונים</Option>}
          </Select>
        </Box>

        <Box sx={sx.priorityFiltersRow}>
          <ScoutPrioritySelect
            label='ביצוע התקפי'
            value={attackPriorityFilter}
            fontSize={11}
            onChange={onAttackPriorityFilterChange}
          />
          <ScoutPrioritySelect
            label='ביצוע הגנתי'
            value={defensePriorityFilter}
            fontSize={11}
            onChange={onDefensePriorityFilterChange}
          />
        </Box>

        <Divider sx={sx.sidePanelDivider} />

        <Button
          startDecorator={iconUi({ id: 'upload', size: 'sm' })}
          sx={sx.sideLoadButton}
          onClick={onLoad}
        >
          טעינת נתוני ליגה
        </Button>

        <Button
          variant='outlined'
          startDecorator={iconUi({ id: 'delete', size: 'sm' })}
          sx={sx.sideDeleteButton}
        >
          מחיקת קבוצות לעונה
        </Button>
      </Stack>
    </InfoPanel>
  )
}
