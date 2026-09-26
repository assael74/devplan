const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const targetOf = ({
  localTeamId = '',
  localSeasonKey = '',
  fact = {},
  side = '',
} = {}) => {
  if (side === 'transfersOut') {
    return {
      birthTeamDocumentId: clean(fact.toBirthTeamDocumentId),
      seasonKey: clean(fact.counterpartSeasonKey || localSeasonKey),
      side: 'transfersIn',
    }
  }

  return {
    birthTeamDocumentId: clean(fact.fromBirthTeamDocumentId),
    seasonKey: clean(fact.counterpartSeasonKey || localSeasonKey),
    side: 'transfersOut',
  }
}

const counterpartFactOf = ({
  localTeamId = '',
  fact = {},
  side = '',
} = {}) => {
  if (side === 'transfersOut') {
    return {
      movementId: clean(fact.movementId),
      playerId: clean(fact.playerId),
      fromClubId: clean(fact.fromClubId),
      fromClubLevel: Number(fact.fromClubLevel) || 0,
      toClubLevel: Number(fact.toClubLevel) || 0,
      direction: clean(fact.direction),
      fromBirthTeamId: clean(fact.fromBirthTeamId || localTeamId),
      fromBirthTeamDocumentId: clean(fact.fromBirthTeamDocumentId || localTeamId),
      fromBirthTeamSlot: Number(fact.fromBirthTeamSlot) || 1,
      timing: clean(fact.timing),
      targetSnapshotKey: clean(fact.targetSnapshotKey),
      effectiveAt: fact.effectiveAt || null,
    }
  }

  return {
    movementId: clean(fact.movementId),
    playerId: clean(fact.playerId),
    toClubId: clean(fact.toClubId),
    fromClubLevel: Number(fact.fromClubLevel) || 0,
    toClubLevel: Number(fact.toClubLevel) || 0,
    direction: clean(fact.direction),
    toBirthTeamId: clean(fact.toBirthTeamId || localTeamId),
    toBirthTeamDocumentId: clean(fact.toBirthTeamDocumentId || localTeamId),
    toBirthTeamSlot: Number(fact.toBirthTeamSlot) || 1,
    timing: clean(fact.timing),
    targetSnapshotKey: clean(fact.targetSnapshotKey),
    effectiveAt: fact.effectiveAt || null,
  }
}

const buildRows = ({
  localTeamId = '',
  localSeasonKey = '',
  rows = [],
  side = '',
} = {}) => (Array.isArray(rows) ? rows : [])
  .map(fact => {
    const target = targetOf({
      localTeamId,
      localSeasonKey,
      fact,
      side,
    })
    const counterpartFact = counterpartFactOf({
      localTeamId,
      fact,
      side,
    })

    return {
      movementId: clean(fact.movementId),
      playerId: clean(fact.playerId),
      target,
      fact: counterpartFact,
    }
  })
  .filter(row => (
    row.movementId &&
    row.playerId &&
    row.target.birthTeamDocumentId
  ))

export function buildExpectedRosterCounterpartsV2({
  canonical = {},
} = {}) {
  const localTeamId = clean(canonical.birthTeamDocumentId)
  const localSeasonKey = clean(canonical.seasonKey)
  const teamSeason = canonical.teamSeason || {}

  return [
    ...buildRows({
      localTeamId,
      localSeasonKey,
      rows: teamSeason.transfersOut,
      side: 'transfersOut',
    }),
    ...buildRows({
      localTeamId,
      localSeasonKey,
      rows: teamSeason.transfersIn,
      side: 'transfersIn',
    }),
  ]
}
