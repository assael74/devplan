const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const upsertMovement = (rows, movement) => {
  const current = Array.isArray(rows) ? rows : []
  if (!movement?.movementId) return [...current]

  return [
    ...current.filter(row => (
      clean(row?.movementId) !== clean(movement.movementId)
    )),
    movement,
  ]
}

export const buildStatsCounterpartMovementPatch = ({
  request = {},
  currentTeamSeason = null,
} = {}) => {
  const birthTeamDocumentId = clean(
    request.counterpartBirthTeamDocumentId ||
    request.sourceBirthTeamDocumentId
  )
  const seasonKey = clean(
    request.counterpartSeasonKey ||
    request.seasonKey
  )

  if (!birthTeamDocumentId || !seasonKey) {
    const error = new Error(
      'Counterpart Movement target must be resolved before approval'
    )
    error.code = 'STATS_COUNTERPART_IDENTITY_INVALID'
    throw error
  }

  if (!currentTeamSeason) {
    return {
      birthTeamDocumentId,
      seasonKey,
      transfersIn: [],
      transfersOut: [],
      pendingPlayers: [],
    }
  }

  const transfersIn = Array.isArray(currentTeamSeason.transfersIn)
    ? currentTeamSeason.transfersIn
    : []
  const transfersOut = Array.isArray(currentTeamSeason.transfersOut)
    ? currentTeamSeason.transfersOut
    : []

  return {
    birthTeamDocumentId,
    seasonKey,
    transfersIn: request.incoming
      ? upsertMovement(transfersIn, request.incoming)
      : [...transfersIn],
    transfersOut: request.outgoing
      ? upsertMovement(transfersOut, request.outgoing)
      : [...transfersOut],
    pendingPlayers: Array.isArray(currentTeamSeason.pendingPlayers)
      ? [...currentTeamSeason.pendingPlayers]
      : [],
  }
}
