// features/playersDatabase/ui/logic/tableRows.logic.js

export function sortByTableRank(rows = []) {
  return [...rows].sort((a, b) => Number(a.tableRank || a.rank || 0) - Number(b.tableRank || b.rank || 0))
}

export function countRowsBy(rows = [], predicate = () => false) {
  return rows.reduce((total, row) => total + (predicate(row) ? 1 : 0), 0)
}

export function summarizeScoutProfiles(players = []) {
  return players.reduce((acc, player) => {
    const profiles = Array.isArray(player.scoutProfiles) ? player.scoutProfiles : []
    if (profiles.length) acc.total += 1
    profiles.forEach(profile => {
      const profileId = profile.profileId || profile.id
      if (!profileId) return
      acc.profileCounts[profileId] = (acc.profileCounts[profileId] || 0) + 1
    })
    return acc
  }, { total: 0, profileCounts: {} })
}
