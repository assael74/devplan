// Team Season players -> compact Club transfer summary. Pure projection.

import {
  CLUB_TRANSFER_COVERAGE_STATUS,
  normalizeClubTransferCoverageStatus,
} from '../../contracts/club.contract.js'
import { cleanValue } from '../../../model/shared/value.model.js'

const TRANSFER_DIRECTIONS = Object.freeze(['up', 'lateral', 'down', 'unknown'])

const buildDirectionSummary = () => ({
  total: 0,
  up: 0,
  lateral: 0,
  down: 0,
  unknown: 0,
})

const normalizeTransferDirection = value => {
  const direction = cleanValue(value).toLowerCase()
  return TRANSFER_DIRECTIONS.includes(direction) ? direction : 'unknown'
}

export const buildClubTransferSummary = ({
  teamPlayers = [],
  coverageStatus = CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED,
} = {}) => {
  const summary = {
    coverageStatus: normalizeClubTransferCoverageStatus(coverageStatus),
    in: buildDirectionSummary(),
    out: buildDirectionSummary(),
  }

  ;(Array.isArray(teamPlayers) ? teamPlayers : []).forEach(player => {
    const rosterStatus = cleanValue(player?.rosterStatus)
    const direction = normalizeTransferDirection(player?.manualTransferDirection)

    if (rosterStatus === 'transferredIn') {
      summary.in.total += 1
      summary.in[direction] += 1
    }

    if (rosterStatus === 'transferredOut') {
      summary.out.total += 1
      summary.out[direction] += 1
    }
  })

  return summary
}
