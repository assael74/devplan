// Team Season Movement facts -> compact Club transfer summary. Pure projection.

import {
  CLUB_TRANSFER_COVERAGE_STATUS,
  normalizeClubTransferCoverageStatus,
} from '../../contracts/club.contract.js'
import { cleanValue } from '../../../model/shared/value.model.js'

const buildDirectionSummary = () => ({
  total: 0,
  up: 0,
  lateral: 0,
  down: 0,
  unknown: 0,
  clubIds: [],
})

const uniqueValues = values => [...new Set(
  (Array.isArray(values) ? values : [])
    .map(cleanValue)
    .filter(Boolean)
)]

const resolveDirection = fact => {
  const direction = cleanValue(fact?.direction).toLowerCase()
  return ['up', 'lateral', 'down'].includes(direction)
    ? direction
    : 'unknown'
}

const isInternalMovement = ({ fact = {}, clubId = '', side = '' } = {}) => {
  const otherClubId = side === 'in'
    ? cleanValue(fact.fromClubId)
    : cleanValue(fact.toClubId)

  return Boolean(cleanValue(clubId) && otherClubId === cleanValue(clubId))
}

const appendFact = ({ summary, fact, clubId, side }) => {
  if (isInternalMovement({ fact, clubId, side })) {
    summary.internal.total += 1
    return
  }

  const target = summary[side]
  const direction = resolveDirection(fact)
  const otherClubId = side === 'in'
    ? cleanValue(fact?.fromClubId)
    : cleanValue(fact?.toClubId)

  target.total += 1
  target[direction] += 1
  target.clubIds = uniqueValues([...target.clubIds, otherClubId])
}

export const buildClubTransferSummary = ({
  transfersIn = [],
  transfersOut = [],
  pendingPlayers = [],
  clubId = '',
  coverageStatus = CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED,
} = {}) => {
  const summary = {
    coverageStatus: normalizeClubTransferCoverageStatus(coverageStatus),
    in: buildDirectionSummary(),
    out: buildDirectionSummary(),
    internal: { total: 0 },
    pending: {
      total: Array.isArray(pendingPlayers) ? pendingPlayers.length : 0,
    },
  }

  ;(Array.isArray(transfersIn) ? transfersIn : []).forEach(fact => {
    appendFact({ summary, fact, clubId, side: 'in' })
  })

  ;(Array.isArray(transfersOut) ? transfersOut : []).forEach(fact => {
    appendFact({ summary, fact, clubId, side: 'out' })
  })

  return summary
}
