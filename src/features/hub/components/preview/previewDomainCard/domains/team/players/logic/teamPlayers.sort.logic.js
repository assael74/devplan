// preview/previewDomainCard/domains/team/players/logic/teamPlayers.sort.logic.js

const safe = (v) => (v == null ? '' : String(v)).trim().toLowerCase()

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const getPlayerName = (row) =>
  safe(
    row?.fullName ||
    row?.playerName ||
    row?.name ||
    `${row?.playerFirstName || ''} ${row?.playerLastName || ''}`
  )

export const getPlayerPotential = (row) =>
  num(
    row?.levelPotential ??
    row?.potential ??
    row?.playerPotential
  )

export const getPlayerPosition = (row) =>
  safe(
    row?.generalPosition?.layerLabel ||
    row?.generalPosition?.label ||
    row?.positionLabel ||
    row?.position ||
    row?.mainPosition
  )

export const getPlayerMinutesPct = (row) =>
  num(
    row?.minutesPct ??
    row?.timePlayedPct ??
    row?.percentMinutes ??
    row?.minutesPercent
  )

export const sortPlayers = (rows = [], sortKey = 'minutesPct', sortDir = 'desc') => {
  const list = [...rows]

  list.sort((a, b) => {
    let av = ''
    let bv = ''

    if (sortKey === 'name') {
      av = getPlayerName(a)
      bv = getPlayerName(b)
    } else if (sortKey === 'potential') {
      av = getPlayerPotential(a)
      bv = getPlayerPotential(b)
    } else if (sortKey === 'position') {
      av = getPlayerPosition(a)
      bv = getPlayerPosition(b)
    } else if (sortKey === 'minutesPct') {
      av = getPlayerMinutesPct(a)
      bv = getPlayerMinutesPct(b)
    }

    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av
    }

    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv), 'he')
      : String(bv).localeCompare(String(av), 'he')
  })

  return list
}
