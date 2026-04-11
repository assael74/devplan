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

export function sortClubPlayers(rows = [], sortKey = 'level', sortDir = 'desc') {
  const list = Array.isArray(rows) ? [...rows] : []

  return list.sort((a, b) => {
    switch (sortKey) {
      case 'name':
      case 'fullName': {
        const byName = compareText(a?.fullName, b?.fullName, sortDir)
        if (byName !== 0) return byName
        return compareText(a?.teamName, b?.teamName, 'asc')
      }

      case 'teamName':
      case 'team': {
        const byTeam = compareText(a?.teamName, b?.teamName, sortDir)
        if (byTeam !== 0) return byTeam
        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      case 'level': {
        const byLevel = compareNumber(a?.level, b?.level, sortDir)
        if (byLevel !== 0) return byLevel
        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      case 'position':
      case 'generalPositionLabel': {
        const byPosition = compareText(
          a?.generalPositionLabel,
          b?.generalPositionLabel,
          sortDir
        )
        if (byPosition !== 0) return byPosition
        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      case 'minutesPct':
      case 'timePlayed':
      case 'timeRef': {
        const byMinutes = compareNumber(
          a?.playerFullStats?.playTimeRate,
          b?.playerFullStats?.playTimeRate,
          sortDir
        )
        if (byMinutes !== 0) return byMinutes
        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      case 'squadRole':
      case 'role': {
        const byRoleWeight = compareNumber(
          a?.squadRoleMeta?.weight,
          b?.squadRoleMeta?.weight,
          sortDir
        )
        if (byRoleWeight !== 0) return byRoleWeight

        const byRoleLabel = compareText(
          a?.squadRoleMeta?.label,
          b?.squadRoleMeta?.label,
          'asc'
        )
        if (byRoleLabel !== 0) return byRoleLabel

        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      case 'isKey': {
        const byKey = compareBoolean(a?.isKey, b?.isKey, sortDir)
        if (byKey !== 0) return byKey
        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      case 'active': {
        const byActive = compareBoolean(a?.active, b?.active, sortDir)
        if (byActive !== 0) return byActive
        return compareText(a?.fullName, b?.fullName, 'asc')
      }

      default: {
        const byLevel = compareNumber(a?.level, b?.level, 'desc')
        if (byLevel !== 0) return byLevel

        const byMinutes = compareNumber(
          a?.playerFullStats?.playTimeRate,
          b?.playerFullStats?.playTimeRate,
          'desc'
        )
        if (byMinutes !== 0) return byMinutes

        return compareText(a?.fullName, b?.fullName, 'asc')
      }
    }
  })
}
