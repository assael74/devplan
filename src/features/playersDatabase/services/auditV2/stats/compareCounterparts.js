const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const comparableMovement = movement => {
  const source = movement && typeof movement === 'object'
    ? movement
    : {}

  return Object.fromEntries(
    Object.entries(source)
      .filter(([, value]) => value !== undefined)
  )
}

const pickActualMovement = ({
  teamSeason = {},
  side = '',
  movementId = '',
} = {}) => {
  const rows = Array.isArray(teamSeason?.[side])
    ? teamSeason[side]
    : []

  return rows.find(row => (
    clean(row?.movementId) === clean(movementId)
  )) || null
}

const pickCanonicalOwnedFields = ({
  canonicalMovement = {},
  actualMovement = {},
} = {}) => Object.fromEntries(
  Object.keys(comparableMovement(canonicalMovement))
    .map(key => [key, actualMovement?.[key]])
)

const same = (left, right) => (
  JSON.stringify(left) === JSON.stringify(right)
)

const findActualTarget = ({
  actualCounterparts = [],
  target = {},
} = {}) => (
  (Array.isArray(actualCounterparts) ? actualCounterparts : [])
    .find(row => (
      clean(row?.birthTeamDocumentId) === clean(target.birthTeamDocumentId) &&
      clean(row?.seasonKey) === clean(target.seasonKey)
    )) || null
)

export function compareStatsCounterpartsV2({
  expectedCounterparts = [],
  actualCounterparts = [],
} = {}) {
  const findings = []

  ;(Array.isArray(expectedCounterparts) ? expectedCounterparts : [])
    .forEach(expected => {
      const actualTarget = findActualTarget({
        actualCounterparts,
        target: expected.target,
      })

      // Same operational boundary as the writer:
      // unavailable target Team Season is not writable and is not a sync mismatch.
      if (!actualTarget?.teamSeason) return

      const side = clean(expected?.target?.side)
      const movementId = clean(expected?.movementId || expected?.fact?.movementId)
      const actualMovement = pickActualMovement({
        teamSeason: actualTarget.teamSeason,
        side,
        movementId,
      })

      if (!actualMovement) {
        findings.push({
          type: 'missing_projection',
          target: 'counterpart',
          documentId: clean(expected?.target?.birthTeamDocumentId),
          reason: 'Canonical Stats movement is missing from the counterpart Team Season.',
          expected: {
            seasonKey: clean(expected?.target?.seasonKey),
            side,
            movement: comparableMovement(expected?.fact),
          },
          actual: null,
        })
        return
      }

      const expectedMovement = comparableMovement(expected?.fact)
      const actualOwned = pickCanonicalOwnedFields({
        canonicalMovement: expectedMovement,
        actualMovement,
      })

      if (same(actualOwned, expectedMovement)) return

      findings.push({
        type: 'projection_mismatch',
        target: 'counterpart',
        documentId: clean(expected?.target?.birthTeamDocumentId),
        reason: 'Canonical Stats movement fields do not match the counterpart projection.',
        expected: {
          seasonKey: clean(expected?.target?.seasonKey),
          side,
          movement: expectedMovement,
        },
        actual: {
          seasonKey: clean(actualTarget.seasonKey),
          side,
          movement: actualOwned,
        },
      })
    })

  return findings
}
