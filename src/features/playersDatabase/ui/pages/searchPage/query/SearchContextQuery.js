// features/playersDatabase/ui/pages/searchPage/query/SearchContextQuery.js

import {
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Tooltip,
} from '@mui/joy'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import RemoveRounded from '@mui/icons-material/RemoveRounded'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import {
  SEARCH_CONTEXT_TYPES,
  SEARCH_EXPECTED_LEVEL_CHANGE_OPTIONS,
} from '../logic/search.constants.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchContextQuerySx as sx } from './sx/searchContextQuery.sx.js'

const seasonOptions = ['26/27', '25/26', '24/25']
const birthYearOptions = ['2008', '2009', '2010', '2011', '2012', '2013']
const leagueLevelOptions = ['1', '2', '3', '4']

const EXPECTED_LEVEL_CHANGE_ICONS = {
  relegation: ArrowDownwardRounded,
  unchanged: RemoveRounded,
  promotion: ArrowUpwardRounded,
}

const EXPECTED_LEVEL_CHANGE_COLORS = {
  promotion: 'success',
  relegation: 'danger',
  unchanged: 'neutral',
}

function MultiSelectChips({ values, selected = [], onToggle, prefix = '' }) {
  return (
    <Stack direction='row' sx={sx.chipGroup}>
      {values.map(value => (
        <Chip
          key={value}
          size='md'
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

function EntityTypeSelector({ value, onSelect }) {
  return (
    <Stack direction='row' sx={sx.chipGroup}>
      {SEARCH_CONTEXT_TYPES.map(option => {
        const selected = value === option.value

        return (
          <Chip
            key={option.value}
            size='lg'
            variant={selected ? 'solid' : 'outlined'}
            sx={sx.filterChip}
            startDecorator={iconUi({
              id: option.value,
              size: 'sm',
            })}
            onClick={() => onSelect(selected ? '' : option.value)}
          >
            {option.label}
          </Chip>
        )
      })}
    </Stack>
  )
}

function ExpectedLevelChangeFilters({ selected = [], onToggle }) {
  return (
    <FormControl sx={sx.inlineFilterGroup}>
      <FormLabel sx={sx.groupLabel}>שינוי רמה צפוי</FormLabel>
      <Stack direction='row' sx={sx.chipGroup}>
        {SEARCH_EXPECTED_LEVEL_CHANGE_OPTIONS
          .filter(option => option.value !== 'unknown')
          .map(option => {
          const Icon = EXPECTED_LEVEL_CHANGE_ICONS[option.value] || RemoveRounded
          const isSelected = selected.includes(option.value)

          return (
            <Tooltip key={option.value} title={option.label} placement='top'>
              <Chip
                size='sm'
                color={EXPECTED_LEVEL_CHANGE_COLORS[option.value] || 'neutral'}
                variant={isSelected ? 'solid' : 'outlined'}
                sx={sx.expectedLevelChip}
                aria-label={option.label}
                aria-pressed={isSelected}
                onClick={() => onToggle(option.value)}
              >
                <Icon sx={sx.expectedLevelIcon} />
              </Chip>
            </Tooltip>
          )
        })}
      </Stack>
    </FormControl>
  )
}

export default function SearchContextQuery({ filters, onUpdate, onToggle }) {
  return (
    <SearchQuerySection title='הקשר החיפוש' step='01'>
      <Stack sx={sx.root}>
        <Stack sx={sx.contextGroup}>
          <EntityTypeSelector
            value={filters.searchContext}
            onSelect={value => onUpdate('searchContext', value)}
          />
        </Stack>

        {filters.searchContext ? (
          <Stack direction='row' sx={sx.contextFiltersRow}>
            <FormControl sx={sx.inlineFilterGroup}>
              <FormLabel sx={sx.groupLabel}>מקור הרשומות</FormLabel>
              <Stack direction='row' sx={sx.chipGroup}>
                <Chip
                  size='sm'
                  variant={filters.favoritesOnly ? 'solid' : 'outlined'}
                  sx={sx.filterChip}
                  onClick={() => onUpdate('favoritesOnly', !filters.favoritesOnly)}
                >
                  מועדפים
                </Chip>
              </Stack>
            </FormControl>

            <>
              <Divider orientation='vertical' sx={sx.contextFiltersDivider} />
              <ExpectedLevelChangeFilters
                selected={filters.expectedLeagueLevelChanges}
                onToggle={value => onToggle('expectedLeagueLevelChanges', value)}
              />
            </>
          </Stack>
        ) : null}

        <FormControl sx={sx.filterGroup}>
          <FormLabel sx={sx.groupLabel}>עונות</FormLabel>
          <MultiSelectChips
            values={seasonOptions}
            selected={filters.seasons}
            onToggle={value => onToggle('seasons', value)}
          />
        </FormControl>

        <FormControl sx={sx.filterGroup}>
          <FormLabel sx={sx.groupLabel}>שנתונים</FormLabel>
          <MultiSelectChips
            values={birthYearOptions}
            selected={filters.birthYears}
            onToggle={value => onToggle('birthYears', value)}
          />
        </FormControl>

        <FormControl sx={sx.filterGroup}>
          <FormLabel sx={sx.groupLabel}>רמת ליגה</FormLabel>
          <MultiSelectChips
            values={leagueLevelOptions}
            selected={filters.leagueLevels}
            onToggle={value => onToggle('leagueLevels', value)}
            prefix='רמה '
          />
        </FormControl>
      </Stack>
    </SearchQuerySection>
  )
}
