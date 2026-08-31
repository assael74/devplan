// src/features/playersDatabase/services/write/teams/teamBalanceSnapshot.js

import {
  adaptTeamBalanceInput,
} from '../../../domain/adapters/teamBalanceInput.adapter.js'
import { buildTeamBalanceState } from '../../../domain/orchestration/buildTeamBalanceState.js'
import {
  TEAM_BALANCE_MINUTES_BENCHMARK_VERSION,
  TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
  TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION,
  TEAM_BALANCE_PRODUCTION_BENCHMARK_VERSION,
  TEAM_BALANCE_ROTATION_BENCHMARK_VERSION,
  TEAM_BALANCE_VERSION,
} from '../../../../../shared/scouting/scouting.version.js'

const cleanObject = value => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
)

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

const hasSnapshotShape = (actual, expected) => {
  if (Array.isArray(expected)) return Array.isArray(actual)

  if (!expected || typeof expected !== 'object') return true
  if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false

  return Object.keys(expected).every(key => (
    hasOwn(actual, key) && hasSnapshotShape(actual[key], expected[key])
  ))
}

const TEAM_BALANCE_SNAPSHOT_SHAPE = Object.freeze({
  snapshotFormat: '',
  version: '',
  outputContractVersion: '',
  persistenceContractVersion: '',
  dependencyKey: '',
  source: {
    inputHash: '',
  },
  reliability: {
    reliability: '',
    rosterCount: 0,
    loadedCount: 0,
    observedLoadedCount: 0,
    missingCount: 0,
    loadedCoverage: 0,
    observedCoverage: 0,
  },
  availability: {
    minutesDistribution: '',
    possibleMinutesUsage: '',
    productionDistribution: '',
    rotationDistribution: '',
    rotationStarts: '',
    rotationSubstituteIn: '',
  },
  benchmarkVersions: {
    minutesDistribution: '',
    productionDistribution: '',
    rotationDistribution: '',
  },
  bands: {
    minutesTop5: null,
    minutesTop10: null,
    minutesTop14: null,
    usage70: null,
    usage50: null,
    usage30: null,
    usage10: null,
    productionTop1: null,
    productionTop3: null,
    rotationStartsTop5: null,
    rotationStartsTop10: null,
    rotationStartsTop14: null,
    rotationSubInTop5: null,
    rotationSubInTop10: null,
    rotationSubInTop14: null,
  },
  updatedAt: null,
})

const sortValue = value => {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value

  return Object.keys(value)
    .sort()
    .reduce((result, key) => ({
      ...result,
      [key]: sortValue(value[key]),
    }), {})
}

