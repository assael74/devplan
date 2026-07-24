// features/playersDatabase/ui/pages/searchPage/query/SearchContextQuery.js

import { Chip, FormControl, FormLabel, Input, Stack } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { SEARCH_CONTEXT_TYPES } from '../logic/search.constants.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchContextQuerySx as sx } from './sx/searchContextQuery.sx.js'

const seasonOptions = ['26/27', '25/26', '24/25']
const birthYearOptions = ['2008', '2009', '2010', '2011', '2012', '2013']
const leagueLevelOptions = ['1', '2', '3', '4']

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
  const freeTextPlaceholder = filters.searchContext === 'team'
    ? 'חיפוש חופשי לפי שם קבוצה'
    : filters.searchContext === 'player'
      ? 'חיפוש חופשי לפי שם שחקן'
      : 'יש לבחור הקשר חיפוש'

  return (
    <SearchQuerySection title='הקשר החיפוש' step='01'>
      <Stack sx={sx.root}>
        <Stack sx={sx.contextGroup}>
          <EntityTypeSelector
            value={filters.searchContext}
            onSelect={value => onUpdate('searchContext', value)}
          />

          <Input
            size='sm'
            value={filters.query}
            placeholder={freeTextPlaceholder}
            onChange={event => onUpdate('query', event.target.value)}
          />
        </Stack>

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
