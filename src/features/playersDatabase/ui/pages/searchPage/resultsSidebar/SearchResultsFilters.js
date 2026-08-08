// features/playersDatabase/ui/pages/searchPage/resultsSidebar/SearchResultsFilters.js

import {
  Box,
  Button,
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { scoutPriorityColors } from '../../../../../../ui/patterns/scout/ScoutPriority.js'
import { searchResultsFiltersSx as sx } from './sx/SearchResultsFilters.sx.js'

const priorityOptionDisplay = {
  elite: {
    iconId: 'leadingTarget',
    colors: scoutPriorityColors.leadingTarget,
  },
  high: {
    iconId: 'highPriority',
    colors: scoutPriorityColors.highPriority,
  },
  positive: {
    iconId: 'positivePriority',
    colors: scoutPriorityColors.positive,
  },
  neutral: {
    iconId: 'regularPriority',
    colors: scoutPriorityColors.regular,
  },
  low: {
    iconId: 'lowPriority',
    colors: scoutPriorityColors.lowPriority,
  },
}

function ResultFilterSearch({
  label,
  field,
  value = '',
  onChange,
}) {
  return (
    <Box sx={sx.filterField}>
      <Typography level='body-xs' sx={sx.filterLabel}>
        {label}
      </Typography>

      <Input
        size='sm'
        value={value}
        placeholder='חיפוש לפי שם קבוצה'
        onChange={event => onChange(field, event.target.value)}
        sx={sx.filterInput}
      />
    </Box>
  )
}

function FilterOptionContent({ option }) {
  const display = priorityOptionDisplay[option.tone]

  if (!display) return option.label

  return (
    <Box sx={sx.priorityOption}>
      {iconUi({
        id: display.iconId,
        size: 'sm',
        sx: sx.priorityOptionIcon(display.colors),
      })}

      <Typography
        component='span'
        sx={sx.priorityOptionLabel(display.colors)}
      >
        {option.label}
      </Typography>
    </Box>
  )
}

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
            <FilterOptionContent option={option} />
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
        <ResultFilterSearch
          label='חיפוש קבוצה'
          field='teamSearch'
          value={filters.teamSearch}
          onChange={onChange}
        />

        <Box sx={sx.filtersRow}>
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
        </Box>

        {isTeam ? (
          <Box sx={sx.filtersRow}>
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
          </Box>
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
