// features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.columns.js

import * as React from 'react'
import {
  Autocomplete,
  Typography,
} from '@mui/joy'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { leagueImportColumnsSx as sx } from './leagueImport.columns.sx.js'

function clean(value) {
  return String(
    value === null || value === undefined
      ? ''
      : value
  ).trim()
}

const clubOptions = PLAYERS_DATABASE_CLUBS_CATALOG.map(club => ({
  value: club.id,
  label: club.name,
  displayLabel: club.shortName || club.name,
  searchText: (club.searchAliases || [club.name, club.shortName, ...(club.aliases || [])])
    .filter(Boolean)
    .join(' '),
}))

const teamSlotOptions = [
  {
    value: '1',
    label: '1',
  },
  {
    value: '2',
    label: '2',
  },
  {
    value: '3',
    label: '3',
  },
]

function normalizeSearchValue(value) {
  return clean(value)
    .toLowerCase()
    .replace(/["׳״'`.-]/g, '')
    .replace(/\s+/g, ' ')
}

const filterClubOptions = (options, state) => {
  const query = normalizeSearchValue(state.inputValue)
  if (!query) return options

  return options.filter(option => normalizeSearchValue(
    `${option.displayLabel || option.label || ''} ${option.searchText || ''}`
  ).includes(query))
}

const emitClubChange = ({
  row,
  rowIndex,
  column,
  value,
  onCellChange,
}) => {
  if (typeof onCellChange !== 'function') return

  onCellChange({
    row,
    rowIndex,
    column,
    value,
  })
}

const renderClubCell = ({
  row,
  rowIndex,
  column,
  value,
  onCellChange,
}) => {
  const selectedOption = clubOptions.find(option => option.value === value) || null

  if (selectedOption) {
    return (
      <Typography
        level="body-sm"
        noWrap
        title={selectedOption.label}
        sx={sx.selectedClub}
      >
        {selectedOption.displayLabel}
      </Typography>
    )
  }

  return (
    <Autocomplete
      size="sm"
      options={clubOptions}
      value={null}
      placeholder="חיפוש מועדון"
      getOptionLabel={option => option.displayLabel || option.label || ''}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      filterOptions={filterClubOptions}
      sx={column.inputSx}
      onChange={(event, nextOption) => {
        emitClubChange({
          row,
          rowIndex,
          column,
          value: nextOption ? nextOption.value : '',
          onCellChange,
        })
      }}
    />
  )
}

const baseImportColumns = [
  {
    key: 'rank',
    required: true,
    label: 'מיקום',
    readOnly: true,
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'clubId',
    required: true,
    label: 'שם מערכת',
    options: clubOptions,
    sx: sx.clubColumn,
    inputSx: sx.clubInput,
    render: renderClubCell,
  },
  {
    key: 'teamName',
    label: 'שם שנקלט',
    readOnly: true,
    sx: sx.teamNameColumn,
    inputSx: sx.teamNameInput,
  },
  {
    key: 'teamSlot',
    required: true,
    label: 'קבוצה',
    type: 'select',
    options: teamSlotOptions,
    sx: sx.teamSlotColumn,
    inputSx: sx.teamSlotInput,
  },
  {
    key: 'games',
    required: true,
    label: 'משחקים',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'wins',
    label: 'ניצחונות',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'draws',
    label: 'תיקו',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'losses',
    label: 'הפסדים',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'goalsFor',
    required: true,
    label: 'זכות',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'goalsAgainst',
    required: true,
    label: 'חובה',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'goalDifference',
    label: 'הפרש',
    sx: sx.compactColumn,
    inputSx: sx.ltrNumberInput,
  },
  {
    key: 'points',
    required: true,
    label: 'נקודות',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
]

export const LEAGUE_IMPORT_PLACEHOLDER = [
  'מיקום',
  'קבוצה',
  'משחקים',
  'ניצחונות',
  'תיקו',
  'הפסדים',
  'שערי זכות',
  'שערי חובה',
  'הפרש שערים',
  'נקודות',
].join('\t')

export function buildLeagueImportColumns() {
  return baseImportColumns
}