const hashValue = value => {
  const serialized = JSON.stringify(sortValue(value))
  let hash = 2166136261

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `tb_${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export const buildBalanceInputFingerprint = seasonDoc => {
  const input = adaptTeamBalanceInput({
    teamPlayers: seasonDoc?.teamPlayers,
  })
  const players = (Array.isArray(input?.players) ? input.players : [])
    .map(player => {
      const stats = cleanObject(player?.playerStats)

      return {
        rosterStatus: player?.rosterStatus || '',
        statsStatus: player?.statsStatus || '',
        games: stats.games ?? null,
        goals: stats.goals ?? null,
        minutes: stats.minutes ?? null,
        starts: stats.starts ?? null,
        substituteIn: stats.substituteIn ?? null,
        substitutedOut: stats.substitutedOut ?? null,
        teamMinutes: stats.teamMinutes ?? null,
      }
    })
    .map(player => sortValue(player))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))

  return hashValue({ players })
}


export const TEAM_BALANCE_SNAPSHOT_FORMAT = 'team-balance-summary-v2'

export const buildBalanceDependencyKey = ({
  version = '',
  outputContractVersion = '',
  persistenceContractVersion = '',
  benchmarkVersions = {},
} = {}) => [
  TEAM_BALANCE_SNAPSHOT_FORMAT,
  clean(version),
  clean(outputContractVersion),
  clean(persistenceContractVersion),
  clean(benchmarkVersions.minutesDistribution),
  clean(benchmarkVersions.productionDistribution),
  clean(benchmarkVersions.rotationDistribution),
].join('|')

export const buildCurrentTeamBalanceDependency = () => {
  const benchmarkVersions = {
    minutesDistribution: TEAM_BALANCE_MINUTES_BENCHMARK_VERSION,
    productionDistribution: TEAM_BALANCE_PRODUCTION_BENCHMARK_VERSION,
    rotationDistribution: TEAM_BALANCE_ROTATION_BENCHMARK_VERSION,
  }
  const version = TEAM_BALANCE_VERSION
  const outputContractVersion = TEAM_BALANCE_OUTPUT_CONTRACT_VERSION
  const persistenceContractVersion = TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION

  return {
    snapshotFormat: TEAM_BALANCE_SNAPSHOT_FORMAT,
    version,
    outputContractVersion,
    persistenceContractVersion,
    benchmarkVersions,
    dependencyKey: buildBalanceDependencyKey({
      version,
      outputContractVersion,
      persistenceContractVersion,
      benchmarkVersions,
    }),
  }
}

export const inspectTeamBalanceFreshness = ({ seasonDoc = {} } = {}) => {
  const teamBalance = cleanObject(seasonDoc.teamBalance)
  const inputHash = buildBalanceInputFingerprint(seasonDoc)
  const dependency = buildCurrentTeamBalanceDependency()
  const reasons = []
  const hasSnapshot = Object.keys(teamBalance).length > 0

  if (!hasSnapshot || !hasSnapshotShape(teamBalance, TEAM_BALANCE_SNAPSHOT_SHAPE)) {
    reasons.push('incomplete')
  }
  if (clean(teamBalance.snapshotFormat) !== dependency.snapshotFormat) {
    reasons.push('snapshot_format')
  }
  if (clean(teamBalance?.source?.inputHash) !== inputHash) {
    reasons.push('input_hash')
  }
  if (clean(teamBalance.version) !== dependency.version) reasons.push('model_version')
  if (clean(teamBalance.outputContractVersion) !== dependency.outputContractVersion) {
    reasons.push('output_contract')
  }
  if (clean(teamBalance.persistenceContractVersion) !== dependency.persistenceContractVersion) {
    reasons.push('persistence_contract')
  }
  if (clean(teamBalance.benchmarkVersions?.minutesDistribution) !== dependency.benchmarkVersions.minutesDistribution) {
    reasons.push('minutes_benchmark')
  }
  if (clean(teamBalance.benchmarkVersions?.productionDistribution) !== dependency.benchmarkVersions.productionDistribution) {
    reasons.push('production_benchmark')
  }
  if (clean(teamBalance.benchmarkVersions?.rotationDistribution) !== dependency.benchmarkVersions.rotationDistribution) {
    reasons.push('rotation_benchmark')
  }
  if (clean(teamBalance.dependencyKey) !== dependency.dependencyKey) {
    reasons.push('dependency_key')
  }

  const status = reasons.length === 0
    ? 'fresh'
    : reasons.includes('incomplete')
      ? 'incomplete'
      : reasons.includes('input_hash')
        ? 'input_outdated'
        : 'dependency_outdated'

  return {
    status,
    fresh: status === 'fresh',
    reasons,
    inputHash,
    dependency,
    teamBalance,
  }
}

const readBand = comparison => {
  const band = comparison?.band
  return band === undefined || band === null || band === '' ? null : clean(band)
}

export const buildTeamBalanceDocumentSnapshot = ({
  balanceState,
  inputHash = '',
  updatedAt = null,
} = {}) => {
  const source = cleanObject(balanceState)
  const metrics = cleanObject(source.metrics)
  const benchmarks = cleanObject(source.benchmarks)
  const reliability = cleanObject(source.reliability)
  const minutes = cleanObject(metrics.minutesDistribution)
  const production = cleanObject(metrics.productionDistribution)
  const rotation = cleanObject(metrics.rotationDistribution)
  const minutesBenchmark = cleanObject(benchmarks.minutesDistribution)
  const productionBenchmark = cleanObject(benchmarks.productionDistribution)
  const rotationBenchmark = cleanObject(benchmarks.rotationDistribution)
  const benchmarkVersions = {
    minutesDistribution: minutesBenchmark.benchmarkVersion || '',
    productionDistribution: productionBenchmark.benchmarkVersion || '',
    rotationDistribution: rotationBenchmark.benchmarkVersion || '',
  }
  const persistenceContractVersion = TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION
  const dependencyKey = buildBalanceDependencyKey({
    version: source.version,
    outputContractVersion: source.outputContractVersion,
    persistenceContractVersion,
    benchmarkVersions,
  })

  return {
    snapshotFormat: TEAM_BALANCE_SNAPSHOT_FORMAT,
    version: source.version || '',
    outputContractVersion: source.outputContractVersion || '',
    persistenceContractVersion,
    dependencyKey,
    source: {
      inputHash,
    },
    reliability: {
      reliability: clean(reliability.reliability) || 'insufficient',
      rosterCount: Number(reliability.rosterCount) || 0,
      loadedCount: Number(reliability.loadedCount) || 0,
      observedLoadedCount: Number(reliability.observedLoadedCount) || 0,
      missingCount: Number(reliability.missingCount) || 0,
      loadedCoverage: Number(reliability.loadedCoverage) || 0,
      observedCoverage: Number(reliability.observedCoverage) || 0,
    },
    availability: {
      minutesDistribution: clean(minutes.availability) || 'unavailable',
      possibleMinutesUsage: clean(minutes?.possibleMinutesUsage?.availability) || 'unavailable',
      productionDistribution: clean(production.availability) || 'unavailable',
      rotationDistribution: clean(rotation.availability) || 'unavailable',
      rotationStarts: clean(rotation?.starts?.availability) || 'unavailable',
      rotationSubstituteIn: clean(rotation?.substituteIn?.availability) || 'unavailable',
    },
    benchmarkVersions,
    bands: {
      minutesTop5: readBand(minutesBenchmark?.topShares?.[5]),
      minutesTop10: readBand(minutesBenchmark?.topShares?.[10]),
      minutesTop14: readBand(minutesBenchmark?.topShares?.[14]),
      usage70: readBand(minutesBenchmark?.possibleMinutesUsage?.counts?.[70]),
      usage50: readBand(minutesBenchmark?.possibleMinutesUsage?.counts?.[50]),
      usage30: readBand(minutesBenchmark?.possibleMinutesUsage?.counts?.[30]),
      usage10: readBand(minutesBenchmark?.possibleMinutesUsage?.counts?.[10]),
      productionTop1: readBand(productionBenchmark?.concentration?.top1Share),
      productionTop3: readBand(productionBenchmark?.concentration?.top3Share),
      rotationStartsTop5: readBand(rotationBenchmark?.starts?.topShares?.[5]),
      rotationStartsTop10: readBand(rotationBenchmark?.starts?.topShares?.[10]),
      rotationStartsTop14: readBand(rotationBenchmark?.starts?.topShares?.[14]),
      rotationSubInTop5: readBand(rotationBenchmark?.substituteIn?.topShares?.[5]),
      rotationSubInTop10: readBand(rotationBenchmark?.substituteIn?.topShares?.[10]),
      rotationSubInTop14: readBand(rotationBenchmark?.substituteIn?.topShares?.[14]),
    },
    updatedAt,
  }
}

export const withTeamBalanceSnapshot = ({
  seasonDoc = {},
  teamRoot = {},
} = {}) => {
  const freshness = inspectTeamBalanceFreshness({ seasonDoc })

  if (freshness.fresh) return seasonDoc

  const inputHash = freshness.inputHash
  const previousBalance = freshness.teamBalance
  const balanceState = buildTeamBalanceState({
    teamDocument: teamRoot,
    seasonDocument: seasonDoc,
  })
  const candidateSnapshot = buildTeamBalanceDocumentSnapshot({
    balanceState,
    inputHash,
    updatedAt: null,
  })
  const updatedAt = new Date().toISOString()

  return {
    ...seasonDoc,
    teamBalance: {
      ...candidateSnapshot,
      updatedAt,
    },
  }
}
