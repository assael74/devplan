const clean = value => String(value === undefined || value === null ? '' : value).trim()

const counterpartTeamId = ({ fact = {}, side = '' } = {}) => (
  side === 'transfersIn' ? clean(fact.fromBirthTeamDocumentId) : clean(fact.toBirthTeamDocumentId)
)

const sameEpisode = ({ row = {}, fact = {}, side = '' } = {}) => (
  clean(row.playerId) === clean(fact.playerId) &&
  counterpartTeamId({ fact: row, side }) === counterpartTeamId({ fact, side }) &&
  clean(row.timing) === clean(fact.timing) &&
  ((clean(row.targetSnapshotKey) && clean(row.targetSnapshotKey) === clean(fact.targetSnapshotKey)) ||
    (clean(row.effectiveAt) && clean(row.effectiveAt) === clean(fact.effectiveAt)))
)

export const buildApprovedCounterpartTeamSeason = ({ current = {}, fact = {}, side = '' } = {}) => {
  if (!fact || !side) return { changed: false, teamSeason: current }
  const rows = Array.isArray(current[side]) ? current[side] : []
  const exact = rows.findIndex(row => clean(row.movementId) === clean(fact.movementId))
  const equivalent = exact >= 0 ? exact : rows.findIndex(row => sameEpisode({ row, fact, side }))
  const conflict = equivalent < 0 && rows.some(row => (
    clean(row.playerId) === clean(fact.playerId) &&
    counterpartTeamId({ fact: row, side }) !== counterpartTeamId({ fact, side })
  ))
  if (conflict) return { changed: false, conflict: true, teamSeason: current }

  const pending = Array.isArray(current.pendingPlayers) ? current.pendingPlayers : []
  const currentTeamId = clean(current.birthTeamDocumentId || current.teamDocumentId)
  const pendingIndex = pending.findIndex(row => (
    clean(row.playerId) === clean(fact.playerId) &&
    (!clean(row.previousBirthTeamDocumentId) || clean(row.previousBirthTeamDocumentId) === currentTeamId)
  ))
  const nextPending = pendingIndex < 0 ? pending : pending.filter((_row, index) => index !== pendingIndex)
  const nextRows = equivalent < 0 ? [...rows, fact] : rows
  const changed = pendingIndex >= 0 || equivalent < 0
  return { changed, conflict: false, teamSeason: changed ? { ...current, [side]: nextRows, pendingPlayers: nextPending } : current }
}
