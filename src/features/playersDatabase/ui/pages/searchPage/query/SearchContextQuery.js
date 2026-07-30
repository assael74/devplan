// features/playersDatabase/ui/pages/searchPage/query/SearchContextQuery.js

import { Chip, FormControl, FormLabel, Stack, Tooltip } from '@mui/joy'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded'
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
  unknown: HelpOutlineRounded,
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
            startDecorator={iconUi({ id: option.value, size: 'sm' })}
            onClick={() => onSelect(selected ? '' : option.value)}
          >
            {option.label}
          </Chip>
        )
      })}
    </Stack>
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
          <FormControl sx={sx.filterGroup}>
            <FormLabel sx={sx.groupLabel}>מקור הרשומות</FormLabel>
            <Stack direction='row' sx={sx.chipGroup}>
              <Chip
                size='md'
                variant={filters.favoritesOnly ? 'solid' : 'outlined'}
                sx={sx.filterChip}
                onClick={() => onUpdate('favoritesOnly', !filters.favoritesOnly)}
              >
                מועדפים בלבד
              </Chip>
            </Stack>
          </FormControl>
        ) : null}

        {filters.searchContext === 'team' ? (
          <FormControl sx={sx.filterGroup}>
            <FormLabel sx={sx.groupLabel}>שינוי רמה צפוי</FormLabel>
            <Stack direction='row' sx={sx.chipGroup}>
              {SEARCH_EXPECTED_LEVEL_CHANGE_OPTIONS.map(option => {
                const Icon = EXPECTED_LEVEL_CHANGE_ICONS[option.value] || HelpOutlineRounded

                return (
                  <Tooltip key={option.value} title={option.label} placement='top'>
                    <Chip
                      size='md'
                      variant={filters.expectedLeagueLevelChanges.includes(option.value)
                        ? 'solid'
                        : 'outlined'}
                      sx={sx.filterChip}
                      aria-label={option.label}
                      onClick={() => onToggle('expectedLeagueLevelChanges', option.value)}
                    >
                      <Icon fontSize='small' />
                    </Chip>
                  </Tooltip>
                )
              })}
            </Stack>
          </FormControl>
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
