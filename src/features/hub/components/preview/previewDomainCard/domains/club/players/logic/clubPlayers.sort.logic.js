// preview/previewDomainCard/domains/club/players/logic/clubPlayers.sort.logic.js

const safe = (v) => (v == null ? '' : String(v))

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function compareText(a, b, dir = 'asc') {
  const av = safe(a).trim()
  const bv = safe(b).trim()
  const result = av.localeCompare(bv, 'he')
  return dir === 'asc' ? result : -result
}

function compareNumber(a, b, dir = 'desc') {
  const av = toNum(a)
  const bv = toNum(b)

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

export function sortClubPlayers(rows = [], sortKey = 'potential', sortDir = 'desc') {
  const list = Array.isArray(rows) ? [...rows] : []

  return list.sort((a, b) => {
    switch (sortKey) {
      case 'name': {
        const byName = compareText(a?.name, b?.name, sortDir)
        if (byName !== 0) return byName
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'teamName':
      case 'team': {
        const byTeam = compareText(a?.teamName, b?.teamName, sortDir)
        if (byTeam !== 0) return byTeam
        return compareText(a?.name, b?.name, 'asc')
      }

      case 'potential':
      case 'levelPotential': {
        const byPotential = compareNumber(a?.levelPotential, b?.levelPotential, sortDir)
        if (byPotential !== 0) return byPotential

        const byLevel = compareNumber(a?.level, b?.level, 'desc')
        if (byLevel !== 0) return byLevel

        return compareText(a?.name, b?.name, 'asc')
      }

      case 'level': {
        const byLevel = compareNumber(a?.level, b?.level, sortDir)
        if (byLevel !== 0) return byLevel

        const byPotential = compareNumber(a?.levelPotential, b?.levelPotential, 'desc')
        if (byPotential !== 0) return byPotential

        return compareText(a?.name, b?.name, 'asc')
      }

      case 'timeRef':
      case 'minutesPct':
      case 'timePlayed': {
        const byTime = compareNumber(a?.timeRef, b?.timeRef, sortDir)
        if (byTime !== 0) return byTime

        const byPotential = compareNumber(a?.levelPotential, b?.levelPotential, 'desc')
        if (byPotential !== 0) return byPotential

        return compareText(a?.name, b?.name, 'asc')
      }

      case 'isKey': {
        const byKey = compareBoolean(a?.isKey, b?.isKey, sortDir)
        if (byKey !== 0) return byKey

        const byPotential = compareNumber(a?.levelPotential, b?.levelPotential, 'desc')
        if (byPotential !== 0) return byPotential

        return compareText(a?.name, b?.name, 'asc')
      }

      case 'isAutoEligible': {
        const byAuto = compareBoolean(a?.isAutoEligible, b?.isAutoEligible, sortDir)
        if (byAuto !== 0) return byAuto

        const byPotential = compareNumber(a?.levelPotential, b?.levelPotential, 'desc')
        if (byPotential !== 0) return byPotential

        return compareText(a?.name, b?.name, 'asc')
      }

      default: {
        if (a?.isKey !== b?.isKey) return a?.isKey ? -1 : 1

        const byPotential = compareNumber(a?.levelPotential, b?.levelPotential, 'desc')
        if (byPotential !== 0) return byPotential

        const byLevel = compareNumber(a?.level, b?.level, 'desc')
        if (byLevel !== 0) return byLevel

        const byTime = compareNumber(a?.timeRef, b?.timeRef, 'desc')
        if (byTime !== 0) return byTime

        return compareText(a?.name, b?.name, 'asc')
      }
    }
  })
}
