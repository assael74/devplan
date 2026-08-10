// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterContext.js

import {
  Box,
  IconButton,
  Input,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueCenterContextSx as sx } from './sx/leagueCenterContext.sx.js'

export default function LeagueCenterContext({ model }) {
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

  const handleDataStatusChange = (event, value) => {
    model.setDataStatus(value || 'all')
  }

  return (
    <Stack spacing={1} sx={sx.contextSection}>
      <Box sx={sx.sectionHeader}>
        <Typography level='title-sm' sx={sx.sectionTitle}>
          פילטרים
        </Typography>

        <Tooltip title='איפוס פילטרים'>
          <IconButton
            size='sm'
            variant='outlined'
            color='neutral'
            aria-label='איפוס פילטרים'
            sx={sx.resetButton}
            onClick={model.resetContext}
          >
            {iconUi({id: 'reset', size: 'sm'})}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={sx.primaryFilters}>
        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>שנתון</Typography>
          <Select
            size='sm'
            indicator={null}
            value={model.birthYear}
            sx={sx.contextSelect}
            onChange={handleBirthYearChange}
          >
            <Option value='all'>הכל</Option>
            {model.birthYear !== 'all' && !hasBirthYearOption && (
              <Option value={model.birthYear}>{model.birthYear}</Option>
            )}
            {model.birthYearOptions.map(year => (
              <Option key={year} value={String(year)}>{year}</Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>רמה</Typography>
          <Select
            size='sm'
            indicator={null}
            value={model.leagueLevel}
            sx={sx.contextSelect}
            onChange={handleLevelChange}
          >
            <Option value='all'>הכל</Option>
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
            size='sm'
            indicator={null}
            value={model.seasonKey}
            sx={sx.contextSelect}
            onChange={handleSeasonChange}
          >
            <Option value='all'>הכל</Option>
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
      </Box>

      <Box sx={sx.secondaryFilters}>
        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>חיפוש קבוצה</Typography>
          <Input
            size='sm'
            placeholder='שם קבוצה...'
            value={model.query}
            sx={sx.contextInput}
            onChange={event => model.setQuery(event.target.value)}
          />
        </Box>

        <Box sx={sx.contextField}>
          <Typography level='body-xs' sx={sx.contextLabel}>מצב נתונים</Typography>
          <Select
            size='sm'
            indicator={null}
            value={model.dataStatus}
            sx={sx.contextSelect}
            onChange={handleDataStatusChange}
          >
            <Option value='all'>הכל</Option>
            <Option value='full'>מלא</Option>
            <Option value='partial'>חלקי</Option>
            <Option value='missing'>חסר</Option>
          </Select>
        </Box>
      </Box>
    </Stack>
  )
}
