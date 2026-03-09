import { safeArr } from './_utils/array.utils'
import { getAllTeams } from './_utils/team.utils'

export function buildHomeTopCards({ clubs, teams, players, scouting } = {}) {
  const c = safeArr(clubs)
  const t = getAllTeams({ teams, clubs })
  const p = safeArr(players)
  const s = safeArr(scouting)

  const projectPlayersCount = p.filter((x) => x?.type === 'project').length
  const trackedPlayersCount = s.length // "שחקנים תחת מעקב" = scouting

  return [
    { key: 'clubs', icon: '🏟️', value: c.length, label: 'מועדונים במערכת' },
    { key: 'teams', icon: '👥', value: t.length, label: 'קבוצות במערכת' },
    { key: 'players', icon: '🧍', value: p.length, label: 'שחקנים במערכת' },
    { key: 'projectPlayers', icon: '🎯', value: projectPlayersCount, label: 'שחקני פרויקט' },
    { key: 'trackedPlayers', icon: '👁️', value: trackedPlayersCount, label: 'שחקנים תחת מעקב' },
  ]
}
