// src/features/playersDatabase/services/write/teams/teamBalanceSnapshot.js

import {
  adaptTeamBalanceInput,
} from '../../../domain/adapters/teamBalanceInput.adapter.js'
import { buildTeamBalanceState } from '../../../domain/orchestration/buildTeamBalanceState.js'
import {
  TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
  TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION,
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
  lineClassificationCoverage: {
    playersClassified: 0,
    playersTotal: 0,
    playersRate: 0,
    minutesClassified: 0,
    minutesTotal: 0,
    minutesRate: 0,
  },
  lineStructure: {
    minimumGames: 8,
    relevantPlayersCount: 0,
    loadedRelevantPlayersCount: 0,
    goalkeeperPlayersCount: 0,
    eligiblePlayersCount: 0,
    classifiedPlayersCount: 0,
    unclassifiedSufficientSamplePlayersCount: 0,
    insufficientSamplePlayersCount: 0,
    positions: {
      fullback: {
        playersCount: 0,
      },
      attackingMidfielder: {
        playersCount: 0,
      },
    },
    lines: {
      defense: {
        playersCount: 0,
      },
      midfield: {
        playersCount: 0,
      },
      attack: {
        playersCount: 0,
      },
    },
    composition: {
      midfieldCorePlayersCount: 0,
    },
  },
  balanceAvailability: {
    availability: '',
    availabilityReason: null,
  },
  lineupBenchmark: {
    definitionId: '',
    definitionVersion: '',
    availability: '',
    availabilityReason: null,
    metrics: {
      goalkeeper: { actual: 0, reference: 0, delta: null, state: '' },
      defense: { actual: 0, reference: 0, delta: null, state: '' },
      midfieldCore: { actual: 0, reference: 0, delta: null, state: '' },
      attackingMidfielder: { actual: 0, reference: 0, delta: null, state: '' },
      midfield: { actual: 0, reference: 0, delta: null, state: '' },
      attack: { actual: 0, reference: 0, delta: null, state: '' },
    },
  },
  classificationCoverageBenchmark: {
    definitionId: '',
    definitionVersion: '',
    availability: '',
    availabilityReason: null,
    actual: 0,
    typicalRange: { min: 0, max: 0 },
    state: '',
  },
  scoutInterpretation: {
    modelVersion: '',
    availability: '',
    availabilityReason: null,
    offense: {
      performanceLevel: '',
      performanceBand: '',
      benchmarkState: '',
      finding: null,
    },
    defense: {
      performanceLevel: '',
      performanceBand: '',
      benchmarkState: '',
      finding: null,
    },
    teamInterest: {
      isInteresting: false,
      lines: {
        offense: { isInteresting: false, reason: null },
        defense: { isInteresting: false, reason: null },
      },
      squad: { isInteresting: false, reason: null },
    },
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
        games: stats.games === undefined || stats.games === null ? null : stats.games,
        goals: stats.goals === undefined || stats.goals === null ? null : stats.goals,
        minutes: stats.minutes === undefined || stats.minutes === null ? null : stats.minutes,
        starts: stats.starts === undefined || stats.starts === null ? null : stats.starts,
        substituteIn: stats.substituteIn === undefined || stats.substituteIn === null ? null : stats.substituteIn,
        substitutedOut: stats.substitutedOut === undefined || stats.substitutedOut === null ? null : stats.substitutedOut,
        teamMinutes: stats.teamMinutes === undefined || stats.teamMinutes === null ? null : stats.teamMinutes,
        teamGames: stats.teamGames === undefined || stats.teamGames === null ? null : stats.teamGames,
        primaryPosition: player?.primaryPosition || '',
        positionLayer: player?.positionLayer || '',
        lineClassification: player?.lineClassification || null,
      }
    })
    .map(player => sortValue(player))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))

  const teamGamePlayed = seasonDoc?.teamStats?.teamGamePlayed ??
    seasonDoc?.teamStats?.gamesPlayed ??
    seasonDoc?.teamGamePlayed ??
    null

  return hashValue({ teamGamePlayed, players })
}


export const TEAM_BALANCE_SNAPSHOT_FORMAT = 'team-balance-summary-v14'

export const buildBalanceDependencyKey = ({
  version = '',
  outputContractVersion = '',
  persistenceContractVersion = '',
} = {}) => [
  TEAM_BALANCE_SNAPSHOT_FORMAT,
  clean(version),
  clean(outputContractVersion),
  clean(persistenceContractVersion),
].join('|')

