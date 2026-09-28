import {
  buildExpectedRosterCounterpartsV2,
} from '../roster/buildExpectedCounterparts.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const enrichSourceMovement = ({ fact = {}, side = '', localClubId = '' } = {}) => {
  const source = { ...(fact || {}) }

  if (side === 'transfersOut' && !clean(source.fromClubId)) {
    source.fromClubId = clean(localClubId)
  }

  if (side === 'transfersIn' && !clean(source.toClubId)) {
    source.toClubId = clean(localClubId)
  }

  return source
}

export function buildExpectedStatsCounterpartsV2({
  canonical = {},
} = {}) {
  const localClubId = clean(canonical.teamRoot?.clubId)
  const teamSeason = canonical.teamSeason || {}
  const transfersOut = (Array.isArray(teamSeason.transfersOut)
    ? teamSeason.transfersOut
    : []).map(fact => enrichSourceMovement({
    fact,
    side: 'transfersOut',
    localClubId,
  }))
  const transfersIn = (Array.isArray(teamSeason.transfersIn)
    ? teamSeason.transfersIn
    : []).map(fact => enrichSourceMovement({
    fact,
    side: 'transfersIn',
    localClubId,
  }))
  const sourceByMovementId = new Map(
    [...transfersOut, ...transfersIn]
      .map(fact => [clean(fact?.movementId), fact])
      .filter(([movementId]) => movementId)
  )
  const rows = buildExpectedRosterCounterpartsV2({
    canonical: {
      ...canonical,
      teamSeason: {
        ...teamSeason,
        transfersOut,
        transfersIn,
      },
    },
  })

  return rows.map(row => {
    const source = sourceByMovementId.get(clean(row?.movementId)) || {}

    return {
      ...row,
      fact: {
        ...row.fact,
        ...(clean(source.fromClubId)
          ? { fromClubId: clean(source.fromClubId) }
          : {}),
        ...(clean(source.toClubId)
          ? { toClubId: clean(source.toClubId) }
          : {}),
      },
    }
  })
}
