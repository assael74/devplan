// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterContext.js

import {
  Box,
  Chip,
  IconButton,
  Option,
  Select,
  Stack,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueCenterContextSx as sx } from './sx/leagueCenterContext.sx.js'

export default function LeagueCenterContext({ model }) {
  const hasLevelOption = model.levelOptions.some(
    option => option.value === model.leagueLevel
  )
  const hasAgeGroupOption = model.ageGroupOptions.some(
    option => option.value === model.ageGroupId
  )
  const handleLevelChange = (event, value) => {
    if (!value) return
    model.setLeagueLevel(value)
  }

  const handleAgeGroupChange = (event, value) => {
    if (!value) return
    model.setAgeGroupId(value)
  }

  const birthYearValues = [
    ...model.birthYears
      .filter(year => !model.birthYearOptions.some(option => String(option) === year))
      .map(year => ({ value: year, label: year })),
    ...model.birthYearOptions.map(year => ({
      value: String(year),
      label: String(year),
    })),
  ]
  const seasonValues = [
    ...model.seasonKeys
      .filter(key => !model.seasonOptions.includes(key))
      .map(key => ({ value: key, label: key })),
    ...model.seasonOptions
      .filter(option => option !== 'all')
      .map(option => ({ value: option, label: option })),
  ]
  const leagueStatusValues = [
    { value: 'active', label: 'פעילה' },
    { value: 'no_teams', label: 'ללא קבוצות' },
    { value: 'not_started', label: 'לא החלה' },
    { value: 'completed', label: 'הסתיימה' },
  ]
  const getCount = (facet, value) => (
    model.filterCounts[facet][value] || 0
  )
  const withCount = (label, count, spread = false) => (
    <FilterOptionLabel label={label} count={count} spread={spread} />
  )
  const getLevelLabel = value => {
    if (value === 'all') return 'כל הרמות'

    const option = model.levelOptions.find(item => item.value === value)
    return option ? option.label : `רמה ${value}`
  }
  const getAgeGroupLabel = value => {
    if (value === 'all') return 'כל קבוצות הגיל'

    const option = model.ageGroupOptions.find(item => item.value === value)
    return option ? option.label : value
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.filterColumn}>
        <Stack spacing={0.75}>
          <Box sx={sx.filterRow}>
          <Box className='dpScrollThin' sx={sx.chipScroll}>
            {birthYearValues.map(option => (
              <Chip
                key={option.value}
                component='button'
                type='button'
                size='sm'
                variant={model.birthYears.includes(option.value) ? 'solid' : 'outlined'}
                sx={[
                  sx.filterChip,
                  sx.birthYearChip,
                  model.birthYears.includes(option.value) && sx.birthYearChipSelected,
                ]}
                onClick={() => model.toggleBirthYear(option.value)}
              >
                {withCount(option.label, getCount('birthYear', option.value))}
              </Chip>
            ))}
          </Box>
          <Select
            size='sm'
            indicator={null}
            value={model.leagueLevel}
            sx={sx.contextSelect}
            renderValue={() => withCount(
              getLevelLabel(model.leagueLevel),
              getCount('leagueLevel', model.leagueLevel),
              true
            )}
            onChange={handleLevelChange}
          >
            <Option value='all'>
              {withCount('כל הרמות', getCount('leagueLevel', 'all'), true)}
            </Option>
            {model.leagueLevel !== 'all' && !hasLevelOption && (
              <Option value={model.leagueLevel}>
                {withCount(
                  `רמה ${model.leagueLevel}`,
                  getCount('leagueLevel', model.leagueLevel),
                  true
                )}
              </Option>
            )}
            {model.levelOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {withCount(option.label, getCount('leagueLevel', option.value), true)}
              </Option>
            ))}
          </Select>
          </Box>

          <Box sx={sx.filterRow}>
          <Box className='dpScrollThin' sx={sx.chipScroll}>
            {seasonValues.map(option => (
              <Chip
                key={option.value}
                component='button'
                type='button'
                size='sm'
                variant={model.seasonKeys.includes(option.value) ? 'solid' : 'outlined'}
                sx={[
                  sx.filterChip,
                  sx.seasonChip,
                  model.seasonKeys.includes(option.value) && sx.seasonChipSelected,
                ]}
                onClick={() => model.toggleSeasonKey(option.value)}
              >
                {withCount(option.label, getCount('seasonKey', option.value))}
              </Chip>
            ))}
          </Box>
          <Box sx={sx.filterEnd}>
            <Select
              size='sm'
              indicator={null}
              value={model.ageGroupId}
              sx={sx.contextSelect}
              renderValue={() => withCount(
                getAgeGroupLabel(model.ageGroupId),
                getCount('ageGroupId', model.ageGroupId),
                true
              )}
              onChange={handleAgeGroupChange}
            >
              <Option value='all'>
                {withCount('כל קבוצות הגיל', getCount('ageGroupId', 'all'), true)}
              </Option>
              {model.ageGroupId !== 'all' && !hasAgeGroupOption && (
                <Option value={model.ageGroupId}>
                  {withCount(
                    model.ageGroupId,
                    getCount('ageGroupId', model.ageGroupId),
                    true
                  )}
                </Option>
              )}
              {model.ageGroupOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {withCount(option.label, getCount('ageGroupId', option.value), true)}
                </Option>
              ))}
            </Select>
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
          </Box>
        </Stack>
      </Box>

      <Box sx={sx.statusFilters}>
        <Box sx={sx.statusChips}>
          {leagueStatusValues.map(option => (
            <Chip
              key={option.value}
              component='button'
              type='button'
              size='sm'
              variant={model.leagueStatuses.includes(option.value) ? 'solid' : 'outlined'}
              sx={sx.filterChip}
              onClick={() => model.toggleLeagueStatus(option.value)}
            >
              {withCount(option.label, getCount('leagueStatus', option.value))}
            </Chip>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function FilterOptionLabel({ label, count, spread }) {
  return (
    <Box component='span' sx={[sx.filterLabel, spread && sx.filterLabelSpread]}>
      <span>{label}</span>
      <Box component='span' sx={sx.filterCount}>{count}</Box>
    </Box>
  )
}
