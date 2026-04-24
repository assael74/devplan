// features/hub/clubProfile/sharedLogic/teams/moduleLogic/clubTeams.filters.js

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim().toLowerCase()

export const CLUB_TEAMS_DEFAULT_FILTERS = {
  search: '',
  onlyActive: false,
  onlyProject: false,
}

export function applyClubTeamsFilters(rows, filters = CLUB_TEAMS_DEFAULT_FILTERS) {
  let next = Array.isArray(rows) ? [...rows] : []

  const q = norm(filters?.search)
  if (q) {
    next = next.filter((row) => norm(row?.searchText).includes(q))
  }

  if (filters?.onlyActive) {
    next = next.filter((row) => row?.active === true)
  }

  if (filters?.onlyProject) {
    next = next.filter((row) => row?.isProject === true)
  }

  return next
}