export const buildCurrentTeamBalanceDependency = () => {
  const version = TEAM_BALANCE_VERSION
  const outputContractVersion = TEAM_BALANCE_OUTPUT_CONTRACT_VERSION
  const persistenceContractVersion = TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION

  return {
    snapshotFormat: TEAM_BALANCE_SNAPSHOT_FORMAT,
    version,
    outputContractVersion,
    persistenceContractVersion,
    dependencyKey: buildBalanceDependencyKey({
      version,
      outputContractVersion,
      persistenceContractVersion,
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

export const buildTeamBalanceDocumentSnapshot = ({
  balanceState,
  inputHash = '',
  updatedAt = null,
} = {}) => {
  const source = cleanObject(balanceState)
  const lineClassificationCoverage = cleanObject(source.lineClassificationCoverage)
  const lineStructure = cleanObject(source.lineStructure)
  const balanceAvailability = cleanObject(source.balanceAvailability)
  const lineupBenchmark = cleanObject(source.lineupBenchmark)
  const benchmarkMetrics = cleanObject(lineupBenchmark.metrics)
  const classificationCoverageBenchmark = cleanObject(source.classificationCoverageBenchmark)
  const scoutInterpretation = cleanObject(source.scoutInterpretation)
  const persistenceContractVersion = TEAM_BALANCE_PERSISTENCE_CONTRACT_VERSION
  const dependencyKey = buildBalanceDependencyKey({
    version: source.version,
    outputContractVersion: source.outputContractVersion,
    persistenceContractVersion,
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
    lineClassificationCoverage: {
      playersClassified: Number(lineClassificationCoverage.playersClassified) || 0,
      playersTotal: Number(lineClassificationCoverage.playersTotal) || 0,
      playersRate: Number(lineClassificationCoverage.playersRate) || 0,
      minutesClassified: Number(lineClassificationCoverage.minutesClassified) || 0,
      minutesTotal: Number(lineClassificationCoverage.minutesTotal) || 0,
      minutesRate: Number(lineClassificationCoverage.minutesRate) || 0,
    },
    lineStructure: {
      minimumGames: Number(lineStructure.minimumGames) || 0,
      relevantPlayersCount: Number(lineStructure.relevantPlayersCount) || 0,
      loadedRelevantPlayersCount: Number(lineStructure.loadedRelevantPlayersCount) || 0,
      goalkeeperPlayersCount: Number(lineStructure.goalkeeperPlayersCount) || 0,
      eligiblePlayersCount: Number(lineStructure.eligiblePlayersCount) || 0,
      classifiedPlayersCount: Number(lineStructure.classifiedPlayersCount) || 0,
      unclassifiedSufficientSamplePlayersCount: Number(lineStructure.unclassifiedSufficientSamplePlayersCount) || 0,
      insufficientSamplePlayersCount: Number(lineStructure.insufficientSamplePlayersCount) || 0,
      positions: {
        fullback: {
          playersCount: Number(lineStructure.positions?.fullback?.playersCount) || 0,
        },
        attackingMidfielder: {
          playersCount: Number(lineStructure.positions?.attackingMidfielder?.playersCount) || 0,
        },
      },
      lines: {
        defense: {
          playersCount: Number(lineStructure.lines?.defense?.playersCount) || 0,
        },
        midfield: {
          playersCount: Number(lineStructure.lines?.midfield?.playersCount) || 0,
        },
        attack: {
          playersCount: Number(lineStructure.lines?.attack?.playersCount) || 0,
        },
      },
      composition: {
        midfieldCorePlayersCount: Number(lineStructure.composition?.midfieldCorePlayersCount) || 0,
      },
    },
    balanceAvailability: {
      availability: clean(balanceAvailability.availability),
      availabilityReason: clean(balanceAvailability.availabilityReason) || null,
    },
    lineupBenchmark: {
      definitionId: clean(lineupBenchmark.definitionId),
      definitionVersion: clean(lineupBenchmark.definitionVersion),
      availability: clean(lineupBenchmark.availability),
      availabilityReason: clean(lineupBenchmark.availabilityReason) || null,
      metrics: Object.keys(TEAM_BALANCE_SNAPSHOT_SHAPE.lineupBenchmark.metrics)
        .reduce((result, key) => {
          const metric = cleanObject(benchmarkMetrics[key])
          return {
            ...result,
            [key]: {
              actual: Number(metric.actual) || 0,
              reference: Number(metric.reference) || 0,
              delta: Number.isFinite(Number(metric.delta)) ? Number(metric.delta) : null,
              state: clean(metric.state),
            },
          }
        }, {}),
    },
    classificationCoverageBenchmark: {
      definitionId: clean(classificationCoverageBenchmark.definitionId),
      definitionVersion: clean(classificationCoverageBenchmark.definitionVersion),
      availability: clean(classificationCoverageBenchmark.availability),
      availabilityReason: clean(classificationCoverageBenchmark.availabilityReason) || null,
      actual: Number(classificationCoverageBenchmark.actual) || 0,
      typicalRange: {
        min: Number(classificationCoverageBenchmark.typicalRange?.min) || 0,
        max: Number(classificationCoverageBenchmark.typicalRange?.max) || 0,
      },
      state: clean(classificationCoverageBenchmark.state),
    },
    scoutInterpretation: {
      modelVersion: clean(scoutInterpretation.modelVersion),
      availability: clean(scoutInterpretation.availability),
      availabilityReason: clean(scoutInterpretation.availabilityReason) || null,
      offense: {
        performanceLevel: clean(scoutInterpretation.offense?.performanceLevel),
        performanceBand: clean(scoutInterpretation.offense?.performanceBand),
        benchmarkState: clean(scoutInterpretation.offense?.benchmarkState),
        finding: clean(scoutInterpretation.offense?.finding) || null,
      },
      defense: {
        performanceLevel: clean(scoutInterpretation.defense?.performanceLevel),
        performanceBand: clean(scoutInterpretation.defense?.performanceBand),
        benchmarkState: clean(scoutInterpretation.defense?.benchmarkState),
        finding: clean(scoutInterpretation.defense?.finding) || null,
      },
      teamInterest: {
        isInteresting: Boolean(scoutInterpretation.teamInterest?.isInteresting),
        lines: {
          offense: {
            isInteresting: Boolean(scoutInterpretation.teamInterest?.lines?.offense?.isInteresting),
            reason: clean(scoutInterpretation.teamInterest?.lines?.offense?.reason) || null,
          },
          defense: {
            isInteresting: Boolean(scoutInterpretation.teamInterest?.lines?.defense?.isInteresting),
            reason: clean(scoutInterpretation.teamInterest?.lines?.defense?.reason) || null,
          },
        },
        squad: {
          isInteresting: Boolean(scoutInterpretation.teamInterest?.squad?.isInteresting),
          reason: clean(scoutInterpretation.teamInterest?.squad?.reason) || null,
        },
      },
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
