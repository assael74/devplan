// teamProfile/sharedLogic/players/insightsLogic/common/insights.common.js

export const toNum = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const clean = (value) => {
  return value == null ? '' : String(value).trim()
}

export const safeArr = (value) => {
  return Array.isArray(value) ? value : []
}

export const pct = (part, total) => {
  const a = toNum(part)
  const b = toNum(total)

  if (!b) return 0

  return Math.round((a / b) * 100)
}

export const pctText = (part, total) => {
  return `${pct(part, total)}%`
}

export const formatPct = (value) => {
  const n = toNum(value)

  return `${Math.round(n)}%`
}

export const formatRange = (range = []) => {
  if (!Array.isArray(range) || range.length < 2) return '—'

  return `${range[0]}%–${range[1]}%`
}

export const formatCount = (value, total) => {
  return `${toNum(value)}/${toNum(total)}`
}

const squadRoleLabels = {
  key: 'שחקן מפתח',
  core: 'שחקן מרכזי',
  rotation: 'רוטציה',
  fringe: 'אחרון בסגל',
}

const getSquadRoleLabel = (row = {}) => {
  const role = clean(row.squadRole)

  return clean(squadRoleLabels[role])
}

const getPrimaryPositionLabel = (row = {}) => {
  return clean(
    row.primaryPositionLabel ||
    row.primaryPositionMeta?.label ||
    row.primaryPositionMeta?.labelH ||
    row.positionLabel ||
    row.generalPositionLabel
  )
}

export const getPlayerName = (row = {}) => {
  return (row.playerFullName || row.fullName || 'שחקן')
}

export const getStats = (row = {}) => {
  return row?.playerGamesStats || {}
}

export const getMinutesPct = (row = {}) => {
  return toNum(getStats(row).minutesPct)
}

export const getStartsPct = (row = {}) => {
  const stats = getStats(row)
  return pct(stats.startedGames, stats.squadGames)
}

export const getPlayedPct = (row = {}) => {
  const stats = getStats(row)
  return pct(stats.playerPlayedGames, stats.squadGames)
}

export const getInvolvement = (row = {}) => {
  const stats = getStats(row)

  return toNum(stats.involvement) || toNum(stats.goals) + toNum(stats.assists)
}

export const buildPlayerRef = (row = {}, extra = {}) => {
  const stats = getStats(row)

  return {
    id: row.playerId || row.id,
    playerId: row.playerId || row.id,
    label: getPlayerName(row),
    playerFullName: getPlayerName(row),
    photo: row.photo || '',

    squadRole: clean(row.squadRole),
    squadRoleLabel: getSquadRoleLabel(row),

    position: clean(row.generalPositionKey),
    positionLabel: clean(row.generalPositionLabel),
    positions: safeArr(row.positions),
    primaryPosition: clean(row.primaryPosition),

    projectId: clean(row.projectChipMeta?.id),
    projectLabel: clean(row.projectChipMeta?.labelH),

    minutesPct: getMinutesPct(row),
    startsPct: getStartsPct(row),
    playedPct: getPlayedPct(row),

    squadGames: toNum(stats.squadGames),
    playerPlayedGames: toNum(stats.playerPlayedGames),
    startedGames: toNum(stats.startedGames),
    teamPlayedGames: toNum(stats.teamPlayedGames),

    minutes: toNum(stats.minutes),
    goals: toNum(stats.goals),
    assists: toNum(stats.assists),
    involvement: getInvolvement(row),

    ...extra,
  }
}

export const sortPlayersByMinutes = (players = []) => {
  return [...players].sort((a, b) => {
    return toNum(b.minutesPct) - toNum(a.minutesPct)
  })
}

export const sortPlayersByInvolvement = (players = []) => {
  return [...players].sort((a, b) => {
    return toNum(b.involvement) - toNum(a.involvement)
  })
}

export const groupBy = (rows = [], getKey) => {
  const map = new Map()

  safeArr(rows).forEach((row) => {
    const key = clean(getKey(row)) || 'none'

    if (!map.has(key)) {
      map.set(key, [])
    }

    map.get(key).push(row)
  })

  return map
}
