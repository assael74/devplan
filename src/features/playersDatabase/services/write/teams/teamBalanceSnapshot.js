// src/features/playersDatabase/services/write/teams/teamBalanceSnapshot.js

import {
  adaptTeamBalanceInput,
} from '../../../domain/adapters/teamBalanceInput.adapter.js'
import { buildTeamBalanceState } from '../../../domain/orchestration/buildTeamBalanceState.js'
import {
  TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION,
} from '../../../../../shared/scouting/scouting.version.js'

const cleanObject = value => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
)

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

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

const buildBalanceInputFingerprint = seasonDoc => {
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


const stripBenchmarkRange = comparison => {
  const source = cleanObject(comparison)
  if (Object.keys(source).length === 0) {
    return comparison === undefined ? null : comparison
  }

  return Object.entries(source).reduce((result, [key, value]) => {
    if (key === 'benchmark') return result

    if (Array.isArray(value)) {
      result[key] = value.map(item => (
        item && typeof item === 'object'
          ? stripBenchmarkRange(item)
          : item
      ))
      return result
    }

    result[key] = value && typeof value === 'object'
      ? stripBenchmarkRange(value)
      : value

    return result
  }, {})
}

const buildBalanceDependencyKey = ({
  version = '',
  outputContractVersion = '',
  persistenceContractVersion = '',
  benchmarkVersions = {},
} = {}) => [
  clean(version),
  clean(outputContractVersion),
  clean(persistenceContractVersion),
  clean(benchmarkVersions.minutesDistribution),
  clean(benchmarkVersions.productionDistribution),
  clean(benchmarkVersions.rotationDistribution),
].join('|')

export const buildTeamBalanceDocumentSnapshot = ({
  balanceState,
  inputHash = '',
  updatedAt = null,
} = {}) => {
  const source = cleanObject(balanceState)
  const benchmarks = cleanObject(source.benchmarks)
  const benchmarkVersions = {
    minutesDistribution:
      benchmarks.minutesDistribution?.benchmarkVersion || '',
    productionDistribution:
      benchmarks.productionDistribution?.benchmarkVersion || '',
    rotationDistribution:
      benchmarks.rotationDistribution?.benchmarkVersion || '',
  }
  const persistenceContractVersion = TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION
  const dependencyKey = buildBalanceDependencyKey({
    version: source.version,
    outputContractVersion: source.outputContractVersion,
    persistenceContractVersion,
    benchmarkVersions,
  })

  return {
    version: source.version || '',
    outputContractVersion: source.outputContractVersion || '',
    persistenceContractVersion,
    dependencyKey,
    source: {
      ...cleanObject(source.source),
      inputHash,
      updatedAt: source?.source?.updatedAt || null,
    },
    reliability: cleanObject(source.reliability),
    metrics: cleanObject(source.metrics),
    benchmarkVersions,
    benchmarks: {
      minutesDistribution: stripBenchmarkRange(
        benchmarks.minutesDistribution || {}
      ),
      productionDistribution: stripBenchmarkRange(
        benchmarks.productionDistribution || {}
      ),
      rotationDistribution: stripBenchmarkRange(
        benchmarks.rotationDistribution || {}
      ),
    },
    updatedAt,
  }
}

export const withTeamBalanceSnapshot = ({
  seasonDoc = {},
  teamDocument = {},
  seasonTarget = null,
} = {}) => {
  const inputHash = buildBalanceInputFingerprint(seasonDoc)
  const previousBalance = cleanObject(seasonDoc.teamBalance)
  const balanceState = buildTeamBalanceState({
    teamDocument,
    seasonDocument: seasonDoc,
    seasonTarget,
  })
  const candidateSnapshot = buildTeamBalanceDocumentSnapshot({
    balanceState,
    inputHash,
    updatedAt: null,
  })
  const sameDependency = clean(previousBalance.dependencyKey) ===
    clean(candidateSnapshot.dependencyKey)
  const sameInput = clean(previousBalance?.source?.inputHash) === inputHash

  if (sameDependency && sameInput && Object.keys(previousBalance).length > 0) {
    return {
      ...seasonDoc,
      teamBalance: {
        ...previousBalance,
        source: candidateSnapshot.source,
      },
    }
  }

  const updatedAt = new Date().toISOString()

  return {
    ...seasonDoc,
    teamBalance: buildTeamBalanceDocumentSnapshot({
      balanceState,
      inputHash,
      updatedAt,
    }),
  }
}
