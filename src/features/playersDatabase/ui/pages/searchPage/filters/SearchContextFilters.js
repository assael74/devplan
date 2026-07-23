// features/playersDatabase/ui/pages/searchPage/filters/SearchContextFilters.js

import { Chip, FormControl, FormLabel, Input, Option, Select, Stack } from '@mui/joy'

import { SEARCH_SEASON_MODES } from '../logic/search.constants.js'
import SearchFilterSection from './SearchFilterSection.js'
import { searchFiltersSx as sx } from '../sx/searchFilters.sx.js'

const seasonOptions = ['2026/27', '2025/26', '2024/25']
const birthYearOptions = ['2008', '2009', '2010', '2011', '2012', '2013']
const leagueLevelOptions = ['1', '2', '3', '4']

function ChipGroup({ values, selected, onToggle, prefix }) {
  return (
    <Stack direction='row' sx={sx.chipGroup}>
      {values.map(value => (
        <Chip
          key={value}
          size='sm'
          variant={selected.includes(value) ? 'solid' : 'outlined'}
          sx={sx.filterChip}
          onClick={() => onToggle(value)}
        >
          {prefix}{value}
        </Chip>
      ))}
    </Stack>
  )
}

export default function SearchContextFilters({ filters, onUpdate, onToggle }) {
  return (
    <SearchFilterSection title='הקשר החיפוש' description='הגדר את טווח הנתונים לפני בניית התנאים.'>
      <Stack spacing={1.25}>
        <FormControl>
          <FormLabel>חיפוש חופשי</FormLabel>
          <Input
            size='sm'
            value={filters.query}
            placeholder='שחקן, קבוצה או ליגה'
            onChange={event => onUpdate('query', event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>מודל עונות</FormLabel>
          <Select size='sm' value={filters.seasonMode} onChange={(event, value) => onUpdate('seasonMode', value)}>
            {SEARCH_SEASON_MODES.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>עונות</FormLabel>
          <ChipGroup values={seasonOptions} selected={filters.seasons} onToggle={value => onToggle('seasons', value)} prefix='' />
        </FormControl>

        <FormControl>
          <FormLabel>שנתונים</FormLabel>
          <ChipGroup values={birthYearOptions} selected={filters.birthYears} onToggle={value => onToggle('birthYears', value)} prefix='' />
        </FormControl>

        <FormControl>
          <FormLabel>רמת ליגה</FormLabel>
          <ChipGroup values={leagueLevelOptions} selected={filters.leagueLevels} onToggle={value => onToggle('leagueLevels', value)} prefix='רמה ' />
        </FormControl>
      </Stack>
    </SearchFilterSection>
  )
}
