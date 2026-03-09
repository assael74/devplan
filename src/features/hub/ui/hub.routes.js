// src/features/hub/ui/hub.routes.js
export function buildRoutesByType(selection) {
  const t = selection?.type
  const d = selection?.data || {}
  const id = d?.id || null
  if (!t || !id) return {}

  if (t === 'player') {
    return {
      full: `/players/${id}`,
      info: `/players/${id}/info`,
      payments: `/players/${id}/payments`,
      meetings: `/players/${id}/meetings`,
      performance: `/players/${id}/performance`,
      abilities: `/players/${id}/abilities`,
      video: `/players/${id}/video`,
    }
  }

  if (t === 'club') {
    return {
      full: `/clubs/${id}`,
      info: `/clubs/${id}/info`,
      teams: `/clubs/${id}/teams`,
      players: `/clubs/${id}/players`,
      staff: `/clubs/${id}/staff`,
      video: `/clubs/${id}/video`,
    }
  }

  if (t === 'team') {
    return {
      full: `/teams/${id}`,
      info: `/teams/${id}/info`,
      roles: `/teams/${id}/roles`,
      players: `/teams/${id}/players`,
      games: `/teams/${id}/games`,
      performance: `/teams/${id}/performance`,
      abilities: `/teams/${id}/abilities`,
      video: `/teams/${id}/video`,
    }
  }

  return {}
}

export function buildCountsByType(selection) {
  const t = selection?.type
  const d = selection?.data || {}

  if (t === 'club') return { club: { players: Number(d?.playersCount || 0), info: 1 } }
  if (t === 'team') return { team: { players: Number(d?.playersCount || 0), info: 1 } }
  if (t === 'player') return { player: { info: 1 } }
  return {}
}
