// preview/previewDomainCard/domains/club/teams/logic/clubTeams.sort.logic.js

const safe = (v) => (v == null ? '' : String(v))
const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function compareText(a, b, dir = 'asc') {
  const av = safe(a).trim()
  const bv = safe(b).trim()
  const res = av.localeCompare(bv, 'he')
  return dir === 'asc' ? res : -res
}

function compareNumber(a, b, dir = 'desc') {
  const av = num(a)
  const bv = num(b)

  if (av == null && bv == null) return 0
  if (av == null) return 1
  if (bv == null) return -1

  return dir === 'asc' ? av - bv : bv - av
}

function compareBoolean(a, b, dir = 'desc') {
  const av = a === true ? 1 : 0
  const bv = b === true ? 1 : 0
  return dir === 'asc' ? av - bv : bv - av
}

export function sortClubTeams(rows = [], sortKey = 'teamYear', sortDir = 'desc') {
  const list = Array.isArray(rows) ? [...rows] : []

  return list.sort((a, b) => {
    switch (sortKey) {
      case 'teamName': {
        return compareText(a?.teamName, b?.teamName, sortDir)
      }

      case 'teamYear': {
        const byYear = compareNumber(a?.teamYear, b?.teamYear, sortDir)
        if (byYear !== 0) return byYear
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'playersCount': {
        const byPlayers = compareNumber(a?.playersCount, b?.playersCount, sortDir)
        if (byPlayers !== 0) return byPlayers
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'keyPlayersCount': {
        const byKey = compareNumber(a?.keyPlayersCount, b?.keyPlayersCount, sortDir)
        if (byKey !== 0) return byKey
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'projectPlayersCount': {
        const byProjectPlayers = compareNumber(a?.projectPlayersCount, b?.projectPlayersCount, sortDir)
        if (byProjectPlayers !== 0) return byProjectPlayers
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'active': {
        const byActive = compareBoolean(a?.active, b?.active, sortDir)
        if (byActive !== 0) return byActive
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'isProject': {
        const byProject = compareBoolean(a?.isProject, b?.isProject, sortDir)
        if (byProject !== 0) return byProject
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      default: {
        const byYear = compareNumber(a?.teamYear, b?.teamYear, 'desc')
        if (byYear !== 0) return byYear
        return compareText(a?.teamName, b?.teamName, 'asc')
      }
    }
  })
}
