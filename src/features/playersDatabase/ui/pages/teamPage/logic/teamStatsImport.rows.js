// src/features/playersDatabase/ui/pages/teamPage/logic/teamStatsImport.rows.js

import {
  clean,
  isSmallIndex,
  toNumber,
} from './teamPage.utils.js'

const hasTextValue = value => /[^\d\s,.-]/.test(clean(value))

const isNumberToken = value => /^-?\d+(?:[,.]\d+)?$/.test(clean(value))

const isReversedStatsRow = cells => {
  if (cells.length < 9) return false

  const lastCell = cells[cells.length - 1]
  const beforeLastCell = cells[cells.length - 2]

  return (
    toNumber(cells[0]) > 0 &&
    (
      hasTextValue(beforeLastCell) ||
      hasTextValue(lastCell)
    ) &&
    (
      isSmallIndex(lastCell) ||
      hasTextValue(lastCell)
    )
  )
}

export const buildStatsFallbackMap = cells => {
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

export const splitStatsCells = row => {
  if (row.includes('\t')) return row.split('\t').map(clean)

  const spacedCells = row
    .split(/\s{2,}/)
    .map(clean)
    .filter(Boolean)

  return spacedCells.length > 1 ? spacedCells : [clean(row)]
}

export const buildLooseStatsRow = (row, rowIndex) => {
  const tokens = clean(row).split(/\s+/).filter(Boolean)

  if (tokens.length < 9) return null

  const firstTokenIsIndex = isSmallIndex(tokens[0])
  const lastTokenIsIndex = isSmallIndex(tokens[tokens.length - 1])
  const firstTokenLooksMinutes = (
    isNumberToken(tokens[0]) &&
    toNumber(tokens[0]) > 200
  )

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
    const statsStart = Math.max(
      0,
      trailingNumbers.length - (hasRedCards ? 8 : 7)
    )
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
