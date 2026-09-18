// features/playersDatabase/domain/movement/movement.timing.js

import { MOVEMENT_TIMING } from './movement.contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const seasonStartYear = value => {
  const match = clean(value).match(/^(\d{2,4})/)
  if (!match) return null

  const number = Number(match[1])
  if (!Number.isFinite(number)) return null

  return number < 100 ? 2000 + number : number
}

export const compareSeasonKeys = (left, right) => {
  const leftYear = seasonStartYear(left)
  const rightYear = seasonStartYear(right)

  if (leftYear === null || rightYear === null) return 0
  return leftYear - rightYear
}

export const isPreviousSeasonKey = ({ previousSeasonKey, seasonKey } = {}) => (
  compareSeasonKeys(previousSeasonKey, seasonKey) === -1
)

export const resolveMovementTiming = ({
  sourceSeasonKey,
  movementSeasonKey,
  effectiveAt = null,
} = {}) => {
  if (isPreviousSeasonKey({
    previousSeasonKey: sourceSeasonKey,
    seasonKey: movementSeasonKey,
  })) {
    return MOVEMENT_TIMING.BETWEEN_SEASONS
  }

  if (
    clean(sourceSeasonKey) === clean(movementSeasonKey) &&
    clean(effectiveAt)
  ) {
    return MOVEMENT_TIMING.IN_SEASON
  }

  return MOVEMENT_TIMING.UNKNOWN
}
