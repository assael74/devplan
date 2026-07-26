// features/playersDatabase/ui/pages/searchPage/resultsSidebar/SearchResultsFilters.js

import {
  Box,
  Button,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { searchResultsSidebarSx as sx } from './sx/searchResultsSidebar.sx.js'

function ResultFilterSelect({
  label,
  field,
  value = [],
  options = [],
  onChange,
}) {
  if (!options.length) return null

  return (
    <Box sx={sx.filterField}>
      <Typography level='body-xs' sx={sx.filterLabel}>
        {label}
      </Typography>

      <Select
        multiple
        size='sm'
        value={value}
        placeholder='הכול'
        onChange={(event, nextValue) => onChange(field, nextValue)}
        sx={sx.filterSelect}
      >
        {options.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Box>
  )
}

export default function SearchResultsFilters({
  entityType = 'player',
  filters = {},
  options = {},
  hasFilters = false,
  onChange,
  onReset,
}) {
  const isTeam = entityType === 'team'

  return (
    <Box sx={sx.filtersSection}>
      <Box sx={sx.filtersHeader}>
        <Typography level='title-sm' sx={sx.filtersTitle}>
          סינון תוצאות
        </Typography>

        <Button
          size='sm'
          variant='plain'
          color='neutral'
          disabled={!hasFilters}
          onClick={onReset}
          sx={sx.filtersReset}
        >
          איפוס
        </Button>
      </Box>

      <Box sx={sx.filtersGrid}>
        <ResultFilterSelect
          label='עונה'
          field='seasons'
          value={filters.seasons}
          options={options.seasons}
          onChange={onChange}
        />

        <ResultFilterSelect
          label='ליגה'
          field='leagues'
          value={filters.leagues}
          options={options.leagues}
          onChange={onChange}
        />

        {isTeam ? (
          <>
            <ResultFilterSelect
              label='ביצוע התקפי'
              field='attackLevels'
              value={filters.attackLevels}
              options={options.attackLevels}
              onChange={onChange}
            />

            <ResultFilterSelect
              label='ביצוע הגנתי'
              field='defenseLevels'
              value={filters.defenseLevels}
              options={options.defenseLevels}
              onChange={onChange}
            />
          </>
        ) : (
          <>
            <ResultFilterSelect
              label='קבוצה'
              field='teams'
              value={filters.teams}
              options={options.teams}
              onChange={onChange}
            />

            <ResultFilterSelect
              label='פרופיל סקאוט'
              field='profiles'
              value={filters.profiles}
              options={options.profiles}
              onChange={onChange}
            />
          </>
        )}
      </Box>
    </Box>
  )
}
