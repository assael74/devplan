// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterContext.js

import { Box, Button, Option, Select, Stack, Typography } from '@mui/joy'

import InfoPanel from '../../components/cards/InfoPanel.js'
import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterContext({ model }) {
  const selectedYear = model.birthYear === 'all' ? '' : model.birthYear
  const selectedLevel = model.leagueLevel === 'all' ? '' : model.leagueLevel

  return (
    <InfoPanel sx={sx.contextPanel}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} sx={sx.contextRow}>
        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>שנתון</Typography>
          <Select
            value={model.birthYear}
            sx={sx.contextSelect}
            onChange={(event, value) => model.setBirthYear(value || 'all')}
          >
            <Option value='all'>כל השנתונים</Option>
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
            onChange={(event, value) => model.setLeagueLevel(value || 'all')}
          >
            <Option value='all'>כל הרמות</Option>
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
            onChange={(event, value) => model.setSeasonKey(value || 'all')}
          >
            <Option value='all'>כל העונות</Option>
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
