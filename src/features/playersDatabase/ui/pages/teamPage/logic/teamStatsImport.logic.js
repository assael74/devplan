// features/playersDatabase/ui/pages/teamPage/logic/teamStatsImport.logic.js

import { clean, isSmallIndex, toNumber } from './teamPage.utils.js'

const normalizeImportHeader = value => clean(value)
  .replace(/[.״"׳']/g, '')
  .replace(/\s+/g, ' ')

const buildHeaderMap = headers => headers.reduce((map, header, index) => {
  const normalizedHeader = normalizeImportHeader(header)

  if (normalizedHeader.includes('אינדקס')) map.index = index
  if (
    normalizedHeader.includes('שם השחקן') ||
    normalizedHeader.includes('שם שחקן')
  ) map.fullName = index
  if (
    normalizedHeader.includes('משחקי ליגה') ||
    (
      normalizedHeader.includes('משחקים') &&
      !normalizedHeader.includes('דקות')
    )
  ) map.games = index
  if (
    normalizedHeader === 'שערים' ||
    normalizedHeader.includes('שערי ליגה') ||
    normalizedHeader.endsWith(' שערים')
  ) map.goals = index
  if (
    normalizedHeader.includes('צהובים ליגה') ||
    normalizedHeader.includes('כ צהובים') ||
    normalizedHeader.includes('צהובים')
  ) map.yellowCards = index
  if (normalizedHeader.includes('הרכב פותח')) map.starts = index
  if (normalizedHeader.includes('נכנס כמחליף')) map.substituteIn = index
  if (normalizedHeader.includes('הוחלף')) map.substitutedOut = index
  if (
    normalizedHeader.includes('דקות ליגה') ||
    normalizedHeader.includes('דקות משחק')
  ) map.minutes = index

  return map
}, {})

const hasPlayerStatsHeader = row => {
  const normalizedRow = normalizeImportHeader(row)

  return (
    (
      normalizedRow.includes('שם השחקן') ||
      normalizedRow.includes('שם שחקן')
    ) &&
    (
      normalizedRow.includes('דקות ליגה') ||
      normalizedRow.includes('דקות משחק') ||
      normalizedRow.includes('משחקי ליגה') ||
      normalizedRow.includes('משחקים')
    )
  )
}

const getMappedCell = ({ cells, headerMap, key, fallbackIndex }) => {
  const mappedIndex = headerMap[key]

  if (Number.isInteger(mappedIndex)) return cells[mappedIndex] || ''

  return cells[fallbackIndex] || ''
}

const hasMappedStatsHeader = headerMap => (
  Number.isInteger(headerMap.fullName) ||
  Number.isInteger(headerMap.games) ||
  Number.isInteger(headerMap.minutes)
)

const hasTextValue = value => /[^\d\s,.-]/.test(clean(value))

const isReversedStatsRow = cells => {
  if (cells.length < 9) return false

  const lastCell = cells[cells.length - 1]
  const beforeLastCell = cells[cells.length - 2]

  return (
    toNumber(cells[0]) > 0 &&
    (
      hasTextValue(beforeLastCell) ||
      hasTextValue(cells[cells.length - 1])
    ) &&
    (
      isSmallIndex(lastCell) ||
      hasTextValue(lastCell)
    )
  )
}

const buildStatsFallbackMap = cells => {
  if (isReversedStatsRow(cells)) {
    const hasTrailingIndex = isSmallIndex(cells[cells.length - 1])
    const indexPosition = hasTrailingIndex ? cells.length - 1 : null
    const namePosition = hasTrailingIndex ? cells.length - 2 : cells.length - 1
    const gamesPosition = namePosition - 1
    const goalsPosition = gamesPosition - 1

    return {
      index: indexPosition,
      fullName: namePosition,
      games: gamesPosition,
      goals: goalsPosition,
      yellowCards: goalsPosition - 1,
      starts: 3,
      substituteIn: 2,
      substitutedOut: 1,
      minutes: 0,
    }
  }

  if (cells.length >= 11) {
    return {
      index: 0,
      fullName: 1,
      games: 2,
      goals: 3,
      yellowCards: 4,
      starts: 7,
      substituteIn: 8,
      substitutedOut: 9,
      minutes: 10,
    }
  }

  if (cells.length >= 10 && hasTextValue(cells[0])) {
    return {
      index: null,
      fullName: 0,
      games: 1,
      goals: 2,
      yellowCards: 3,
      starts: 6,
      substituteIn: 7,
      substitutedOut: 8,
      minutes: 9,
    }
  }

  return {
    index: 0,
    fullName: 1,
    games: 2,
    goals: 3,
    yellowCards: 4,
    starts: 5,
    substituteIn: 6,
    substitutedOut: 7,
    minutes: 8,
  }
}

const isNumberToken = value => /^-?\d+(?:[,.]\d+)?$/.test(clean(value))

const splitStatsCells = row => {
  if (row.includes('\t')) return row.split('\t').map(clean)

  const spacedCells = row
    .split(/\s{2,}/)
    .map(clean)
    .filter(Boolean)

  return spacedCells.length > 1 ? spacedCells : [clean(row)]
}

const buildLooseStatsRow = (row, rowIndex) => {
  const tokens = clean(row).split(/\s+/).filter(Boolean)
  if (tokens.length < 9) return null

  const firstTokenIsIndex = isSmallIndex(tokens[0])
  const lastTokenIsIndex = isSmallIndex(tokens[tokens.length - 1])
  const firstTokenLooksMinutes = isNumberToken(tokens[0]) && toNumber(tokens[0]) > 200

  if (firstTokenIsIndex) {
    const index = tokens[0]
    const trailingNumbers = []
    let pointer = tokens.length - 1

    while (pointer > 0 && isNumberToken(tokens[pointer])) {
      trailingNumbers.unshift(tokens[pointer])
      pointer -= 1
    }

    const name = tokens.slice(1, pointer + 1).join(' ')
    if (!name || trailingNumbers.length < 7) return null

    const hasRedCards = trailingNumbers.length >= 8
    const statsStart = Math.max(0, trailingNumbers.length - (hasRedCards ? 8 : 7))
    const stats = trailingNumbers.slice(statsStart)

    return {
      id: `${rowIndex + 1}_${name || 'player'}`,
      index,
      fullName: name,
      games: toNumber(stats[0]),
      goals: toNumber(stats[1]),
      yellowCards: toNumber(stats[2]),
      starts: toNumber(stats[hasRedCards ? 4 : 3]),
      substituteIn: toNumber(stats[hasRedCards ? 5 : 4]),
      substitutedOut: toNumber(stats[hasRedCards ? 6 : 5]),
      minutes: toNumber(stats[hasRedCards ? 7 : 6]),
    }
  }

  if (firstTokenLooksMinutes && lastTokenIsIndex) {
    const index = tokens[tokens.length - 1]
    const nameEnd = tokens.length - 2
    let nameStart = nameEnd

    while (nameStart > 0 && !isNumberToken(tokens[nameStart - 1])) {
      nameStart -= 1
    }

    const name = tokens.slice(nameStart, nameEnd + 1).join(' ')
    const numbers = tokens.slice(0, nameStart)
    if (!name || numbers.length < 7) return null

    return {
      id: `${rowIndex + 1}_${name || 'player'}`,
      index,
      fullName: name,
      games: toNumber(numbers[numbers.length - 1]),
      goals: toNumber(numbers[numbers.length - 2]),
      yellowCards: toNumber(numbers[numbers.length - 3]),
      starts: toNumber(numbers[3]),
      substituteIn: toNumber(numbers[2]),
      substitutedOut: toNumber(numbers[1]),
      minutes: toNumber(numbers[0]),
    }
  }

  return null
}
const getStatsCell = ({ cells, headerMap, fallback, key }) => {
  if (hasMappedStatsHeader(headerMap)) {
    return getMappedCell({
      cells,
      headerMap,
      key,
      fallbackIndex: fallback[key],
    })
  }

  const fallbackIndex = fallback[key]

  if (!Number.isInteger(fallbackIndex)) return ''

  return cells[fallbackIndex] || ''
}

export const parsePlayerStatsRows = value => {
  const rows = clean(value)
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)
  const headerRowIndex = rows.findIndex(hasPlayerStatsHeader)
  const headerCells = headerRowIndex >= 0
    ? splitStatsCells(rows[headerRowIndex])
    : []
  const headerMap = headerCells.length ? buildHeaderMap(headerCells) : {}
  const dataRows = headerCells.length ? rows.slice(headerRowIndex + 1) : rows

  return dataRows.map((row, index) => {
    const cells = splitStatsCells(row)
    const looseRow = !hasMappedStatsHeader(headerMap) && cells.length === 1
      ? buildLooseStatsRow(row, index)
      : null

    if (looseRow) return looseRow

    const fallback = buildStatsFallbackMap(cells)
    const fullName = getStatsCell({ cells, headerMap, fallback, key: 'fullName' })
    const rowIndex = getStatsCell({ cells, headerMap, fallback, key: 'index' })

    return {
      id: `${index + 1}_${fullName || cells[0] || 'player'}`,
      index: rowIndex || `${index + 1}`,
      fullName,
      games: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'games' })),
      goals: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'goals' })),
      yellowCards: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'yellowCards' })),
      starts: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'starts' })),
      substituteIn: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'substituteIn' })),
      substitutedOut: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'substitutedOut' })),
      minutes: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'minutes' })),
    }
  })
}
