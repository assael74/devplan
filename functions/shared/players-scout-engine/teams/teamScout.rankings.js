// src/shared/scouting/teams/teamScout.rankings.js

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundWholeNumber = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Math.round(n)
}

const buildAverageRanks = ({ rows, valueKey, direction }) => {
  const usableRows = rows
    .map((row, index) => ({
      row,
      index,
      value: toNumber(row[valueKey]),
    }))
    .filter((item) => Number.isFinite(item.value))
    .sort((a, b) => {
      return direction === 'asc'
        ? a.value - b.value
        : b.value - a.value
    })

  const ranksByIndex = new Map()
  let cursor = 0

  while (cursor < usableRows.length) {
    let tieEnd = cursor

    while (
      tieEnd + 1 < usableRows.length &&
      usableRows[tieEnd + 1].value === usableRows[cursor].value
    ) {
      tieEnd += 1
    }

    const firstRank = cursor + 1
    const lastRank = tieEnd + 1
    const averageRank = roundWholeNumber((firstRank + lastRank) / 2)

    for (let index = cursor; index <= tieEnd; index += 1) {
      ranksByIndex.set(usableRows[index].index, averageRank)
    }

    cursor = tieEnd + 1
  }

  return ranksByIndex
}

export const addTeamScoutRankings = (rows = []) => {
  const offenseRanks = buildAverageRanks({
    rows,
    valueKey: 'goalsForPerGame',
    direction: 'desc',
  })
  const defenseRanks = buildAverageRanks({
    rows,
    valueKey: 'goalsAgainstPerGame',
    direction: 'asc',
  })

  return rows.map((row, index) => {
    return {
      ...row,
      goalsForRank: offenseRanks.get(index) || null,
      goalsAgainstRank: defenseRanks.get(index) || null,
    }
  })
}
