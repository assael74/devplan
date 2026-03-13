// previewDomainCard/domains/player/games/components/drawer/editDrawer.utils.js

const safeId = (v) => (v == null ? '' : String(v))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const toArr = (v) => (Array.isArray(v) ? v : [])

export const buildInitialDraft = (row) => {
  const source = row?.game || row || {}
  const stats = row?.stats || row || {}

  return {
    gameId: safeId(source?.id || row?.id || row?.gameId),
    playerId: safeId(stats?.playerId || row?.playerId),
    goals: toNum(stats?.goals ?? row?.goals),
    assists: toNum(stats?.assists ?? row?.assists),
    timePlayed: toNum(stats?.timePlayed ?? row?.timePlayed),
    isSelected: stats?.isSelected === true || row?.isSelected === true,
    isStarting: stats?.isStarting === true || row?.isStarting === true,
    raw: source,
  }
}

export const getIsDirty = (draft, initial) =>
  draft.goals !== initial.goals ||
  draft.assists !== initial.assists ||
  draft.isSelected !== initial.isSelected ||
  draft.isStarting !== initial.isStarting ||
  draft.timePlayed !== initial.timePlayed

export const buildUpdateGamePlayersPatch = ({ game, draft }) => {
  const currentList = toArr(game?.gamePlayers)

  const nextItem = {
    playerId: safeId(draft?.playerId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    goals: toNum(draft?.goals),
    assists: toNum(draft?.assists),
    timePlayed: toNum(draft?.timePlayed),
  }

  const existsIndex = currentList.findIndex(
    (item) => safeId(item?.playerId) === safeId(draft?.playerId)
  )

  const nextGamePlayers =
    existsIndex >= 0
      ? currentList.map((item, index) => (index === existsIndex ? { ...item, ...nextItem } : item))
      : [...currentList, nextItem]

  return { gamePlayers: nextGamePlayers }
}

export const buildRemovePlayerFromGamePatch = ({ game, playerId }) => {
  const currentList = toArr(game?.gamePlayers)
  return {
    gamePlayers: currentList.filter(
      (item) => safeId(item?.playerId) !== safeId(playerId)
    ),
  }
}
