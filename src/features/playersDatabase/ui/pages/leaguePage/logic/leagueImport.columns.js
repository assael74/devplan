// features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.columns.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { shouldShowDisplayName } from './leagueImport.logic.js'

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
}))

const teamSlotOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
]

const baseImportColumns = [
  { key: 'rank', required: true, label: 'מיקום', readOnly: true, sx: compactColumnSx, inputSx: numberInputSx },
  {
    key: 'clubId',
    required: true,
    label: 'מועדון',
    type: 'select',
    options: clubOptions,
    sx: { width: 190, minWidth: 190 },
    inputSx: { minWidth: 170 },
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

const displayNameColumn = {
  key: 'teamName',
  label: 'שם בתצוגה',
  sx: { width: 180, minWidth: 180 },
  inputSx: { minWidth: 150 },
}

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

export const buildLeagueImportColumns = rows => {
  if (!rows.some(shouldShowDisplayName)) return baseImportColumns

  return [
    ...baseImportColumns.slice(0, 3),
    displayNameColumn,
    ...baseImportColumns.slice(3),
  ]
}
