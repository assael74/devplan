// preview/previewDomainCard/domains/team/players/logic/teamPlayers.domain.logic.js

import { DOMAIN_STATE, getDomainState } from '../../../../../preview.state'

const POSITION_CHIPS_ORDER = ['שוער', 'הגנה', 'קישור', 'התקפה', 'לא עודכן', 'ללא עמדה']

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const norm = (s) => safe(s).trim().toLowerCase()
const hasText = (v) => safe(v).trim().length > 0
const num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : Number(v) || 0)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const pickPlayerName = (p) => {
  const fn = p?.playerFirstName || p?.firstName || ''
  const ln = p?.playerLastName || p?.lastName || ''
  const full = `${safe(fn)} ${safe(ln)}`.trim()
  return full || p?.fullName || safe(p?.id)
}

const pickId = (p) => safe(p?.id || p?.playerId)

const pickKeyIds = (team) => {
  const kp = asArr(team?.keyPlayers)
  return new Set(kp.map((x) => safe(x?.id || x?.playerId)).filter(Boolean))
}

const pickPotentialBand = (value) => {
  const v = num(value)
  if (v >= 4) return { key: 'high', label: 'גבוה', color: 'success' }
  if (v >= 3) return { key: 'mid', label: 'בינוני', color: 'warning' }
  return { key: 'low', label: 'נמוך', color: 'neutral' }
}

const getProjectStatus = (player) => {
  if (player?.type !== 'project') return 'none'
  return player?.projectStatus || 'approved'
}

const getPositionLabel = (player) => safe(player?.generalPosition?.layerLabel).trim() || 'ללא עמדה'

const buildTimeRef = (player, team) => {
  const timePlayed = num(player?.playerFullStats?.timePlayed)
  const totalTeamGameTime = num(team?.teamFullStats?.totalGameTime)

  const playTimeRate =
    totalTeamGameTime > 0
      ? clamp(Math.round((timePlayed / totalTeamGameTime) * 100), 0, 100)
      : 0

  return {
    timePlayed,
    totalTeamGameTime,
    playTimeRate,
  }
}

export function resolveTeamPlayersDomain(entity, filters = {}) {
  const team = entity || null
  const list = asArr(team?.players)

  const state =
    team == null
      ? DOMAIN_STATE.PARTIAL
      : getDomainState({ count: list.length, isLocked: false, isStale: false })

  const f = {
    q: hasText(filters.q) ? safe(filters.q) : '',
    onlyKey: filters.onlyKey === true || filters.onlyKey === 'true',
    minutesBelow:
      filters?.minutesBelow === '' || filters?.minutesBelow == null
        ? 100
        : clamp(num(filters.minutesBelow), 0, 100),
  }

  const qn = norm(f.q)
  const keySet = pickKeyIds(team)

  const rowsAll = list
    .map((player) => {
      const id = pickId(player)
      if (!id) return null

      const levelPotential = num(player?.levelPotential)
      const level = num(player?.level)
      const timeRef = buildTimeRef(player, team)
      const timeRateNum = timeRef.playTimeRate

      const isKey = player?.isKey === true || keySet.has(id)
      const potentialBand = pickPotentialBand(levelPotential)
      const projectStatus = getProjectStatus(player)
      const position = getPositionLabel(player)
      const active = player?.active === true

      return {
        id,
        player,
        name: pickPlayerName(player),
        isKey,
        levelPotential,
        level,
        potentialBand,
        projectStatus,
        position,
        timeRef,
        active,
        timeRateNum,
        minutesPct: timeRateNum,
        timePlayedPct: timeRateNum,
        timeRate: `${timeRateNum}%`,
        isBelowMinutes: timeRateNum < f.minutesBelow,
      }
    })
    .filter(Boolean)

  const rows = rowsAll
    .filter((r) => (!qn ? true : norm(r.name).includes(qn)))
    .filter((r) => (f.onlyKey ? r.isKey === true : true))
    .filter((r) => r.timeRateNum < f.minutesBelow)
    .sort((a, b) => {
      if (a.isKey !== b.isKey) return a.isKey ? -1 : 1
      if (b.levelPotential !== a.levelPotential) return b.levelPotential - a.levelPotential
      if (b.level !== a.level) return b.level - a.level
      return b.timeRateNum - a.timeRateNum
    })

  const playersCount = rowsAll.length
  const keyCount = rowsAll.filter((r) => r.isKey).length
  const regularCount = Math.max(0, playersCount - keyCount)

  const avgPotential = playersCount
    ? Math.round((rowsAll.reduce((sum, r) => sum + num(r.levelPotential), 0) / playersCount) * 10) / 10
    : 0

  const avgLevel = playersCount
    ? Math.round((rowsAll.reduce((sum, r) => sum + num(r.level), 0) / playersCount) * 10) / 10
    : 0

  const withMinutesCount = rowsAll.filter((r) => r.timeRef.timePlayed > 0).length
  const belowMinutesCount = rowsAll.filter((r) => r.timeRateNum < f.minutesBelow).length

  const positionsMap = rowsAll.reduce((acc, row) => {
    const key = row.position || 'ללא עמדה'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const positionsSummary = POSITION_CHIPS_ORDER
    .map((label) => ({
      label,
      count: positionsMap[label] || 0,
    }))
    .filter((item) => item.count > 0)

  return {
    state,
    filters: f,
    options: {},
    summary: {
      playersCount,
      keyCount,
      regularCount,
      avgPotential,
      avgLevel,
      withMinutesCount,
      belowMinutesCount,
      minutesBelowThreshold: f.minutesBelow,
      filteredCount: rows.length,
      positionsSummary,
    },
    rows,
  }
}
