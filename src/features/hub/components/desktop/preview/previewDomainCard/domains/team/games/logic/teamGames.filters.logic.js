// preview/previewDomainCard/domains/team/games/logic/teamGames.filters.logic.js

const safe = (v) => (v == null ? '' : String(v))

const countBy = (rows, getKey) => {
  return (rows || []).reduce((acc, row) => {
    const key = safe(getKey(row)).trim().toLowerCase()
    if (!key) return acc
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

export const filterTeamGames = (
  rows,
  { typeFilter, homeFilter, resultFilter, diffFilter }
) => {
  const tf = safe(typeFilter).trim().toLowerCase()
  const hf = safe(homeFilter).trim().toLowerCase()
  const rf = safe(resultFilter).trim().toLowerCase()
  const df = safe(diffFilter).trim().toLowerCase()

  return (rows || []).filter((x) => {
    if (tf && tf !== 'all' && x.type !== tf) return false
    if (hf === 'home' && !x.isHome) return false
    if (hf === 'away' && x.isHome) return false
    if (rf && rf !== 'all' && x.result !== rf) return false
    if (df && df !== 'all' && x.difficulty !== df) return false
    return true
  })
}

export const buildTeamGamesFilterCounts = (
  rows,
  { typeFilter, homeFilter, resultFilter, diffFilter }
) => {
  const byTypeBase = filterTeamGames(rows, {
    typeFilter: 'all',
    homeFilter,
    resultFilter,
    diffFilter,
  })

  const byHomeBase = filterTeamGames(rows, {
    typeFilter,
    homeFilter: 'all',
    resultFilter,
    diffFilter,
  })

  const byResultBase = filterTeamGames(rows, {
    typeFilter,
    homeFilter,
    resultFilter: 'all',
    diffFilter,
  })

  const byDiffBase = filterTeamGames(rows, {
    typeFilter,
    homeFilter,
    resultFilter,
    diffFilter: 'all',
  })

  const typeCounts = countBy(byTypeBase, (row) => row?.type)
  const resultCounts = countBy(byResultBase, (row) => row?.result)
  const diffCounts = countBy(byDiffBase, (row) => row?.difficulty)

  const homeCounts = {
    home: byHomeBase.filter((row) => row?.isHome).length,
    away: byHomeBase.filter((row) => !row?.isHome).length,
  }

  return {
    type: {
      all: byTypeBase.length,
      ...typeCounts,
    },
    home: {
      all: byHomeBase.length,
      ...homeCounts,
    },
    result: {
      all: byResultBase.length,
      ...resultCounts,
    },
    diff: {
      all: byDiffBase.length,
      ...diffCounts,
    },
  }
}
