// src/features/squadSimulator/ui/simulatorUi.utils.js

import {
  BENCH_SLOT_COUNT,
  DEFAULT_SIMULATOR_STATE,
  FORMATION_OPTIONS,
  ROLE_OPTIONS,
} from './simulatorUi.constants.js'

export const createDraftPlayer = (overrides = {}) => ({
  id: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  fullName: '',
  photo: '',
  sourcePlayerId: '',
  squadRole: '',
  confidenceLevel: '',
  primaryPosition: 'S',
  ...overrides,
})

const pickPlayerName = player => {
  return (
    player?.playerFullName ||
    player?.fullName ||
    player?.displayName ||
    player?.name ||
    [player?.firstName, player?.lastName].filter(Boolean).join(' ') ||
    ''
  ).trim()
}

const pickPlayerPosition = player => {
  if (player?.primaryPosition) return player.primaryPosition
  if (player?.position) return player.position
  if (Array.isArray(player?.positions)) return player.positions[0] || ''
  return ''
}

const pickPlayerSquadRole = player => {
  const roleId = String(
    player?.squadRole ||
    player?.role ||
    player?.playerRole ||
    player?.squadStatus ||
    ''
  ).trim()

  if (!roleId) return ''

  return ROLE_OPTIONS.some(option => option.value === roleId || option.id === roleId)
    ? roleId
    : ''
}

export const createPlayerBankFromTeamPlayers = players => {
  return (Array.isArray(players) ? players : [])
    .map(player => createDraftPlayer({
      id: `team-player-${player?.id || player?.playerId || Date.now()}-${Math.random().toString(16).slice(2)}`,
      sourcePlayerId: player?.id || player?.playerId || '',
      fullName: pickPlayerName(player),
      photo: player?.photo || '',
      squadRole: pickPlayerSquadRole(player),
      confidenceLevel: '',
      primaryPosition: pickPlayerPosition(player) || 'S',
    }))
    .filter(player => player.fullName)
}

export const createInitialPlayerBank = () => [
  createDraftPlayer({
    fullName: '',
    squadRole: '',
    confidenceLevel: '',
    primaryPosition: 'GK',
  }),
  createDraftPlayer({
    fullName: '',
    squadRole: '',
    confidenceLevel: '',
    primaryPosition: 'GK',
  }),
]

const resolveFormation = formationId => {
  return FORMATION_OPTIONS.find(option => option.value === formationId)
    || FORMATION_OPTIONS.find(option => option.value === DEFAULT_SIMULATOR_STATE.formation)
    || FORMATION_OPTIONS[0]
}

export const createFormationRows = formationId => {
  const formation = resolveFormation(formationId)
  const lineupRows = formation.slots.map((slot, index) => ({
    id: `lineup-${index + 1}`,
    rowType: 'lineup',
    slotNumber: index + 1,
    slotId: slot.slotId,
    slotLabel: slot.label,
    selectedPlayerId: '',
    fullName: '',
    squadRole: '',
    confidenceLevel: '',
    primaryPosition: slot.primaryPosition,
  }))

  const benchRows = Array.from({ length: BENCH_SLOT_COUNT }, (_, index) => ({
    id: `bench-${index + 1}`,
    rowType: 'bench',
    slotNumber: formation.slots.length + index + 1,
    slotId: 'SUB',
    slotLabel: 'מחליף',
    selectedPlayerId: '',
    fullName: '',
    squadRole: '',
    confidenceLevel: '',
    primaryPosition: '',
  }))

  return [...lineupRows, ...benchRows]
}

export const createInitialPlayers = createInitialPlayerBank

export const getStatusColor = status => {
  if (status === 'warning') return 'warning'
  if (status === 'above') return 'danger'
  if (status === 'below') return 'warning'
  if (status === 'ok' || status === 'inRange') return 'success'
  return 'neutral'
}

export const getGapActionText = (totals = {}) => {
  const gap = Number(totals.gap || 0)

  if (gap < 0) return `חסרים ${Math.abs(gap)} שערים לחלוקת היעד`
  if (gap > 0) return `עודף של ${gap} שערים מול יעד הקבוצה`
  if (totals.teamGoalsTarget) return 'חלוקת השערים תואמת את יעד הקבוצה'

  return 'צריך לבחור יעד קבוצה כדי לחשב פער'
}

export const getMinutesBucketLabel = minutes => {
  const n = Number(minutes || 0)

  if (n >= 2000) return '+2000'
  if (n >= 1500) return '+1500'
  if (n >= 1000) return '+1000'
  if (n >= 500) return '+500'
  if (n > 0) return 'עד 500'

  return '0'
}

export const formatNumber = value => {
  const n = Number(value || 0)
  return Number.isFinite(n) ? n.toLocaleString('he-IL') : '0'
}

export const getBenchmarkCountStatus = ({ actual, benchmark } = {}) => {
  const n = Number(actual || 0)
  const green = benchmark?.greenRange || []
  const orangeHigh = benchmark?.orangeHighRange || []
  const orangeLow = benchmark?.orangeLowRange || []
  const redHighMin = Number(benchmark?.redHighMin)
  const redLowMax = Number(benchmark?.redLowMax)

  if (green.length === 2 && n >= green[0] && n <= green[1]) return 'ok'
  if (orangeHigh.length === 2 && n >= orangeHigh[0] && n <= orangeHigh[1]) return 'warning'
  if (orangeLow.length === 2 && n >= orangeLow[0] && n <= orangeLow[1]) return 'warning'
  if (Number.isFinite(redHighMin) && n >= redHighMin) return 'above'
  if (Number.isFinite(redLowMax) && n <= redLowMax) return 'below'

  return n >= Number(benchmark?.target || 0) ? 'ok' : 'below'
}
