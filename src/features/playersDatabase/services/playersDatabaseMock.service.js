import {
  playersDatabaseKpis,
  playersDatabaseRows,
  playersDatabaseSelectedPlayer,
} from '../seed/playersDatabaseMockData.js'

const normalize = (value) => String(value ?? '').trim().toLowerCase()

const matchesSearch = (player, search) => {
  const q = normalize(search)
  if (!q) return true

  return [
    player.fullName,
    player.normalizedName,
    player.externalPlayerId,
    player.clubName,
    player.teamName,
    player.leagueName,
  ].some((value) => normalize(value).includes(q))
}

const matchesExact = (value, filterValue) => {
  if (!filterValue) return true
  return String(value ?? '') === String(filterValue)
}

const applyFilters = (rows, filters = {}) =>
  rows.filter((player) => (
    matchesSearch(player, filters.search) &&
    matchesExact(player.birthYear, filters.birthYear) &&
    matchesExact(player.clubName, filters.clubId) &&
    matchesExact(player.leagueName, filters.leagueId) &&
    matchesExact(player.trendStatus, filters.trendStatus) &&
    matchesExact(player.trackingStatus, filters.trackingStatus)
  ))

const uniqueOptions = (rows, field, labelField = field) => {
  const seen = new Set()

  return rows.reduce((acc, row) => {
    const value = row?.[field]
    if (value === undefined || value === null || value === '' || seen.has(String(value))) return acc

    seen.add(String(value))
    acc.push({
      value: String(value),
      label: String(row?.[labelField] ?? value),
    })
    return acc
  }, [])
}

export async function getPlayersDatabaseMockKpis() {
  return playersDatabaseKpis
}

export async function getPlayersDatabaseMockFilterOptions() {
  return {
    birthYear: uniqueOptions(playersDatabaseRows, 'birthYear'),
    clubId: uniqueOptions(playersDatabaseRows, 'clubName'),
    leagueId: uniqueOptions(playersDatabaseRows, 'leagueName'),
    trendStatus: uniqueOptions(playersDatabaseRows, 'trendStatus', 'trendLabel'),
    trackingStatus: uniqueOptions(playersDatabaseRows, 'trackingStatus', 'trackingLabel'),
  }
}

export async function listPlayersDatabaseMockPlayers({
  filters = {},
  pageSize = 50,
  cursor = 0,
} = {}) {
  const safeCursor = Math.max(0, Number(cursor) || 0)
  const safePageSize = Math.max(1, Number(pageSize) || 50)
  const filteredRows = applyFilters(playersDatabaseRows, filters)
  const rows = filteredRows.slice(safeCursor, safeCursor + safePageSize)
  const nextCursor = safeCursor + rows.length
  const hasMore = nextCursor < filteredRows.length

  return {
    rows,
    nextCursor: hasMore ? nextCursor : null,
    hasMore,
    totalApprox: filteredRows.length,
  }
}

export async function getPlayersDatabaseMockPlayerDetails(playerId) {
  const row = playersDatabaseRows.find((player) => player.id === playerId)

  if (!row) return null
  if (row.id === playersDatabaseSelectedPlayer.id) return playersDatabaseSelectedPlayer

  return {
    ...row,
    snapshots: [],
  }
}
