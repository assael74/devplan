// teamProfile/sharedLogic/players/moduleLogic/teamPlayers.filters.js

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim().toLowerCase()

const getPerformanceProfileId = row => {
  return (
    row?.performance?.profileId ||
    row?.performance?.insightId ||
    row?.performance?.profile?.id ||
    ''
  )
}

const hasPlayerTargets = row => {
  return row?.targets?.hasTargets === true &&
    Array.isArray(row?.targets?.mainItems) &&
    row.targets.mainItems.length > 0
}

const getSeasonPlanStatusValue = row => {
  return String(
    row?.seasonPlanStatus ||
    row?.player?.seasonPlanStatus ||
    row?.raw?.seasonPlanStatus ||
    row?.raw?.player?.seasonPlanStatus ||
    ''
  ).trim()
}

export const filterTeamPlayersRows = (rows, filters) => {
  const q = norm(filters?.search)
  const onlyActive = filters?.onlyActive === true
  const onlyWithTargets = filters?.onlyWithTargets === true
  const squadRole = safe(filters?.squadRole).trim()
  const seasonPlanStatus = safe(filters?.seasonPlanStatus).trim()
  const projectStatus = safe(filters?.projectStatus).trim()
  const positionCode = safe(filters?.positionCode).trim()
  const generalPositionKey = safe(filters?.generalPositionKey).trim()
  const performanceProfile = safe(filters?.performanceProfile).trim()

  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (q) {
      const hay = safe(row?.searchText).toLowerCase()
      if (!hay.includes(q)) return false
    }

    if (onlyActive && !row?.active) return false
    if (onlyWithTargets && !hasPlayerTargets(row)) return false

    if (squadRole && row?.squadRole !== squadRole) return false
    if (seasonPlanStatus && getSeasonPlanStatusValue(row) !== seasonPlanStatus) return false
    if (projectStatus && row?.projectStatus !== projectStatus) return false

    if (performanceProfile && getPerformanceProfileId(row) !== performanceProfile) {
      return false
    }

    if (positionCode) {
      const positions = Array.isArray(row?.positions) ? row.positions : []
      if (!positions.includes(positionCode)) return false
    }

    if (generalPositionKey) {
      const rowGeneralKey = row?.generalPositionKey || row?.generalPosition?.layerKey || ''
      if (rowGeneralKey !== generalPositionKey) return false
    }

    return true
  })
}
