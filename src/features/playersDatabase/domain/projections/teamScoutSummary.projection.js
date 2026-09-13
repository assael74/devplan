import { toNumberOrZero } from '../../model/shared/value.model.js'

export const normalizeScoutProfilesSummary = summary => {
  const profileCounts =
    summary?.profileCounts &&
    typeof summary.profileCounts === 'object'
      ? summary.profileCounts
      : {}

  return {
    total: toNumberOrZero(summary?.total),
    profileCounts: Object.keys(profileCounts)
      .sort()
      .reduce((result, profileId) => {
        result[profileId] = toNumberOrZero(profileCounts[profileId])
        return result
      }, {}),
  }
}

export const areScoutProfilesSummariesEqual = (left, right) => (
  JSON.stringify(normalizeScoutProfilesSummary(left)) ===
  JSON.stringify(normalizeScoutProfilesSummary(right))
)

export const normalizeTeamTaskSignals = signals => ({
  offense: Boolean(signals?.offense),
  defense: Boolean(signals?.defense),
  updatedAt: signals?.updatedAt || null,
})

export const areTeamTaskSignalsEqual = (left, right) => {
  const normalizedLeft = normalizeTeamTaskSignals(left)
  const normalizedRight = normalizeTeamTaskSignals(right)

  return (
    normalizedLeft.offense === normalizedRight.offense &&
    normalizedLeft.defense === normalizedRight.defense
  )
}
