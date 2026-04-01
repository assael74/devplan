// clubProfile/modules/players/logic/clubPlayers.filters.js

// clubProfile/modules/players/logic/clubPlayers.filters.js

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim().toLowerCase()

export const CLUB_PLAYERS_DEFAULT_FILTERS = {
  search: '',
  onlyActive: false,
  onlyKey: false,
  onlyProject: false,
  positionLayer: '',
}

export function applyClubPlayersFilters(rows, filters = CLUB_PLAYERS_DEFAULT_FILTERS) {
  let next = Array.isArray(rows) ? [...rows] : []

  const q = norm(filters?.search)
  if (q) {
    next = next.filter((row) => norm(row?.searchText).includes(q))
  }

  if (filters?.onlyActive) {
    next = next.filter((row) => row?.active === true)
  }

  if (filters?.onlyKey) {
    next = next.filter((row) => row?.squadRole === 'key')
  }

  if (filters?.onlyProject) {
    next = next.filter((row) => row?.isProject === true)
  }

  if (filters?.positionLayer) {
    next = next.filter((row) => row?.generalPositionKey === filters.positionLayer)
  }

  return next
}
