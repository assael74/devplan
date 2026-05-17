// ui/fields/selectUi/players/logic/positions.logic.js

export const MAX_POSITIONS = 4

export const safeArr = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export const isSelectedPosition = ({
  positions = [],
  code,
}) => {
  return safeArr(positions).includes(code)
}

export const resolveActivePrimary = ({
  positions = [],
  primaryPosition = '',
}) => {
  const safePositions = safeArr(positions)

  if (primaryPosition && safePositions.includes(primaryPosition)) {
    return primaryPosition
  }

  return ''
}

export const resolveNextPrimaryAfterRemove = ({
  nextPositions = [],
  currentPrimary = '',
  removedCode = '',
}) => {
  const safePositions = safeArr(nextPositions)

  if (!safePositions.length) return ''

  if (
    currentPrimary &&
    currentPrimary !== removedCode &&
    safePositions.includes(currentPrimary)
  ) {
    return currentPrimary
  }

  return ''
}

export const canAddPosition = ({
  positions = [],
  max = MAX_POSITIONS,
}) => {
  return safeArr(positions).length < max
}

export const buildAddPositionChange = ({
  positions = [],
  code,
  primaryPosition = '',
  max = MAX_POSITIONS,
}) => {
  const safePositions = safeArr(positions)

  if (safePositions.includes(code)) {
    return {
      ok: true,
      positions: safePositions,
      primaryPosition,
      reason: 'already_selected',
    }
  }

  if (!canAddPosition({ positions: safePositions, max })) {
    return {
      ok: false,
      positions: safePositions,
      primaryPosition,
      reason: 'limit',
    }
  }

  return {
    ok: true,
    positions: [...safePositions, code],
    primaryPosition,
    reason: 'added',
  }
}

export const buildRemovePositionChange = ({
  positions = [],
  code,
  primaryPosition = '',
}) => {
  const nextPositions = safeArr(positions).filter((item) => item !== code)

  return {
    positions: nextPositions,
    primaryPosition: resolveNextPrimaryAfterRemove({
      nextPositions,
      currentPrimary: primaryPosition,
      removedCode: code,
    }),
  }
}

export const buildPrimaryPositionChange = ({
  positions = [],
  code,
}) => {
  const safePositions = safeArr(positions)

  if (!safePositions.includes(code)) {
    return ''
  }

  return code
}

export const getPositionMode = ({
  positions = [],
  code,
  activePrimary = '',
}) => {
  const selected = safeArr(positions).includes(code)

  if (!selected) return 'idle'
  if (activePrimary === code) return 'primary'

  return 'secondary'
}
