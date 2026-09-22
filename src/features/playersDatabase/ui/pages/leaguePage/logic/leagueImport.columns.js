// features/playersDatabase/ui/pages/leaguePage/logic/leagueImport.columns.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { LeagueClubSlotField } from '../components/LeagueClubSlotField.js'
import { LeagueTeamNameLink } from '../components/LeagueTeamNameLink.js'
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

const emitCellChange = ({
  row,
  rowIndex,
  columnKey,
  value,
  onCellChange,
}) => {
  if (typeof onCellChange !== 'function') return

  onCellChange({
    row,
    rowIndex,
    column: {
      key: columnKey,
    },
    value,
  })
}

function getIdentityErrorMessage(row) {
  if (!row?.requiresTeamSlotResolution) return ''

  return Array.isArray(row.errors)
    ? row.errors.filter(Boolean).join(' ')
    : ''
}

const renderTeamNameCell = ({
  row,
  value,
}) => (
  <LeagueTeamNameLink
    teamName={value}
    teamUrl={row.displayTeamUrl || row.teamUrl}
  />
)

const renderTeamIdentityCell = ({
  row,
  rowIndex,
  onCellChange,
}) => {
  return (
    <LeagueClubSlotField
      clubId={row.clubId}
      clubOptions={clubOptions}
      teamSlot={row.teamSlot}
      teamSlotOptions={teamSlotOptions}
      clubError={!clean(row.clubId)}
      slotError={!clean(row.teamSlot)}
      errorMessage={getIdentityErrorMessage(row)}
      warningMessage={row.identityWarningMessage || ''}
      filterOptions={filterClubOptions}
      onClubChange={value => {
        emitCellChange({
          row,
          rowIndex,
          columnKey: 'clubId',
          value,
          onCellChange,
        })
      }}
      onTeamSlotChange={value => {
        emitCellChange({
          row,
          rowIndex,
          columnKey: 'teamSlot',
          value,
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
    sx: sx.rankColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'teamName',
    label: 'שם קבוצה',
    readOnly: true,
    sx: sx.teamNameColumn,
    headerSx: sx.textHeader,
    cellContentSx: sx.textCellContent,
    render: renderTeamNameCell,
  },
  {
    key: 'teamIdentity',
    label: 'זיהוי קבוצה',
    sx: sx.teamIdentityColumn,
    headerSx: sx.textHeader,
    cellContentSx: sx.textCellContent,
    render: renderTeamIdentityCell,
  },
  {
    key: 'games',
    readOnly: true,
    required: true,
    label: 'משחקים',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'wins',
    readOnly: true,
    label: 'ניצחונות',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'draws',
    readOnly: true,
    label: 'תיקו',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'losses',
    readOnly: true,
    label: 'הפסדים',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'goalsFor',
    readOnly: true,
    required: true,
    label: 'זכות',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'goalsAgainst',
    readOnly: true,
    required: true,
    label: 'חובה',
    sx: sx.compactColumn,
    inputSx: sx.numberInput,
  },
  {
    key: 'goalDifference',
    readOnly: true,
    label: 'הפרש',
    sx: sx.compactColumn,
    inputSx: sx.ltrNumberInput,
  },
  {
    key: 'points',
    readOnly: true,
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
  'קישור קבוצה',
].join('\t')

export function buildLeagueImportColumns() {
  return baseImportColumns
}
