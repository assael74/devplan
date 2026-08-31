// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.balance.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const readBand = comparison => clean(comparison?.band)
const readCompactBand = (teamBalance, key, legacyValue) => {
  const compact = teamBalance?.bands?.[key]
  if (compact !== undefined && compact !== null && compact !== '') return clean(compact)
  return readBand(legacyValue)
}

export const buildTeamBalanceSearchIndexProjection = teamBalance => {
  if (!teamBalance || typeof teamBalance !== 'object') return {}

  const dependencyKey = clean(teamBalance?.dependencyKey)
  const persistenceContractVersion = clean(teamBalance?.persistenceContractVersion)
  if (!dependencyKey || !persistenceContractVersion) return {}

  return {
    balanceDependencyKey: dependencyKey,
    balancePersistenceContractVersion: persistenceContractVersion,
    balanceReliability: clean(teamBalance?.reliability?.reliability),

    balanceMinutesTop5Band: readCompactBand(teamBalance, 'minutesTop5', teamBalance?.benchmarks?.minutesDistribution?.topShares?.[5]),
    balanceMinutesTop10Band: readCompactBand(teamBalance, 'minutesTop10', teamBalance?.benchmarks?.minutesDistribution?.topShares?.[10]),
    balanceMinutesTop14Band: readCompactBand(teamBalance, 'minutesTop14', teamBalance?.benchmarks?.minutesDistribution?.topShares?.[14]),

    balanceUsage70Band: readCompactBand(teamBalance, 'usage70', teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[70]),
    balanceUsage50Band: readCompactBand(teamBalance, 'usage50', teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[50]),
    balanceUsage30Band: readCompactBand(teamBalance, 'usage30', teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[30]),
    balanceUsage10Band: readCompactBand(teamBalance, 'usage10', teamBalance?.benchmarks?.minutesDistribution?.possibleMinutesUsage?.counts?.[10]),

    balanceProductionTop1Band: readCompactBand(teamBalance, 'productionTop1', teamBalance?.benchmarks?.productionDistribution?.concentration?.top1Share),
    balanceProductionTop3Band: readCompactBand(teamBalance, 'productionTop3', teamBalance?.benchmarks?.productionDistribution?.concentration?.top3Share),

    balanceRotationStartsTop5Band: readCompactBand(teamBalance, 'rotationStartsTop5', teamBalance?.benchmarks?.rotationDistribution?.starts?.topShares?.[5]),
    balanceRotationStartsTop10Band: readCompactBand(teamBalance, 'rotationStartsTop10', teamBalance?.benchmarks?.rotationDistribution?.starts?.topShares?.[10]),
    balanceRotationStartsTop14Band: readCompactBand(teamBalance, 'rotationStartsTop14', teamBalance?.benchmarks?.rotationDistribution?.starts?.topShares?.[14]),

    balanceRotationSubInTop5Band: readCompactBand(teamBalance, 'rotationSubInTop5', teamBalance?.benchmarks?.rotationDistribution?.substituteIn?.topShares?.[5]),
    balanceRotationSubInTop10Band: readCompactBand(teamBalance, 'rotationSubInTop10', teamBalance?.benchmarks?.rotationDistribution?.substituteIn?.topShares?.[10]),
    balanceRotationSubInTop14Band: readCompactBand(teamBalance, 'rotationSubInTop14', teamBalance?.benchmarks?.rotationDistribution?.substituteIn?.topShares?.[14]),
  }
}
