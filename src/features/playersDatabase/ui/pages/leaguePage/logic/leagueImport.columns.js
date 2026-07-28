// features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.columns.js

import * as React from 'react'
import { Autocomplete, Typography } from '@mui/joy'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'

const clean = value => String(value ?? '').trim()

const compactColumnSx = { width: 66, minWidth: 66 }
const numberInputSx = { minWidth: 48 }
const ltrNumberInputSx = {
  minWidth: 48,
  '& input': {
    direction: 'ltr',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 400,
  },
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
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
]

const normalizeSearchValue = value => clean(value)
  .toLowerCase()
  .replace(/["׳״'`.-]/g, '')
  .replace(/\s+/g, ' ')

const filterClubOptions = (options, state) => {
  const query = normalizeSearchValue(state.inputValue)
  if (!query) return options

  return options.filter(option => normalizeSearchValue(
    `${option.displayLabel || option.label || ''} ${option.searchText || ''}`
  ).includes(query))
}

const emitClubChange = ({ row, rowIndex, column, value, onCellChange }) => {
  if (typeof onCellChange !== 'function') return

  onCellChange({
    row,
    rowIndex,
    column,
    value,
  })
}

const renderClubCell = ({ row, rowIndex, column, value, onCellChange }) => {
  const selectedOption = clubOptions.find(option => option.value === value) || null

  if (selectedOption) {
    return (
      <Typography
        level="body-sm"
        noWrap
        title={selectedOption.label}
        sx={{ minWidth: 0, fontWeight: 700 }}
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
  { key: 'rank', required: true, label: 'מיקום', readOnly: true, sx: compactColumnSx, inputSx: numberInputSx },
  {
    key: 'clubId',
    required: true,
    label: 'שם מערכת',
    options: clubOptions,
    sx: { width: 210, minWidth: 210 },
    inputSx: { minWidth: 190 },
    render: renderClubCell,
  },
  {
    key: 'teamName',
    label: 'שם שנקלט',
    readOnly: true,
    sx: { width: 170, minWidth: 170 },
    inputSx: { minWidth: 150 },
  },
  {
    key: 'teamSlot',
    required: true,
    label: 'קבוצה',
    type: 'select',
    options: teamSlotOptions,
    sx: { width: 64, minWidth: 64 },
    inputSx: { minWidth: 48 },
  },
  { key: 'games', required: true, label: 'משחקים', sx: compactColumnSx, inputSx: numberInputSx },
  { key: 'wins', label: 'ניצחונות', sx: compactColumnSx, inputSx: numberInputSx },
  { key: 'draws', label: 'תיקו', sx: compactColumnSx, inputSx: numberInputSx },
  { key: 'losses', label: 'הפסדים', sx: compactColumnSx, inputSx: numberInputSx },
  { key: 'goalsFor', required: true, label: 'זכות', sx: compactColumnSx, inputSx: numberInputSx },
  { key: 'goalsAgainst', required: true, label: 'חובה', sx: compactColumnSx, inputSx: numberInputSx },
  { key: 'goalDifference', label: 'הפרש', sx: compactColumnSx, inputSx: ltrNumberInputSx },
  { key: 'points', required: true, label: 'נקודות', sx: compactColumnSx, inputSx: numberInputSx },
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

export const buildLeagueImportColumns = () => baseImportColumns
