// features/playersDatabase/ui/pages/teamPage/logic/teamRosterImport.logic.js

import { clean, isSmallIndex } from './teamPage.utils.js'

const HEADER_ALIASES = {
  index: [
    'אינדקס',
    'מספר',
    'מס',
    '#',
  ],
  fullName: [
    'שם השחקן',
    'שחקן',
    'שם מלא',
    'שם',
  ],
  birthYear: [
    'שנתון',
    'שנת לידה',
    'שנתלידה',
    'birthyear',
  ],
  externalPlayerId: [
    'מזהה התאחדות',
    'מזהה שחקן',
    'מזהה שחקן חיצוני',
    'playerid',
    'player_id',
  ],
  playerUrl: [
    'קישור שחקן',
    'קישור',
    'כתובת שחקן',
    'url',
  ],
  numShirt: [
    'מספר חולצה',
    'מס חולצה',
    'חולצה',
  ],
}

const normalizeHeader = value => clean(value)
  .toLowerCase()
  .replace(/["'׳״:._-]/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const HEADER_LOOKUP = Object.entries(HEADER_ALIASES).reduce(
  (result, [key, aliases]) => {
    aliases.forEach(alias => {
      result[normalizeHeader(alias)] = key
    })

    return result
  },
  {},
)

const isPlayerUrl = value => {
  const nextValue = clean(value).toLowerCase()

  return (
    nextValue.includes('/players/player') ||
    nextValue.includes('player_id=') ||
    /^https?:\/\//.test(nextValue)
  )
}

const resolvePlayerIdFromUrl = value => {
  const match = clean(value).match(/[?&]player_id=(\d+)/i)
  return match?.[1] || ''
}

const isExternalPlayerId = value =>
  /^\d{5,}$/.test(clean(value))

const buildHeaderMap = cells => cells.reduce((result, cell, index) => {
  const key = HEADER_LOOKUP[normalizeHeader(cell)]

  if (key && result[key] === undefined) {
    result[key] = index
  }

  return result
}, {})

const hasRosterHeader = headerMap => (
  headerMap.fullName !== undefined &&
  Object.keys(headerMap).length >= 2
)

const getMappedCell = (cells, headerMap, key) => {
  const index = headerMap[key]
  return index === undefined ? '' : clean(cells[index])
}

const parseMappedRow = ({ cells, headerMap, rowIndex }) => {
  const playerUrl = getMappedCell(cells, headerMap, 'playerUrl')
  const birthYear = getMappedCell(cells, headerMap, 'birthYear')
  const mappedExternalId = getMappedCell(
    cells,
    headerMap,
    'externalPlayerId',
  )
  const urlExternalId = resolvePlayerIdFromUrl(playerUrl)
  const externalPlayerId = isExternalPlayerId(mappedExternalId) &&
    mappedExternalId !== birthYear
    ? mappedExternalId
    : urlExternalId

  return {
    id: `${rowIndex + 1}_${externalPlayerId || getMappedCell(cells, headerMap, 'fullName') || 'player'}`,
    index: getMappedCell(cells, headerMap, 'index') || `${rowIndex + 1}`,
    fullName: getMappedCell(cells, headerMap, 'fullName'),
    externalPlayerId,
    playerUrl,
    numShirt: getMappedCell(cells, headerMap, 'numShirt'),
  }
}

const parsePositionalRow = ({ cells, rowIndex }) => {
  const hasIndexCell = isSmallIndex(cells[0])
  const dataCells = hasIndexCell ? cells.slice(1) : cells
  const fullName = clean(dataCells[0])
  const playerUrl = dataCells.find(isPlayerUrl) || ''
  const urlExternalId = resolvePlayerIdFromUrl(playerUrl)
  const externalPlayerId = dataCells.find(cell => (
    cell !== playerUrl && isExternalPlayerId(cell)
  )) || urlExternalId
  const numShirt = dataCells.find((cell, index) => (
    index > 0 &&
    cell !== externalPlayerId &&
    isSmallIndex(cell)
  )) || ''

  return {
    id: `${rowIndex + 1}_${externalPlayerId || fullName || 'player'}`,
    index: hasIndexCell ? clean(cells[0]) : `${rowIndex + 1}`,
    fullName,
    externalPlayerId,
    playerUrl,
    numShirt,
  }
}

export const parsePlayerRosterRows = value => {
  const tableRows = clean(value)
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)
    .map(row => row.split('\t').map(clean))

  if (!tableRows.length) return []

  const headerMap = buildHeaderMap(tableRows[0])
  const usesHeader = hasRosterHeader(headerMap)
  const dataRows = usesHeader ? tableRows.slice(1) : tableRows

  return dataRows.map((cells, rowIndex) => (
    usesHeader
      ? parseMappedRow({ cells, headerMap, rowIndex })
      : parsePositionalRow({ cells, rowIndex })
  ))
}
