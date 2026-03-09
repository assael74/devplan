// src/features/hub/domain/players.enrich.js
import { normalizeStr } from '../helpers/string'

const getBirthYear = (p) => {
  const b = String(p?.birth || '')
  const m = b.match(/(\d{4})$/)
  if (m) return Number(m[1])
  const ty = p?.team?.teamYear
  return ty ? Number(ty) : null
}

const getFullName = (p) => {
  const fn = String(p?.playerFirstName || '').trim()
  const ln = String(p?.playerLastName || '').trim()
  const full = `${fn} ${ln}`.trim()
  return full || String(p?.playerShortName || '').trim() || 'ללא שם'
}

const getPositionsLabel = (p) => {
  const arr = Array.isArray(p?.positions) ? p.positions : []
  if (!arr.length) return ''
  const top = arr.slice(0, 2).join(', ')
  return arr.length > 2 ? `${top}…` : top
}

const resolveClubName = (p) => String(p?.club?.clubName || p?.club?.name || p?.clubName || '').trim()
const resolveTeamName = (p) => String(p?.team?.teamName || p?.team?.name || p?.teamName || '').trim()

const buildPlayerSearchText = (p, ui) => {
  const parts = [
    ui.fullName,
    p?.playerShortName,
    ui.teamName,
    ui.clubName,
    ui.birthYear,
    ...(Array.isArray(p?.positions) ? p.positions : []),
    p?.type,
    p?.projectStatus,
  ]
  return normalizeStr(parts.filter(Boolean).join(' '))
}

export function enrichPlayersForUi(players) {
  return (players || []).map((p) => {
    const ui = {
      id: p?.id,
      fullName: getFullName(p),
      birthYear: getBirthYear(p),
      positionsLabel: getPositionsLabel(p),

      clubName: resolveClubName(p) || 'ללא מועדון',
      teamName: resolveTeamName(p) || 'ללא קבוצה',

      clubPhoto: p?.club?.photo || '',
      teamPhoto: p?.team?.photo || '',
      clubColor: p?.club?.color || null,
      teamColor: p?.team?.color || null,

      photoUrl: p?.photo || '',
      photo: p?.photo || '',
      type: p?.type || '',
      meetings: Array.isArray(p?.meetings) ? p.meetings : [],
    }

    return { ...p, ui, _searchText: buildPlayerSearchText(p, ui) }
  })
}
