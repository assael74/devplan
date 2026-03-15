// teamProfile/modules/players/logic/teamPlayers.filters.js

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim()

export const filterTeamPlayersRows = (rows, filters) => {
  const q = norm(filters?.search).toLowerCase()
  const onlyActive = filters?.onlyActive === true
  const onlyKey = filters?.onlyKey === true
  const onlyProject = filters?.onlyProject === true

  return (Array.isArray(rows) ? rows : []).filter((r) => {
    if (q) {
      const hay = [
        r.fullName,
        r.birthLabel,
        r.generalPosition?.layerLabel,
        r.generalPosition?.layerKey,
        ...(r.positions || []),
      ]
        .join(' ')
        .toLowerCase()

      if (!hay.includes(q)) return false
    }

    if (onlyActive && !r.active) return false
    if (onlyKey && !r.isKey) return false
    if (onlyProject && r.type !== 'project') return false

    return true
  })
}
