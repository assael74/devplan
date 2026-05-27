// src/shared/stats/engine/gameStats.refs.js

export function buildStatsGameRef({
  gameId,
  gameStatsDocId,
  teamId,
  gameDate,
  status,
}) {
  return {
    gameId,
    gameStatsDocId,
    teamId: teamId || '',
    status: status || 'partial',
    gameDate: gameDate || '',
  }
}

export function upsertStatsGameRef(refs = [], nextRef = {}) {
  const list = Array.isArray(refs) ? refs : []
  const idx = list.findIndex(ref => ref?.gameId === nextRef.gameId)

  if (idx < 0) return [...list, nextRef]

  return list.map((ref, i) => {
    return i === idx ? { ...ref, ...nextRef } : ref
  })
}

export function removeStatsGameRef(refs = [], gameId) {
  return (Array.isArray(refs) ? refs : []).filter(ref => {
    return ref?.gameId !== gameId
  })
}

export function hasStatsGameRef(refs = [], gameId) {
  return (Array.isArray(refs) ? refs : []).some(ref => {
    return ref?.gameId === gameId
  })
}
