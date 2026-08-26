// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.balance.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const readBand = comparison => clean(comparison?.band)

export const buildTeamBalanceSearchIndexProjection = teamBalance => {
  if (!teamBalance || typeof teamBalance !== 'object') return {}

  const dependencyKey = clean(teamBalance?.dependencyKey)
  const persistenceContractVersion = clean(teamBalance?.persistenceContractVersion)
  if (!dependencyKey || !persistenceContractVersion) return {}

  return {
    balanceDependencyKey: dependencyKey,
    balancePersistenceContractVersion: persistenceContractVersion,
    balanceReliability: clean(teamBalance?.reliability?.reliability),

    balanceMinutesTop5Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.topShares?.[5]),
    balanceMinutesTop10Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.topShares?.[10]),
    balanceMinutesTop14Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.topShares?.[14]),

    balanceUsage70Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[70]),
    balanceUsage50Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[50]),
    balanceUsage30Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[30]),
    balanceUsage10Band: readBand(teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[10]),

    balanceProductionTop1Band: readBand(teamBalance?.benchmarks?.productionDistribution?.concentration?.top1Share),
    balanceProductionTop3Band: readBand(teamBalance?.benchmarks?.productionDistribution?.concentration?.top3Share),

    balanceRotationStartsTop5Band: readBand(teamBalance?.benchmarks?.rotationDistribution?.starts?.topShares?.[5]),
    balanceRotationStartsTop10Band: readBand(teamBalance?.benchmarks?.rotationDistribution?.starts?.topShares?.[10]),
    balanceRotationStartsTop14Band: readBand(teamBalance?.benchmarks?.rotationDistribution?.starts?.topShares?.[14]),

    balanceRotationSubInTop5Band: readBand(teamBalance?.benchmarks?.rotationDistribution?.substituteIn?.topShares?.[5]),
    balanceRotationSubInTop10Band: readBand(teamBalance?.benchmarks?.rotationDistribution?.substituteIn?.topShares?.[10]),
    balanceRotationSubInTop14Band: readBand(teamBalance?.benchmarks?.rotationDistribution?.substituteIn?.topShares?.[14]),
  }
}
