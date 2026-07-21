// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterFilters.js

import { Card, Input, Option, Select, Stack } from '@mui/joy'

import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterFilters({ model }) {
  return (
    <Card sx={sx.filtersCard}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} sx={sx.filtersRow}>
        <Input
          placeholder='חיפוש ליגה...'
          value={model.query}
          sx={sx.searchInput}
          onChange={event => model.setQuery(event.target.value)}
        />

        <Select
          value={model.ageGroup}
          sx={sx.filterSelect}
          onChange={(event, value) => model.setAgeGroup(value || 'all')}
        >
          <Option value='all'>כל קבוצות הגיל</Option>
          {model.ageGroupOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          value={model.leagueFilter}
          sx={sx.filterSelect}
          onChange={(event, value) => model.setLeagueFilter(value || 'all')}
        >
          <Option value='all'>כל הליגות</Option>
          {model.leagueOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          value={model.birthYear}
          sx={sx.filterSelect}
          onChange={(event, value) => model.setBirthYear(value || 'all')}
        >
          <Option value='all'>כל השנתונים</Option>
          {model.birthYearOptions.map(year => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>

        <Select
          value={model.seasonKey}
          sx={sx.filterSelect}
          onChange={(event, value) => model.setSeasonKey(value || '26/27')}
        >
          {model.seasonOptions.map(seasonKey => (
            <Option key={seasonKey} value={seasonKey}>
              {seasonKey}
            </Option>
          ))}
        </Select>
      </Stack>
    </Card>
  )
}
