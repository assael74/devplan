// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterContext.js

import {
  Box,
  Button,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import InfoPanel from '../../components/cards/InfoPanel.js'
import { leagueCenterContextSx as sx } from './sx/leagueCenterContext.sx.js'

export default function LeagueCenterContext({ model }) {
  const selectedYear = model.birthYear === 'all' ? '' : model.birthYear
  const selectedLevel = model.leagueLevel === 'all' ? '' : model.leagueLevel
  const hasBirthYearOption = model.birthYearOptions.some(
    year => String(year) === model.birthYear
  )
  const hasLevelOption = model.levelOptions.some(
    option => option.value === model.leagueLevel
  )
  const hasSeasonOption = model.seasonOptions.includes(model.seasonKey)

  const handleBirthYearChange = (event, value) => {
    if (!value) return
    model.setBirthYear(value)
  }

  const handleLevelChange = (event, value) => {
    if (!value) return
    model.setLeagueLevel(value)
  }

  const handleSeasonChange = (event, value) => {
    if (!value) return
    model.setSeasonKey(value)
  }

  return (
    <InfoPanel sx={sx.contextPanel}>
      <Stack direction={{
        xs: 'column',
        lg: 'row',
      }} spacing={1} sx={sx.contextRow}>
        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>שנתון</Typography>
          <Select
            value={model.birthYear}
            sx={sx.contextSelect}
            onChange={handleBirthYearChange}
          >
            <Option value='all'>כל השנתונים</Option>
            {model.birthYear !== 'all' && !hasBirthYearOption && (
              <Option value={model.birthYear}>{model.birthYear}</Option>
            )}
            {model.birthYearOptions.map(year => (
              <Option key={year} value={String(year)}>{year}</Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>רמת ליגה</Typography>
          <Select
            value={model.leagueLevel}
            sx={sx.contextSelect}
            onChange={handleLevelChange}
          >
            <Option value='all'>כל הרמות</Option>
            {model.leagueLevel !== 'all' && !hasLevelOption && (
              <Option value={model.leagueLevel}>
                רמה {model.leagueLevel}
              </Option>
            )}
            {model.levelOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>עונה</Typography>
          <Select
            value={model.seasonKey}
            sx={sx.contextSelect}
            onChange={handleSeasonChange}
          >
            <Option value='all'>כל העונות</Option>
            {model.seasonKey !== 'all' && !hasSeasonOption && (
              <Option value={model.seasonKey}>{model.seasonKey}</Option>
            )}
            {model.seasonOptions
              .filter(option => option !== 'all')
              .map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
          </Select>
        </Box>

        <Button
          variant='outlined'
          sx={sx.contextResetButton}
          onClick={model.resetPrimaryFilters}
        >
          איפוס
        </Button>

        <Stack sx={sx.contextSummary}>
          <Typography level='body-xs' sx={sx.contextSummaryLabel}>הקשר פעיל</Typography>
          <Typography sx={sx.contextSummaryValue}>
            {selectedYear ? `שנתון ${selectedYear}` : 'בחר שנתון'}
            {selectedLevel ? ` · רמה ${selectedLevel}` : ''}
            {model.seasonKey !== 'all' ? ` · ${model.seasonKey}` : ''}
          </Typography>
          <Typography level='body-xs' sx={sx.contextSummaryCaption}>
            {model.summary.totalLeagues} ליגות רלוונטיות
          </Typography>
        </Stack>
      </Stack>
    </InfoPanel>
  )
}
