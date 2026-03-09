// teamProfile/modules/players/teamPlayers.logic.js
const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim()

const pickId = (r) => (r && (r.playerId || (r.player && r.player.id) || r.id)) || null
const pickPlayer = (r) => (r && (r.player || r)) || {}

const pickPositions = (p, r) => {
  let v = null
  if (r && r.positions != null) v = r.positions
  else if (p && p.positions != null) v = p.positions

  if (Array.isArray(v)) return v.filter(Boolean)

  const s = norm(v)
  if (!s) return []
  return s.split(',').map(norm).filter(Boolean)
}

const pickType = (p, r) => norm((r && r.type) || (p && p.type)) || 'noneType'
const pickCandidate = (p, r) => norm((r && r.candidate) || (p && p.candidate)) || 'all'

const pickLevel = (p, r) => {
  let v = null
  if (r && r.level != null) v = r.level
  else if (p && p.level != null) v = p.level
  else if (r && r.rating != null) v = r.rating
  else if (p && p.rating != null) v = p.rating

  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const pickBirthDay = (p, r) =>
  norm(
    (r && r.birthDay) ||
      (p && p.birthDay) ||
      (p && p.birth) ||
      (r && r.birth) ||
      (p && p.playerBirth) ||
      (r && r.playerBirth)
  ) || ''

const countList = (v) => {
  if (Array.isArray(v)) return v.length
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v && typeof v === 'object') return Object.keys(v).length
  return 0
}

const buildMetaCounts = (p, r, level) => {
  const games = countList((r && r.games) || (p && p.games))
  const meetings = countList((r && r.meetings) || (p && p.meetings))
  const payments = countList((r && r.payments) || (p && p.payments))
  const abilities = countList((r && r.abilities) || (p && p.abilities))

  const lvl = Number(level) || 0
  const hasUsage = (games + meetings + payments + abilities) > 0 || lvl > 0

  return { games, meetings, payments, abilities, level: lvl, hasUsage }
}

export const normalizeTeamPlayerRow = (raw) => {
  const r = raw || {}
  const p = pickPlayer(r)
  const id = pickId(r)

  const level = pickLevel(p, r)
  const metaCounts = buildMetaCounts(p, r, level)

  return {
    id,
    isKey: r.isKey,
    playerId: id,
    fullName: [p.playerFirstName, p.playerLastName].filter(Boolean).join(' ') || '—',
    photo: p.photo || null,
    positions: pickPositions(p, r),
    active: r.active != null ? r.active : p.active != null ? p.active : true,
    type: pickType(p, r),
    candidate: pickCandidate(p, r),
    level,
    birthDay: pickBirthDay(p, r),
    metaCounts,
    raw: r,
    player: p,
  }
}

export const resolveTeamPlayers = (team) => {
  const base = team && Array.isArray(team.players) ? team.players : []

  const rows = base.map(normalizeTeamPlayerRow).filter((x) => !!x.id)

  const summary = {
    total: rows.length,
    active: rows.filter((x) => x.active).length,
    nonActive: rows.filter((x) => !x.active).length,
  }

  return { rows, summary }
}
