// clubProfile/sharedLogic/players/moduleLogic/clubPlayers.filters.js

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim().toLowerCase()

export const CLUB_PLAYERS_DEFAULT_FILTERS = {
  search: '',
  onlyActive: false,
  squadRole: '',
  projectStatus: '',
  positionCode: '',
  generalPositionKey: '',
  teamId: '',
}

export const filterClubPlayersRows = (rows, filters) => {
  const q = norm(filters?.search)
  const onlyActive = filters?.onlyActive === true
  const squadRole = safe(filters?.squadRole).trim()
  const projectStatus = safe(filters?.projectStatus).trim()
  const positionCode = safe(filters?.positionCode).trim()
  const generalPositionKey = safe(filters?.generalPositionKey).trim()
  const teamId = safe(filters?.teamId).trim()

  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (q) {
      const hay = safe(row?.searchText).toLowerCase()
      if (!hay.includes(q)) return false
    }

    if (onlyActive && !row?.active) return false
    if (squadRole && row?.squadRole !== squadRole) return false
    if (projectStatus && row?.projectStatus !== projectStatus) return false

    if (positionCode) {
      const positions = Array.isArray(row?.positions) ? row.positions : []
      if (!positions.includes(positionCode)) return false
    }

    if (generalPositionKey) {
      const rowGeneralKey = row?.generalPositionKey || row?.generalPosition?.layerKey || ''
      if (rowGeneralKey !== generalPositionKey) return false
    }

    if (teamId) {
      const rowTeamId = safe(row?.teamId || row?.teamName).trim()
      if (rowTeamId !== teamId) return false
    }

    return true
  })
}
