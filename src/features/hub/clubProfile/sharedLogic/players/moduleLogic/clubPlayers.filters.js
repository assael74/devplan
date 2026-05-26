// clubProfile/sharedLogic/players/moduleLogic/clubPlayers.filters.js

const safe = value => {
  return value == null ? '' : String(value)
}

const norm = value => {
  return safe(value).trim().toLowerCase()
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
}

export const CLUB_PLAYERS_DEFAULT_FILTERS = {
  search: '',
  onlyActive: false,
  squadRole: '',
  projectStatus: '',
  positionCode: '',
  generalPositionKey: '',
  teamId: '',

  efficiency: '',
  impact: '',
  profileInsight: '',
}

const getPlayerId = row => {
  return safe(row?.playerId || row?.id).trim()
}

const getPerformance = ({ row, performanceById }) => {
  const playerId = getPlayerId(row)

  return (
    performanceById?.[playerId] ||
    row?.performance ||
    null
  )
}

const getSummary = performance => {
  return performance?.summary || performance?.scoring?.summary || {}
}

const getInsight = performance => {
  return (
    performance?.insightProfile ||
    performance?.playerInsight ||
    performance?.profile ||
    null
  )
}

const getInsightId = performance => {
  const insight = getInsight(performance)

  return safe(
    insight?.insightId ||
      insight?.profileId ||
      insight?.profile?.id ||
      insight?.id ||
      performance?.insightId ||
      performance?.profileId ||
      ''
  ).trim()
}

const getEfficiency = ({ row, performanceById }) => {
  const summary = getSummary(
    getPerformance({
      row,
      performanceById,
    })
  )

  return toNumber(
    summary?.ratingRaw ??
      summary?.rating ??
      summary?.avgRating,
    null
  )
}

const getImpact = ({ row, performanceById }) => {
  const summary = getSummary(
    getPerformance({
      row,
      performanceById,
    })
  )

  return toNumber(
    summary?.tva ??
      summary?.cumulativeImpact ??
      summary?.totalImpact,
    null
  )
}

const passEfficiencyFilter = ({ row, filters, performanceById }) => {
  const mode = safe(filters?.efficiency).trim()

  if (!mode) return true

  const value = getEfficiency({
    row,
    performanceById,
  })

  if (value == null) return false

  if (mode === 'above6') return value >= 6
  if (mode === 'below6') return value < 6

  return true
}

const passImpactFilter = ({ row, filters, performanceById }) => {
  const mode = safe(filters?.impact).trim()

  if (!mode) return true

  const value = getImpact({
    row,
    performanceById,
  })

  if (value == null) return false

  if (mode === 'positive') return value > 0
  if (mode === 'negative') return value < 0

  return true
}

const passProfileInsightFilter = ({ row, filters, performanceById }) => {
  const profileInsight = safe(filters?.profileInsight).trim()

  if (!profileInsight) return true

  const performance = getPerformance({
    row,
    performanceById,
  })

  return getInsightId(performance) === profileInsight
}

export const filterClubPlayersRows = (
  rows,
  filters,
  options = {}
) => {
  const q = norm(filters?.search)
  const onlyActive = filters?.onlyActive === true
  const squadRole = safe(filters?.squadRole).trim()
  const projectStatus = safe(filters?.projectStatus).trim()
  const positionCode = safe(filters?.positionCode).trim()
  const generalPositionKey = safe(filters?.generalPositionKey).trim()
  const teamId = safe(filters?.teamId).trim()

  const performanceById = options?.performanceById || {}

  return (Array.isArray(rows) ? rows : []).filter(row => {
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

    if (!passEfficiencyFilter({ row, filters, performanceById })) return false
    if (!passImpactFilter({ row, filters, performanceById })) return false
    if (!passProfileInsightFilter({ row, filters, performanceById })) return false

    return true
  })
}
