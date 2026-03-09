// preview/PreviewDomainCard/domains/club/teams/clubTeams.domain.logic.js
import { DOMAIN_STATE, getDomainState } from '../../../../preview.state'

const safe = (v) => (v == null ? '' : String(v))
const asArr = (v) => (Array.isArray(v) ? v : [])
const hasText = (v) => safe(v).trim().length > 0
const norm = (s) => safe(s).trim().toLowerCase()

const boolOrAll = (v) =>
  v === 'all'
    ? 'all'
    : v === true || v === 'true'
    ? true
    : v === false || v === 'false'
    ? false
    : 'all'

const pickTeamName = (t) => t?.teamName || t?.name || t?.title || safe(t?.id)
const pickTeamYear = (t) => t?.teamYear ?? t?.year ?? null
const pickActive = (t) => (typeof t?.active === 'boolean' ? t.active : null)
const pickIsProject = (t) => (typeof t?.isProject === 'boolean' ? t.isProject : null)

const countPlayers = (t) => asArr(t?.players).length
const countRoles = (t) => asArr(t?.roles).length

const pickLevelAvg = (t) => {
  const v = t?.level ?? t?.abilitiesTeam?.level?.avg ?? null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const toYearOptions = (teams) => {
  const years = Array.from(
    new Set(
      asArr(teams)
        .map((t) => pickTeamYear(t))
        .filter((y) => y != null && safe(y) !== '')
        .map((y) => Number(y))
        .filter((y) => Number.isFinite(y))
    )
  ).sort((a, b) => b - a)

  return years
}

export function resolveClubTeamsDomain(entity, filters = {}) {
  const club = entity || null
  const teamsAll = asArr(club?.teams)

  // ✅ state לפי המנוע הרשמי
  // - אין entity => PARTIAL
  // - יש entity אבל אין קבוצות => EMPTY
  // - יש קבוצות => OK
  const state =
    club == null
      ? DOMAIN_STATE.PARTIAL
      : getDomainState({
          count: teamsAll.length,
          isLocked: false,
          isStale: false,
        })

  const f = {
    q: hasText(filters.q) ? safe(filters.q) : '',
    year: filters.year ?? 'all',
    active: boolOrAll(filters.active),
    project: boolOrAll(filters.project),
  }

  const qn = norm(f.q)

  const rowsAll = teamsAll.map((t) => {
    const name = pickTeamName(t)
    const year = pickTeamYear(t)
    const active = pickActive(t)
    const isProject = pickIsProject(t)
    const playersCount = countPlayers(t)
    const rolesCount = countRoles(t)
    const levelAvg = pickLevelAvg(t)

    return {
      id: safe(t?.id),
      raw: t,
      name,
      year,
      active,
      isProject,
      playersCount,
      rolesCount,
      levelAvg,
    }
  })

  const rows = rowsAll
    .filter((r) => (!qn ? true : norm(r.name).includes(qn) || safe(r.year).includes(qn)))
    .filter((r) => (f.year === 'all' ? true : safe(r.year) === safe(f.year)))
    .filter((r) => (f.active === 'all' ? true : r.active === f.active))
    .filter((r) => (f.project === 'all' ? true : r.isProject === f.project))
    .sort((a, b) => {
      const ay = Number(a.year)
      const by = Number(b.year)
      if (Number.isFinite(ay) && Number.isFinite(by) && ay !== by) return by - ay
      return safe(a.name).localeCompare(safe(b.name), 'he')
    })

  const totalTeams = rowsAll.length
  const activeTeams = rowsAll.filter((r) => r.active === true).length
  const projectTeams = rowsAll.filter((r) => r.isProject === true).length
  const totalPlayers = rowsAll.reduce((sum, r) => sum + (Number(r.playersCount) || 0), 0)
  const clubRoles = asArr(club?.roles).length

  const avgLevel =
    rowsAll.length === 0
      ? null
      : (() => {
          const nums = rowsAll.map((r) => r.levelAvg).filter((x) => Number.isFinite(x))
          if (nums.length === 0) return null
          const s = nums.reduce((a, b) => a + b, 0)
          return Math.round((s / nums.length) * 10) / 10
        })()

  return {
    state,
    filters: f,
    options: { yearOptions: toYearOptions(teamsAll) },
    summary: {
      totalTeams,
      activeTeams,
      projectTeams,
      totalPlayers,
      clubRoles,
      avgLevel,
    },
    rows,
  }
}
