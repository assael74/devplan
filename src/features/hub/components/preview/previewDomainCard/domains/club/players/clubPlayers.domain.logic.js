// preview/PreviewDomainCard/domains/club/teams/clubTeams.domain.logic.js
import { DOMAIN_STATE, getDomainState } from '../../../../preview.state'

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const norm = (s) => safe(s).trim().toLowerCase()
const hasText = (v) => safe(v).trim().length > 0

const pickPlayerName = (p) => {
  const fn = p?.playerFirstName || p?.firstName || ''
  const ln = p?.playerLastName || p?.lastName || ''
  const full = `${safe(fn)} ${safe(ln)}`.trim()
  return full || p?.fullName || safe(p?.id)
}

const pickTeamName = (t) => t?.teamName || t?.name || t?.title || safe(t?.id)

export function resolveClubPlayersDomain(entity, filters = {}) {
  const club = entity || null
  const list = asArr(club?.keyPlayers) // [{player, team, isKey, isAutoEligible, ...}]

  const state =
    club == null
      ? DOMAIN_STATE.PARTIAL
      : getDomainState({ count: list.length, isLocked: false, isStale: false })

  const f = {
    q: hasText(filters.q) ? safe(filters.q) : '',
    teamId: filters.teamId ?? 'all',
    onlyManual: filters.onlyManual === true || filters.onlyManual === 'true' ? true : false,
  }

  const qn = norm(f.q)

  const rowsAll = list
    .map((x) => {
      const player = x?.player || null
      const team = x?.team || null

      return {
        id: safe(player?.id || x?.playerId),
        player,
        team,
        teamId: safe(x?.teamId || team?.id || player?.teamId),
        name: pickPlayerName(player),
        teamName: pickTeamName(team),
        isKey: x?.isKey === true,
        isAutoEligible: x?.isAutoEligible === true,
        levelPotential: Number(player?.levelPotential || 0) || 0,
        level: Number(player?.level || 0) || 0,
        timeRef: Number(player?.timePlayed || player?.timeVideoStats || 0) || 0,
      }
    })
    .filter((r) => !!r.id)

  const rows = rowsAll
    .filter((r) => (!qn ? true : norm(r.name).includes(qn) || norm(r.teamName).includes(qn)))
    .filter((r) => (f.teamId === 'all' ? true : safe(r.teamId) === safe(f.teamId)))
    .filter((r) => (f.onlyManual ? r.isKey === true : true))
    .sort((a, b) => {
      if (a.isKey !== b.isKey) return a.isKey ? -1 : 1
      if (b.levelPotential !== a.levelPotential) return b.levelPotential - a.levelPotential
      if (b.level !== a.level) return b.level - a.level
      return b.timeRef - a.timeRef
    })

  const keyCount = rowsAll.length
  const manualKeyCount = rowsAll.filter((r) => r.isKey === true).length
  const autoEligibleCount = rowsAll.filter((r) => r.isAutoEligible === true).length

  const teamOptions = Array.from(
    new Map(
      rowsAll
        .filter((r) => r.teamId)
        .map((r) => [safe(r.teamId), { id: safe(r.teamId), name: r.teamName || safe(r.teamId) }])
    ).values()
  ).sort((a, b) => safe(a.name).localeCompare(safe(b.name), 'he'))

  return {
    state,
    filters: f,
    options: { teamOptions },
    summary: { keyCount, manualKeyCount, autoEligibleCount },
    rows,
  }
}
