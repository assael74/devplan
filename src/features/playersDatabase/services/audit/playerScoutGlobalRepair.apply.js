// src/features/playersDatabase/services/audit/playerScoutGlobalRepair.apply.js

import {
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
  playerDocRef,
} from '../write/players/playerDoc.model.js'
import {
  buildPlayerSeasonDoc,
  removePlayerSeasonRow,
} from '../write/players/playerSeason.model.js'
import {
  buildScoutingPlayerTracking,
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
} from '../write/players/scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from '../write/players/scoutingPlayerVerification.model.js'
import {
  buildPlayerScoutGlobalRepairPreview,
} from './playerScoutGlobalRepair.preview.js'
import {
  canDirectRepairSearchIndexIssue,
  repairSearchIndexIssuesDirect,
} from './playerScoutSearchIndex.directRepair.js'
import {
  verifySelectedPlayerScoutRepair,
} from './playerScoutRepair.verification.js'
import {
  buildPlayerScoutRepairSelection,
} from './playerScoutRepair.selection.js'
import {
  repairTeamDocument,
  applyPlayerScoutEngineRefresh,
  applyPlayerScoutRepair,
  buildPlayerScoutEngineRefreshPreview,
  buildPlayerScoutRepairPreview,
} from './playerScout.repair.js'

import { buildPlayerScoutSafeClassClosurePlan } from './playerScoutSafeClassClosurePlan.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const targetKey = target => `${clean(target?.collection)}::${clean(target?.documentId)}`

const buildVerificationCoverage = ({
  selectedIssueIds = [],
  verificationSelectedIssueIds = [],
  targetedVerification,
  attemptedUnverifiedIssueIds = [],
} = {}) => {
  const selected = unique(selectedIssueIds)
  const verificationExecuted = targetedVerification?.executed === true
  const verificationSelectionSet = new Set(unique(verificationSelectedIssueIds))
  const covered = verificationExecuted
    ? unique(targetedVerification?.coveredIssueIds)
        .filter(issueId => verificationSelectionSet.has(issueId))
    : []
  const coveredSet = new Set(covered)
  const remaining = verificationExecuted
    ? unique(targetedVerification?.remainingIssueIds)
        .filter(issueId => coveredSet.has(issueId))
    : []
  const remainingSet = new Set(remaining)
  const verified = covered.filter(issueId => !remainingSet.has(issueId))
  const unverified = selected.filter(issueId => !coveredSet.has(issueId))
  const selectedSet = new Set(selected)

  return {
    selectedIssueIds: selected,
    coveredIssueIds: covered,
    verifiedIssueIds: verified,
    remainingIssueIds: remaining,
    unverifiedIssueIds: unverified,
    attemptedUnverifiedIssueIds: unique(attemptedUnverifiedIssueIds)
      .filter(issueId => selectedSet.has(issueId) && !coveredSet.has(issueId)),
  }
}


const assertUsableGlobalRepairPreview = ({
  preview,
  actionLabel,
} = {}) => {
  if (preview?.valid === false) {
    const error = new Error(
      `${actionLabel} requires a valid preview: ${preview.reason || 'invalid'}`
    )
    error.code = preview.reason || 'PLAYER_SCOUT_GLOBAL_PREVIEW_INVALID'
    throw error
  }

  if (preview?.stale === true) {
    const error = new Error(
      `${actionLabel} requires a fresh preview before Firestore writes can run.`
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_PREVIEW_STALE'
    throw error
  }
}


const assertSelectedIssuesNotDeferred = ({
  preview,
  selectedIssueIds,
  actionLabel,
} = {}) => {
  const deferredIssueIdSet = new Set(unique(preview?.deferredIssueIds))
  if (!deferredIssueIdSet.size) return

  const blockedIssueIds = unique(selectedIssueIds).filter(issueId => (
    deferredIssueIdSet.has(issueId)
  ))
  if (!blockedIssueIds.length) return

  const error = new Error(
    `${actionLabel} cannot re-apply issues that are awaiting verification in the current session.`
  )
  error.code = 'PLAYER_SCOUT_GLOBAL_REPAIR_DEFERRED_ISSUES'
  error.issueIds = blockedIssueIds
  throw error
}

const isSafeDirectSearchIndexTarget = target => (
  clean(target?.collection) === 'searchIndexes' &&
  unique(target?.repairClasses).length === 1 &&
  unique(target?.repairClasses)[0] === 'directRepair'
)

const GLOBAL_SAFE_SELECTED_REPAIR_CLASSES = new Set([
  'directRepair',
  'engineRefresh',
  'migration',
  'regularRepair',
])

const isSafeSelectableGlobalTarget = target => {
  const repairClasses = unique(target?.repairClasses)

  return repairClasses.length === 1 &&
    GLOBAL_SAFE_SELECTED_REPAIR_CLASSES.has(repairClasses[0])
}

const issuesById = audit => new Map(
  (Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(issue => clean(issue?.issueId))
    .map(issue => [clean(issue.issueId), issue])
)

const buildSelectedIssuesByType = ({
  audit,
  selectedIssueIds,
} = {}) => {
  const issueMap = issuesById(audit)

  return unique(selectedIssueIds).reduce((result, issueId) => {
    const issue = issueMap.get(issueId)
    const type = clean(issue?.type || issue?.issueType || 'unknown')
    const current = result[type] || {
      count: 0,
      issueIds: [],
    }

    current.count += 1
    current.issueIds = unique([
      ...current.issueIds,
      issueId,
    ])
    result[type] = current
    return result
  }, {})
}

const collectSafeDirectSearchIndexIssues = ({
  audit,
  preview,
} = {}) => {
  const issueMap = issuesById(audit)
  const directIssueIds = unique(
    (Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : [])
      .filter(isSafeDirectSearchIndexTarget)
      .flatMap(target => target.issueIds)
  )

  return directIssueIds
    .map(issueId => issueMap.get(issueId))
    .filter(canDirectRepairSearchIndexIssue)
}

const normalizeMaxDocuments = ({
  maxDocuments,
  defaultValue = 5,
} = {}) => {
  if (maxDocuments === null) return null

  const parsed = Number(maxDocuments)
  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : defaultValue
}

const collectSafeClassPlan = ({
  preview,
  repairClass,
  maxDocuments = 5,
} = {}) => {
  const targetRepairClass = clean(repairClass)
  const deferredIssueIdSet = new Set(unique(preview?.deferredIssueIds))
  const targets = [
    ...(Array.isArray(preview?.targetDocuments?.teams)
      ? preview.targetDocuments.teams
      : []),
    ...(Array.isArray(preview?.targetDocuments?.players)
      ? preview.targetDocuments.players
      : []),
    ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : []),
  ]
  const actionableTargets = targets.filter(target => {
    const repairClasses = unique(target?.repairClasses)
    const issueIds = unique(target?.issueIds)

    return repairClasses.length === 1 &&
      repairClasses[0] === targetRepairClass &&
      issueIds.length > 0 &&
      !issueIds.some(issueId => deferredIssueIdSet.has(issueId))
  })
  const normalizedMaxDocuments = normalizeMaxDocuments({ maxDocuments })
  const selectedTargets = normalizedMaxDocuments === null
    ? actionableTargets
    : actionableTargets.slice(0, normalizedMaxDocuments)

  return {
    targets: selectedTargets,
    availableTargetsCount: actionableTargets.length,
    selectedIssueIds: unique(selectedTargets.flatMap(target => target.issueIds)),
  }
}


const collectSafeSelectableIssueIds = ({ preview } = {}) => unique(
  [
    ...(Array.isArray(preview?.targetDocuments?.teams)
      ? preview.targetDocuments.teams
      : []),
    ...(Array.isArray(preview?.targetDocuments?.players)
      ? preview.targetDocuments.players
      : []),
    ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : []),
  ]
    .filter(isSafeSelectableGlobalTarget)
    .flatMap(target => target.issueIds)
)

const collectSafeSelectedIssueIdsByRepairClass = ({
  preview,
  selectedIssueIds,
  repairClass,
} = {}) => {
  const requestedIssueIds = new Set(unique(selectedIssueIds))
  const targetRepairClass = clean(repairClass)

  return unique(
    [
      ...(Array.isArray(preview?.targetDocuments?.teams)
        ? preview.targetDocuments.teams
        : []),
      ...(Array.isArray(preview?.targetDocuments?.players)
        ? preview.targetDocuments.players
        : []),
      ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
        ? preview.targetDocuments.searchIndexes
        : []),
    ]
      .filter(target => (
        isSafeSelectableGlobalTarget(target) &&
        unique(target?.repairClasses)[0] === targetRepairClass
      ))
      .flatMap(target => target.issueIds)
      .filter(issueId => requestedIssueIds.has(clean(issueId)))
  )
}

const filterAuditByIssueIds = ({
  audit,
  selectedIssueIds,
} = {}) => {
  const selectedIssueIdSet = new Set(unique(selectedIssueIds))
  const matchesSelectedIssue = issue => selectedIssueIdSet.has(clean(issue?.issueId))

  return {
    ...audit,
    issues: (Array.isArray(audit?.issues) ? audit.issues : [])
      .filter(matchesSelectedIssue),
    auditIssues: (Array.isArray(audit?.auditIssues) ? audit.auditIssues : [])
      .filter(matchesSelectedIssue),
    migrationIssues: (
      Array.isArray(audit?.migrationIssues) ? audit.migrationIssues : []
    ).filter(matchesSelectedIssue),
    diagnostics: (Array.isArray(audit?.diagnostics) ? audit.diagnostics : [])
      .filter(matchesSelectedIssue),
  }
}

const assertSelectedIssuesAreSafe = ({
  preview,
  selectedIssueIds,
} = {}) => {
  const safeIssueIds = new Set(collectSafeSelectableIssueIds({ preview }))
  const requestedIssueIds = unique(selectedIssueIds)
  const unsafeIssueIds = requestedIssueIds.filter(issueId => !safeIssueIds.has(issueId))

  if (!unsafeIssueIds.length) return requestedIssueIds

  const error = new Error(
    'Global selected repair can only run on safe non-overlap Direct, Engine, Migration or Regular issues.'
  )
  error.code = 'PLAYER_SCOUT_GLOBAL_SELECTED_ISSUES_UNSAFE'
  error.issueIds = unsafeIssueIds
  throw error
}

const collectOverlapSelectableIssueEntries = ({ preview } = {}) => {
  const entries = []
  const targets = [
    ...(Array.isArray(preview?.targetDocuments?.teams)
      ? preview.targetDocuments.teams
      : []),
    ...(Array.isArray(preview?.targetDocuments?.players)
      ? preview.targetDocuments.players
      : []),
    ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : []),
  ]

  targets.forEach(target => {
    const repairClasses = unique(target?.repairClasses)
    if (repairClasses.length <= 1) return

    ;(Array.isArray(target?.rowTargets) ? target.rowTargets : []).forEach(rowTarget => {
      const issueId = clean(rowTarget?.issueId)
      const repairClass = clean(rowTarget?.repairClass)

      if (
        !issueId ||
        !GLOBAL_SAFE_SELECTED_REPAIR_CLASSES.has(repairClass)
      ) {
        return
      }

      entries.push({
        issueId,
        repairClass,
        documentKey: targetKey(target),
        collection: clean(target?.collection),
        documentId: clean(target?.documentId),
      })
    })
  })

  return entries
}

const SAFE_DEPENDENCY_OVERLAP_KEYS = new Set([
  'engineRefresh::migration',
  'engineRefresh::regularRepair',
  'migration::regularRepair',
])

const dependencyOverlapKey = repairClasses => unique(repairClasses)
  .sort()
  .join('::')

const collectSafeDependencyActionableTargets = ({ preview } = {}) => {
  const deferredIssueIdSet = new Set(unique(preview?.deferredIssueIds))
  const targets = Array.isArray(preview?.safeDependencyOverlapCandidates?.targets)
    ? preview.safeDependencyOverlapCandidates.targets
    : []

  return targets.filter(target => {
    const repairClasses = unique(target?.repairClasses)
    const issueIds = unique(target?.issueIds)

    return repairClasses.length === 2 &&
      SAFE_DEPENDENCY_OVERLAP_KEYS.has(dependencyOverlapKey(repairClasses)) &&
      issueIds.length > 0 &&
      !issueIds.some(issueId => deferredIssueIdSet.has(issueId))
  })
}

const buildSafeDependencyTargetComponents = ({
  preview,
  actionableTargets = [],
} = {}) => {
  const targets = Array.isArray(preview?.safeDependencyOverlapCandidates?.targets)
    ? preview.safeDependencyOverlapCandidates.targets
    : []
  const actionableTargetKeySet = new Set(actionableTargets.map(targetKey))
  const actionableTargetIndexes = []
  const actionableTargetIndexSet = new Set()
  const issueTargetIndexes = new Map()

  targets.forEach((target, targetIndex) => {
    unique(target?.issueIds).forEach(issueId => {
      if (!issueTargetIndexes.has(issueId)) {
        issueTargetIndexes.set(issueId, [])
      }
      issueTargetIndexes.get(issueId).push(targetIndex)
    })

    if (actionableTargetKeySet.has(targetKey(target))) {
      actionableTargetIndexes.push(targetIndex)
      actionableTargetIndexSet.add(targetIndex)
    }
  })

  const visitedTargetIndexes = new Set()
  const components = []

  actionableTargetIndexes.forEach(startTargetIndex => {
    if (visitedTargetIndexes.has(startTargetIndex)) return

    const pendingTargetIndexes = [startTargetIndex]
    const componentTargetIndexSet = new Set()
    let componentIsSafe = true

    while (pendingTargetIndexes.length > 0) {
      const targetIndex = pendingTargetIndexes.shift()
      if (componentTargetIndexSet.has(targetIndex)) continue

      componentTargetIndexSet.add(targetIndex)
      if (actionableTargetIndexSet.has(targetIndex)) {
        visitedTargetIndexes.add(targetIndex)
      } else {
        componentIsSafe = false
      }

      unique(targets[targetIndex]?.issueIds).forEach(issueId => {
        const linkedTargetIndexes = issueTargetIndexes.get(issueId) || []
        if (
          linkedTargetIndexes.length === 0 ||
          linkedTargetIndexes.some(index => !actionableTargetIndexSet.has(index))
        ) {
          componentIsSafe = false
        }

        linkedTargetIndexes.forEach(linkedTargetIndex => {
          if (!componentTargetIndexSet.has(linkedTargetIndex)) {
            pendingTargetIndexes.push(linkedTargetIndex)
          }
        })
      })
    }

    if (!componentIsSafe) return

    components.push({
      targets: actionableTargetIndexes
        .filter(index => componentTargetIndexSet.has(index))
        .map(index => targets[index]),
    })
  })

  return components
}

const buildSafeDependencyIssuePlan = ({
  preview,
  selectedTargets = [],
  availableTargetsCount = 0,
} = {}) => {
  const selectedIssueIds = unique(
    selectedTargets.flatMap(target => target.issueIds)
  )
  const entries = collectOverlapSelectableIssueEntries({ preview })
  const selectedIssueIdSet = new Set(selectedIssueIds)
  const selectedEntries = entries.filter(entry => (
    selectedIssueIdSet.has(entry.issueId)
  ))
  const engineIssueIds = unique(
    selectedEntries
      .filter(entry => entry.repairClass === 'engineRefresh')
      .map(entry => entry.issueId)
  )
  const engineIssueIdSet = new Set(engineIssueIds)
  const repairIssueIds = selectedIssueIds.filter(issueId => (
    !engineIssueIdSet.has(issueId)
  ))

  return {
    targets: selectedTargets,
    availableTargetsCount,
    selectedIssueIds,
    repairIssueIds,
    engineIssueIds,
  }
}

const describeSafeDependencyComponentIssues = ({
  audit,
  preview,
  plan,
} = {}) => {
  const issueIds = unique(plan?.selectedIssueIds)
  const issueIdSet = new Set(issueIds)
  const deferredIssueIdSet = new Set(unique(preview?.deferredIssueIds))
  const entriesByIssueId = collectOverlapSelectableIssueEntries({ preview })
    .filter(entry => issueIdSet.has(entry.issueId))
    .reduce((result, entry) => {
      const current = result.get(entry.issueId) || []
      current.push({
        repairClass: clean(entry.repairClass),
        documentKey: clean(entry.documentKey),
        collection: clean(entry.collection),
        documentId: clean(entry.documentId),
      })
      result.set(entry.issueId, current)
      return result
    }, new Map())
  const issuesById = new Map(
    (Array.isArray(audit?.issues) ? audit.issues : [])
      .filter(issue => issueIdSet.has(clean(issue?.issueId)))
      .map(issue => [clean(issue.issueId), issue])
  )

  return issueIds.map(issueId => {
    const issue = issuesById.get(issueId) || {}
    const entries = entriesByIssueId.get(issueId) || []

    return {
      issueId,
      type: clean(issue.type),
      repairType: clean(issue?.repair?.repairType),
      repairSelectable: issue?.repair?.selectable === true,
      repairable: issue?.repairable !== false,
      repairClasses: unique(entries.map(entry => entry.repairClass)),
      documentKeys: unique(entries.map(entry => entry.documentKey)),
      deferred: deferredIssueIdSet.has(issueId),
      playerDocumentId: clean(issue.playerDocumentId),
      teamDocumentId: clean(issue.teamDocumentId),
      searchIndexDocumentId: clean(issue.searchIndexDocumentId),
      seasonKey: clean(issue.seasonKey || issue.seasonId),
    }
  })
}

const normalizeWriteBudget = ({
  value,
  defaultValue,
} = {}) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : defaultValue
}

const validateSafeDependencyRepairSelection = ({
  audit,
  repairIssueIds,
} = {}) => {
  const selectedIssueIds = unique(repairIssueIds)
  if (!selectedIssueIds.length) return null

  try {
    buildPlayerScoutRepairSelection({
      audit,
      selectedIssueIds,
    })
    return null
  } catch (error) {
    return error
  }
}

const estimateSafeDependencyWriteFootprint = async ({
  audit,
  preview,
  plan,
} = {}) => {
  const repairIssueIdSet = new Set(unique(plan?.repairIssueIds))
  const repairEntries = collectOverlapSelectableIssueEntries({ preview })
    .filter(entry => (
      repairIssueIdSet.has(entry.issueId) &&
      entry.repairClass !== 'engineRefresh'
    ))
  const repairDocumentKeys = unique(
    repairEntries.map(entry => `${entry.collection}::${entry.documentId}`)
  )

  const repairPreview = plan?.repairIssueIds?.length
    ? await buildPlayerScoutRepairPreview({
        audit,
        selectedIssueIds: plan.repairIssueIds,
      })
    : null
  const repairWriteOperations = Number(
    repairPreview?.cost?.writes?.estimatedMax || 0
  )

  const engineAudit = plan?.engineIssueIds?.length
    ? filterAuditByIssueIds({
        audit,
        selectedIssueIds: plan.engineIssueIds,
      })
    : null
  const enginePreview = engineAudit
    ? buildPlayerScoutEngineRefreshPreview({ audit: engineAudit })
    : null

  const engineTeamIds = unique(
    (Array.isArray(enginePreview?.targets?.teams)
      ? enginePreview.targets.teams
      : []).map(target => target.teamDocumentId)
  )
  const enginePlayerIds = unique(
    (Array.isArray(enginePreview?.targets?.players)
      ? enginePreview.targets.players
      : []).map(target => target.playerDocumentId)
  )
  const engineSearchIds = unique(
    (Array.isArray(enginePreview?.targets?.searchIndexes)
      ? enginePreview.targets.searchIndexes
      : []).map(target => target.searchIndexDocumentId)
  )
  const engineDocumentKeys = unique([
    ...engineTeamIds.map(id => `teams::${id}`),
    ...enginePlayerIds.map(id => `players::${id}`),
    ...engineSearchIds.map(id => `searchIndexes::${id}`),
  ])
  const engineWriteOperations = Number(
    enginePreview?.cost?.writesMaximum || 0
  )

  const knownRepairDocuments = repairDocumentKeys.length
  const conservativeUnattributedRepairDocuments = Math.max(
    0,
    repairWriteOperations - knownRepairDocuments
  )
  const syntheticRepairKeys = Array.from(
    { length: conservativeUnattributedRepairDocuments },
    (_, index) => `repair-upper-bound::${index + 1}`
  )
  const estimatedUniqueDocumentKeys = unique([
    ...repairDocumentKeys,
    ...syntheticRepairKeys,
    ...engineDocumentKeys,
  ])

  const knownTeams = unique([
    ...repairEntries
      .filter(entry => entry.collection === 'teams')
      .map(entry => entry.documentId),
    ...engineTeamIds,
  ])
  const knownPlayers = unique([
    ...repairEntries
      .filter(entry => entry.collection === 'players')
      .map(entry => entry.documentId),
    ...enginePlayerIds,
  ])
  const knownSearchIndexes = unique([
    ...repairEntries
      .filter(entry => entry.collection === 'searchIndexes')
      .map(entry => entry.documentId),
    ...engineSearchIds,
  ])

  return {
    estimatedUniqueWriteDocuments: estimatedUniqueDocumentKeys.length,
    estimatedWriteOperations: repairWriteOperations + engineWriteOperations,
    breakdown: {
      uniqueDocuments: {
        total: estimatedUniqueDocumentKeys.length,
        teams: knownTeams.length,
        players: knownPlayers.length,
        searchIndexes: knownSearchIndexes.length,
        unattributedUpperBound: conservativeUnattributedRepairDocuments,
      },
      writeOperations: {
        total: repairWriteOperations + engineWriteOperations,
        repair: repairWriteOperations,
        engine: engineWriteOperations,
      },
      repair: {
        plannedTargetDocuments: repairDocumentKeys.length,
        plannedWriteOperationsUpperBound: repairWriteOperations,
      },
      engine: {
        teams: engineTeamIds.length,
        players: enginePlayerIds.length,
        searchIndexes: engineSearchIds.length,
        plannedWriteOperationsUpperBound: engineWriteOperations,
      },
    },
  }
}

const safeDependencyFailedBudgets = ({
  targetDocumentsCount,
  estimatedUniqueWriteDocuments,
  estimatedWriteOperations,
  maxDocuments,
  maxWriteDocuments,
  maxWriteOperations,
} = {}) => {
  const failed = []

  if (
    maxDocuments !== null &&
    Number(targetDocumentsCount || 0) > Number(maxDocuments || 0)
  ) {
    failed.push('maxDocuments')
  }
  if (
    Number(estimatedUniqueWriteDocuments || 0) >
    Number(maxWriteDocuments || 0)
  ) {
    failed.push('maxWriteDocuments')
  }
  if (
    Number(estimatedWriteOperations || 0) >
    Number(maxWriteOperations || 0)
  ) {
    failed.push('maxWriteOperations')
  }

  return failed
}

const safeDependencyComponentSummary = component => (
  component
    ? {
        componentIndex: component.componentIndex,
        targetDocumentsCount: component.targetDocumentsCount,
        issueIdsCount: component.issueIdsCount,
        estimatedUniqueWriteDocuments: component.estimatedUniqueWriteDocuments,
        estimatedWriteOperations: component.estimatedWriteOperations,
        failedBudgets: Array.isArray(component.failedBudgets)
          ? component.failedBudgets
          : [],
        skipReason: clean(component.skipReason),
        targetDocumentKeys: unique(component.targetDocumentKeys),
      }
    : null
)

const minSafeDependencyComponentBy = ({ components, valueOf } = {}) => {
  const candidates = (Array.isArray(components) ? components : [])
    .filter(component => (
      clean(component?.skipReason) !== 'repair_selection_not_actionable'
    ))

  return safeDependencyComponentSummary(
    candidates.reduce((best, component) => {
      if (!best) return component

      const bestValue = Number(valueOf(best))
      const componentValue = Number(valueOf(component))
      if (componentValue < bestValue) return component
      if (componentValue > bestValue) return best

      return Number(component.componentIndex || 0) <
        Number(best.componentIndex || 0)
        ? component
        : best
    }, null)
  )
}

const smallestSafeDependencyRunnableBudget = ({ components } = {}) => {
  const candidates = (Array.isArray(components) ? components : [])
    .filter(component => (
      clean(component?.skipReason) !== 'repair_selection_not_actionable'
    ))
  const component = candidates.reduce((best, candidate) => {
    if (!best) return candidate

    const bestBudget = Math.max(
      Number(best.targetDocumentsCount || 0),
      Number(best.estimatedUniqueWriteDocuments || 0),
      Number(best.estimatedWriteOperations || 0)
    )
    const candidateBudget = Math.max(
      Number(candidate.targetDocumentsCount || 0),
      Number(candidate.estimatedUniqueWriteDocuments || 0),
      Number(candidate.estimatedWriteOperations || 0)
    )
    if (candidateBudget < bestBudget) return candidate
    if (candidateBudget > bestBudget) return best

    return Number(candidate.componentIndex || 0) <
      Number(best.componentIndex || 0)
      ? candidate
      : best
  }, null)

  return component
    ? {
        componentIndex: component.componentIndex,
        requiredMaxDocuments: component.targetDocumentsCount,
        requiredMaxWriteDocuments: component.estimatedUniqueWriteDocuments,
        requiredMaxWriteOperations: component.estimatedWriteOperations,
      }
    : null
}

export const buildPlayerScoutSafeDependencyWriteBudgetPlan = async ({
  audit,
  preview,
  maxDocuments = 5,
  maxWriteDocuments = 80,
  maxWriteOperations = 150,
} = {}) => {
  if (!audit || audit.mode !== 'read-only') {
    throw new Error(
      'Safe dependency write budget plan requires a loaded full audit'
    )
  }
  if (!preview) {
    throw new Error(
      'Safe dependency write budget plan requires a global repair preview'
    )
  }

  const actionableTargets = collectSafeDependencyActionableTargets({ preview })
  const targetComponents = buildSafeDependencyTargetComponents({
    preview,
    actionableTargets,
  })
  const normalizedMaxDocuments = normalizeMaxDocuments({ maxDocuments })
  const normalizedMaxWriteDocuments = normalizeWriteBudget({
    value: maxWriteDocuments,
    defaultValue: 80,
  })
  const normalizedMaxWriteOperations = normalizeWriteBudget({
    value: maxWriteOperations,
    defaultValue: 150,
  })
  const selectedTargets = []
  let selectedPlan = buildSafeDependencyIssuePlan({
    preview,
    selectedTargets,
    availableTargetsCount: actionableTargets.length,
  })
  let selectedFootprint = await estimateSafeDependencyWriteFootprint({
    audit,
    preview,
    plan: selectedPlan,
  })
  const skippedByWriteBudget = []
  const componentDiagnostics = []

  for (const [componentIndex, component] of targetComponents.entries()) {
    if (
      normalizedMaxDocuments !== null &&
      selectedTargets.length >= normalizedMaxDocuments
    ) {
      break
    }

    const componentTargets = Array.isArray(component?.targets)
      ? component.targets
      : []
    const componentPlan = buildSafeDependencyIssuePlan({
      preview,
      selectedTargets: componentTargets,
      availableTargetsCount: actionableTargets.length,
    })
    const componentRepairSelectionError = validateSafeDependencyRepairSelection({
      audit,
      repairIssueIds: componentPlan.repairIssueIds,
    })
    const componentFootprint = componentRepairSelectionError
      ? {
          estimatedUniqueWriteDocuments: null,
          estimatedWriteOperations: null,
        }
      : await estimateSafeDependencyWriteFootprint({
          audit,
          preview,
          plan: componentPlan,
        })
    const componentBudgetFailures = componentRepairSelectionError
      ? []
      : safeDependencyFailedBudgets({
          targetDocumentsCount: componentTargets.length,
          estimatedUniqueWriteDocuments:
            componentFootprint.estimatedUniqueWriteDocuments,
          estimatedWriteOperations: componentFootprint.estimatedWriteOperations,
          maxDocuments: normalizedMaxDocuments,
          maxWriteDocuments: normalizedMaxWriteDocuments,
          maxWriteOperations: normalizedMaxWriteOperations,
        })
    const trialTargets = [...selectedTargets, ...componentTargets]
    const trialPlan = buildSafeDependencyIssuePlan({
      preview,
      selectedTargets: trialTargets,
      availableTargetsCount: actionableTargets.length,
    })
    const repairSelectionError = validateSafeDependencyRepairSelection({
      audit,
      repairIssueIds: trialPlan.repairIssueIds,
    })
    const componentDiagnostic = {
      componentIndex,
      targetDocumentKeys: unique(componentTargets.map(targetKey)),
      targetDocumentsCount: componentTargets.length,
      issueIdsCount: unique(componentPlan.selectedIssueIds).length,
      issueIds: unique(componentPlan.selectedIssueIds),
      repairIssueIds: unique(componentPlan.repairIssueIds),
      engineIssueIds: unique(componentPlan.engineIssueIds),
      issues: describeSafeDependencyComponentIssues({
        audit,
        preview,
        plan: componentPlan,
      }),
      estimatedUniqueWriteDocuments:
        componentFootprint.estimatedUniqueWriteDocuments,
      estimatedWriteOperations: componentFootprint.estimatedWriteOperations,
      failedBudgets: componentBudgetFailures,
      skipReason: '',
    }

    if (repairSelectionError) {
      componentDiagnostic.skipReason = 'repair_selection_not_actionable'
      componentDiagnostic.selectionError = {
        code: clean(repairSelectionError.code),
        message: repairSelectionError.message,
        issueId: clean(repairSelectionError.issueId),
        issueIds: unique(repairSelectionError.issueIds),
        repairType: clean(repairSelectionError.repairType),
      }
      componentDiagnostics.push(componentDiagnostic)
      skippedByWriteBudget.push({
        documentKey: componentTargets.map(targetKey).join(','),
        targetDocuments: componentTargets.length,
        reason: 'repair_selection_not_actionable',
        message: repairSelectionError.message,
        issueId: clean(repairSelectionError.issueId),
        issueIds: unique(repairSelectionError.issueIds),
        repairType: clean(repairSelectionError.repairType),
      })
      continue
    }

    const trialFootprint = await estimateSafeDependencyWriteFootprint({
      audit,
      preview,
      plan: trialPlan,
    })
    const fitsWriteBudget = (
      trialFootprint.estimatedUniqueWriteDocuments <= normalizedMaxWriteDocuments &&
      trialFootprint.estimatedWriteOperations <= normalizedMaxWriteOperations
    )
    const fitsDocumentBudget = (
      normalizedMaxDocuments === null ||
      trialTargets.length <= normalizedMaxDocuments
    )

    if (!fitsDocumentBudget || !fitsWriteBudget) {
      componentDiagnostic.skipReason = 'write_budget_exceeded'
      componentDiagnostic.failedBudgets = safeDependencyFailedBudgets({
        targetDocumentsCount: trialTargets.length,
        estimatedUniqueWriteDocuments:
          trialFootprint.estimatedUniqueWriteDocuments,
        estimatedWriteOperations: trialFootprint.estimatedWriteOperations,
        maxDocuments: normalizedMaxDocuments,
        maxWriteDocuments: normalizedMaxWriteDocuments,
        maxWriteOperations: normalizedMaxWriteOperations,
      })
      componentDiagnostics.push(componentDiagnostic)
      skippedByWriteBudget.push({
        documentKey: componentTargets.map(targetKey).join(','),
        targetDocuments: componentTargets.length,
        estimatedUniqueWriteDocuments: trialFootprint.estimatedUniqueWriteDocuments,
        estimatedWriteOperations: trialFootprint.estimatedWriteOperations,
      })
      continue
    }

    selectedTargets.push(...componentTargets)
    selectedPlan = trialPlan
    selectedFootprint = trialFootprint
    componentDiagnostic.skipReason = 'selected'
    componentDiagnostics.push(componentDiagnostic)
  }

  return {
    ...selectedPlan,
    selectedDependencyTargets: selectedTargets.length,
    maxDocuments: normalizedMaxDocuments,
    maxWriteDocuments: normalizedMaxWriteDocuments,
    maxWriteOperations: normalizedMaxWriteOperations,
    estimatedUniqueWriteDocuments: selectedFootprint.estimatedUniqueWriteDocuments,
    estimatedWriteOperations: selectedFootprint.estimatedWriteOperations,
    breakdown: selectedFootprint.breakdown,
    skippedByWriteBudget,
    skippedByWriteBudgetCount: skippedByWriteBudget.length,
    componentDiagnostics,
    smallestComponentByTargetCount: minSafeDependencyComponentBy({
      components: componentDiagnostics,
      valueOf: component => component.targetDocumentsCount,
    }),
    smallestComponentByWriteDocuments: minSafeDependencyComponentBy({
      components: componentDiagnostics,
      valueOf: component => component.estimatedUniqueWriteDocuments,
    }),
    smallestComponentByWriteOperations: minSafeDependencyComponentBy({
      components: componentDiagnostics,
      valueOf: component => component.estimatedWriteOperations,
    }),
    smallestRunnableIfBudgetRaised: smallestSafeDependencyRunnableBudget({
      components: componentDiagnostics,
    }),
  }
}

const assertSafeDependencyWriteBudget = ({ plan } = {}) => {
  if (
    plan?.maxDocuments !== null &&
    Number(plan?.selectedDependencyTargets || 0) >
    Number(plan?.maxDocuments || 0)
  ) {
    const error = new Error(
      'Global safe dependency repair exceeds the planned dependency document batch size.'
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_DEPENDENCY_DOCUMENT_BUDGET_EXCEEDED'
    throw error
  }

  if (
    Number(plan?.estimatedUniqueWriteDocuments || 0) >
    Number(plan?.maxWriteDocuments || 0)
  ) {
    const error = new Error(
      'Global safe dependency repair exceeds the planned unique write document budget.'
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_WRITE_DOCUMENT_BUDGET_EXCEEDED'
    throw error
  }

  if (
    Number(plan?.estimatedWriteOperations || 0) >
    Number(plan?.maxWriteOperations || 0)
  ) {
    const error = new Error(
      'Global safe dependency repair exceeds the planned write operation budget.'
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_WRITE_OPERATION_BUDGET_EXCEEDED'
    throw error
  }
}

const buildSafeDependencyExecutionTelemetry = ({
  plan,
  repairResult,
  engineRefreshResult,
  targetedVerification,
} = {}) => {
  const repairTeamDocumentIds = unique(repairResult?.teamDocumentIdsUpdated)
  const repairPlayerDocumentIds = unique(
    repairResult?.playerDocumentIdsWritten
  )
  const repairPlayerSchemaDocumentIds = unique(
    repairResult?.playerSchemaDocumentIdsUpdated
  )
  const repairSearchIndexDocumentIds = unique(
    repairResult?.searchIndexDocumentIdsWritten
  )
  const engineTeamDocumentIds = unique(
    (Array.isArray(engineRefreshResult?.teamResults)
      ? engineRefreshResult.teamResults
      : [])
      .filter(result => result?.updated === true)
      .map(result => result.teamDocumentId)
  )
  const enginePlayerDocumentIds = unique(
    (Array.isArray(engineRefreshResult?.playerResults)
      ? engineRefreshResult.playerResults
      : [])
      .filter(result => result?.updated === true)
      .map(result => result.playerDocumentId)
  )
  const engineSearchIndexDocumentIds = unique(
    (Array.isArray(engineRefreshResult?.searchIndexResults)
      ? engineRefreshResult.searchIndexResults
      : [])
      .filter(result => result?.updated === true)
      .map(result => result.searchIndexDocumentId)
  )
  const teamDocumentIds = unique([
    ...repairTeamDocumentIds,
    ...engineTeamDocumentIds,
  ])
  const playerDocumentIds = unique([
    ...repairPlayerDocumentIds,
    ...repairPlayerSchemaDocumentIds,
    ...enginePlayerDocumentIds,
  ])
  const searchIndexDocumentIds = unique([
    ...repairSearchIndexDocumentIds,
    ...engineSearchIndexDocumentIds,
  ])
  const uniqueDocumentKeys = unique([
    ...teamDocumentIds.map(documentId => `team::${documentId}`),
    ...playerDocumentIds.map(documentId => `player::${documentId}`),
    ...searchIndexDocumentIds.map(documentId => `searchIndex::${documentId}`),
  ])
  const repairWriteOperations = (
    Number(repairResult?.writeOperations?.teams || 0) +
    Number(repairResult?.writeOperations?.playerSchemas || 0) +
    Number(repairResult?.writeOperations?.players || 0) +
    Number(repairResult?.writeOperations?.searchIndexes || 0)
  )
  const engineWriteOperations = (
    engineTeamDocumentIds.length +
    enginePlayerDocumentIds.length +
    engineSearchIndexDocumentIds.length
  )

  return {
    dependencyTargetDocumentsSelected: Array.isArray(plan?.targets)
      ? plan.targets.length
      : 0,
    uniqueDocumentsWritten: {
      total: uniqueDocumentKeys.length,
      teams: teamDocumentIds.length,
      players: playerDocumentIds.length,
      searchIndexes: searchIndexDocumentIds.length,
    },
    writeOperations: {
      total: repairWriteOperations + engineWriteOperations,
      repair: repairWriteOperations,
      engine: engineWriteOperations,
    },
    verificationReads: Number(targetedVerification?.readsUsed || 0),
  }
}

const buildGlobalSafeExecutionTelemetry = ({
  targetDocumentsSelected = 0,
  repairResult,
  engineRefreshResult,
  targetedVerification,
} = {}) => {
  const repairTeamDocumentIds = unique(repairResult?.teamDocumentIdsUpdated)
  const repairPlayerDocumentIds = unique(repairResult?.playerDocumentIdsWritten)
  const repairPlayerSchemaDocumentIds = unique(
    repairResult?.playerSchemaDocumentIdsUpdated
  )
  const repairSearchIndexDocumentIds = unique(
    repairResult?.searchIndexDocumentIdsWritten
  )
  const engineTeamDocumentIds = unique(
    (Array.isArray(engineRefreshResult?.teamResults)
      ? engineRefreshResult.teamResults
      : [])
      .filter(result => result?.updated === true)
      .map(result => result.teamDocumentId)
  )
  const enginePlayerDocumentIds = unique(
    (Array.isArray(engineRefreshResult?.playerResults)
      ? engineRefreshResult.playerResults
      : [])
      .filter(result => result?.updated === true)
      .map(result => result.playerDocumentId)
  )
  const engineSearchIndexDocumentIds = unique(
    (Array.isArray(engineRefreshResult?.searchIndexResults)
      ? engineRefreshResult.searchIndexResults
      : [])
      .filter(result => result?.updated === true)
      .map(result => result.searchIndexDocumentId)
  )
  const teamDocumentIds = unique([
    ...repairTeamDocumentIds,
    ...engineTeamDocumentIds,
  ])
  const playerDocumentIds = unique([
    ...repairPlayerDocumentIds,
    ...repairPlayerSchemaDocumentIds,
    ...enginePlayerDocumentIds,
  ])
  const searchIndexDocumentIds = unique([
    ...repairSearchIndexDocumentIds,
    ...engineSearchIndexDocumentIds,
  ])
  const uniqueDocumentKeys = unique([
    ...teamDocumentIds.map(documentId => `team::${documentId}`),
    ...playerDocumentIds.map(documentId => `player::${documentId}`),
    ...searchIndexDocumentIds.map(documentId => `searchIndex::${documentId}`),
  ])
  const repairWriteOperations = (
    Number(repairResult?.writeOperations?.teams || 0) +
    Number(repairResult?.writeOperations?.playerSchemas || 0) +
    Number(repairResult?.writeOperations?.players || 0) +
    Number(repairResult?.writeOperations?.searchIndexes || 0)
  )
  const engineWriteOperations = (
    engineTeamDocumentIds.length +
    enginePlayerDocumentIds.length +
    engineSearchIndexDocumentIds.length
  )

  return {
    targetDocumentsSelected: Number(targetDocumentsSelected || 0),
    uniqueDocumentsWritten: {
      total: uniqueDocumentKeys.length,
      teams: teamDocumentIds.length,
      players: playerDocumentIds.length,
      searchIndexes: searchIndexDocumentIds.length,
    },
    writeOperations: {
      total: repairWriteOperations + engineWriteOperations,
      repair: repairWriteOperations,
      engine: engineWriteOperations,
    },
    verificationReads: Number(targetedVerification?.readsUsed || 0),
  }
}

const assertSelectedDocumentLimit = ({
  preview,
  selectedIssueIds,
  maxDocuments,
  actionLabel,
} = {}) => {
  if (maxDocuments === null) return

  const normalizedMaxDocuments = normalizeMaxDocuments({ maxDocuments })
  const selectedIssueIdSet = new Set(unique(selectedIssueIds))
  const selectedTargets = [
    ...(Array.isArray(preview?.targetDocuments?.teams)
      ? preview.targetDocuments.teams
      : []),
    ...(Array.isArray(preview?.targetDocuments?.players)
      ? preview.targetDocuments.players
      : []),
    ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : []),
  ].filter(target => (
    unique(target?.issueIds).some(issueId => selectedIssueIdSet.has(issueId))
  ))

  if (selectedTargets.length <= normalizedMaxDocuments) return

  const error = new Error(
    `${actionLabel} exceeds the allowed document batch size.`
  )
  error.code = 'PLAYER_SCOUT_GLOBAL_REPAIR_BATCH_LIMIT_EXCEEDED'
  error.maxDocuments = normalizedMaxDocuments
  error.selectedDocuments = selectedTargets.length
  throw error
}

const assertSelectedOverlapIssuesAreSingleRoutePerDocument = ({
  preview,
  selectedIssueIds,
} = {}) => {
  const requestedIssueIds = unique(selectedIssueIds)
  const selectableEntries = collectOverlapSelectableIssueEntries({ preview })
  const entriesByIssueId = selectableEntries.reduce((result, entry) => {
    const current = result.get(entry.issueId) || []
    current.push(entry)
    result.set(entry.issueId, current)
    return result
  }, new Map())
  const missingIssueIds = requestedIssueIds.filter(issueId => !entriesByIssueId.has(issueId))

  if (missingIssueIds.length) {
    const error = new Error(
      'Global overlap repair can only run on selectable overlap Direct, Engine, Migration or Regular issues.'
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_OVERLAP_ISSUES_UNSAFE'
    error.issueIds = missingIssueIds
    throw error
  }

  const selectedEntries = requestedIssueIds.flatMap(issueId => entriesByIssueId.get(issueId) || [])
  const classesByDocument = selectedEntries.reduce((result, entry) => {
    const current = result.get(entry.documentKey) || new Set()
    current.add(entry.repairClass)
    result.set(entry.documentKey, current)
    return result
  }, new Map())
  const mixedDocuments = [...classesByDocument.entries()]
    .filter(([, repairClasses]) => repairClasses.size > 1)
    .map(([documentKey, repairClasses]) => ({
      documentKey,
      repairClasses: [...repairClasses],
    }))

  if (mixedDocuments.length) {
    const error = new Error(
      'Global overlap repair cannot mix repair classes for the same document in one run.'
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_OVERLAP_MIXED_REPAIR_CLASSES'
    error.documents = mixedDocuments
    throw error
  }

  return requestedIssueIds
}

const normalizeComparableValue = value => {
  if (Array.isArray(value)) return value.map(normalizeComparableValue)

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        if (value[key] !== undefined) {
          result[key] = normalizeComparableValue(value[key])
        }
        return result
      }, {})
  }

  return value === undefined ? null : value
}

const stripTechnicalTimestamps = value => {
  if (!value || typeof value !== 'object') return value

  const next = {
    ...value,
  }

  delete next.updatedAt

  next.current = (Array.isArray(value.current) ? value.current : []).map(row => {
    const nextRow = { ...row }
    delete nextRow.updatedAt
    return nextRow
  })

  next.history = (Array.isArray(value.history) ? value.history : []).map(row => {
    const nextRow = { ...row }
    delete nextRow.updatedAt
    return nextRow
  })

  return next
}

const isDocumentUnchanged = ({ currentData = {}, nextData = {} } = {}) => (
  JSON.stringify(normalizeComparableValue(stripTechnicalTimestamps(currentData))) ===
  JSON.stringify(normalizeComparableValue(stripTechnicalTimestamps(nextData)))
)

const seasonKeyOf = value => clean(value?.seasonKey || value?.seasonId)

const teamDocumentIdOf = value => clean(
  value?.teamDocumentId ||
  value?.birthTeamDocumentId ||
  value?.teamId ||
  value?.birthTeamId
)

const playerDocumentIdOf = value => clean(
  value?.playerDocumentId ||
  value?.resolvedPlayerDocumentId ||
  buildPlayerDocumentId(value)
)

const playerIdentityKeys = value => unique([
  value?.playerDocumentId,
  value?.resolvedPlayerDocumentId,
  value?.playerId,
  value?.externalPlayerId,
  value?.identityKey,
  value?.normalizedName,
  value?.fullName,
])

const isSamePlayerTarget = ({ row, target }) => {
  const targetPlayerDocumentId = clean(target?.playerDocumentId)
  const rowPlayerDocumentId = playerDocumentIdOf(row)

  if (targetPlayerDocumentId && rowPlayerDocumentId) {
    return targetPlayerDocumentId === rowPlayerDocumentId
  }

  const targetKeys = new Set(playerIdentityKeys(target))
  return playerIdentityKeys(row).some(key => targetKeys.has(key))
}

const findAuditRowForRowTarget = ({ audit, rowTarget }) => {
  const rows = Array.isArray(audit?.recalculatedRows)
    ? audit.recalculatedRows
    : []

  return rows.find(row => (
    teamDocumentIdOf(row) === teamDocumentIdOf(rowTarget) &&
    seasonKeyOf(row) === seasonKeyOf(rowTarget) &&
    isSamePlayerTarget({ row, target: rowTarget })
  ))
}

export const resolveGlobalRepairRowsForTarget = ({ audit, target }) => {
  const rowTargets = Array.isArray(target?.rowTargets)
    ? target.rowTargets
    : []
  const rowsByKey = new Map()

  rowTargets.forEach(rowTarget => {
    const row = findAuditRowForRowTarget({ audit, rowTarget })
    if (!row) return

    const key = [
      clean(row.sourceTarget) || 'current',
      seasonKeyOf(row),
      playerDocumentIdOf(row) || clean(row.playerId || row.externalPlayerId),
    ].join('::')
    const current = rowsByKey.get(key) || {
      ...row,
      repairIssueTypes: [],
      globalIssueIds: [],
    }

    current.repairIssueTypes = unique([
      ...current.repairIssueTypes,
      rowTarget.type,
    ])
    current.globalIssueIds = unique([
      ...current.globalIssueIds,
      rowTarget.issueId,
    ])
    rowsByKey.set(key, current)
  })

  return [...rowsByKey.values()]
}

const targetScopeKeys = target => unique(
  (Array.isArray(target?.rowTargets) ? target.rowTargets : [])
    .map(rowTarget => [
      clean(rowTarget.teamDocumentId),
      seasonKeyOf(rowTarget),
    ].join('::'))
)

export const buildGlobalActualDocumentWritePreview = ({
  targetDocuments = {},
} = {}) => {
  const teams = Array.isArray(targetDocuments.teams) ? targetDocuments.teams : []
  const players = Array.isArray(targetDocuments.players) ? targetDocuments.players : []
  const searchIndexes = Array.isArray(targetDocuments.searchIndexes)
    ? targetDocuments.searchIndexes
    : []
  const playerTargetsWithMultipleScopes = players
    .map(target => ({
      collection: target.collection,
      documentId: target.documentId,
      scopes: targetScopeKeys(target),
      issueIds: unique(target.issueIds),
      issuesCount: Number(target.issuesCount || 0),
    }))
    .filter(target => target.scopes.length > 1)

  return {
    uniqueTeamWrites: teams.length,
    uniquePlayerWrites: players.length,
    uniqueSearchIndexWrites: searchIndexes.length,
    totalActualDocumentWrites: teams.length + players.length + searchIndexes.length,
    playerDocumentsWithMergedScopes: playerTargetsWithMultipleScopes.length,
    playerTargetsWithMultipleScopes,
    noDuplicateDocumentWrites: (
      new Set([
        ...teams,
        ...players,
        ...searchIndexes,
      ].map(targetKey)).size === teams.length + players.length + searchIndexes.length
    ),
  }
}

const assertNoGlobalRepairOverlaps = preview => {
  const overlaps = Array.isArray(preview?.duplicateWritePrevention?.overlaps)
    ? preview.duplicateWritePrevention.overlaps
    : []

  if (!overlaps.length) return

  const error = new Error(
    'Global repair apply is blocked because one or more documents require multiple repair classes.'
  )
  error.code = 'PLAYER_SCOUT_GLOBAL_APPLY_OVERLAPS_BLOCKED'
  error.overlaps = overlaps
  throw error
}

const assertNoDuplicateGlobalDocumentTargets = preview => {
  if (preview?.actualDocumentWrites?.noDuplicateDocumentWrites !== false) return

  const error = new Error(
    'Global repair apply is blocked because duplicate document targets were detected.'
  )
  error.code = 'PLAYER_SCOUT_GLOBAL_APPLY_DUPLICATE_DOCUMENT_TARGETS'
  throw error
}

export async function buildPlayerScoutGlobalApplyPreview({
  audit,
  globalPreview,
  selectedIssueIds,
} = {}) {
  const preview = globalPreview || await buildPlayerScoutGlobalRepairPreview({
    audit,
    selectedIssueIds,
  })

  return {
    ...preview,
    mode: 'global-apply-preview',
    actualDocumentWrites: buildGlobalActualDocumentWritePreview({
      targetDocuments: preview.targetDocuments,
    }),
    applyBlocked: Number(preview?.duplicateWritePrevention?.overlapsCount || 0) > 0,
    blockReason: Number(preview?.duplicateWritePrevention?.overlapsCount || 0) > 0
      ? 'overlapping_repair_classes'
      : '',
  }
}

export const buildMergedPlayerDocumentData = ({
  currentData = {},
  playerDocumentId = '',
  rows = [],
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const firstRow = safeRows[0] || {}
  const baseDoc = buildPlayerBaseDoc(
    {
      ...firstRow,
      playerDocumentId,
    },
    currentData,
    firstRow,
    firstRow
  )
  let nextCurrent = Array.isArray(baseDoc.current) ? [...baseDoc.current] : []
  let nextHistory = Array.isArray(baseDoc.history) ? [...baseDoc.history] : []
  const mergedScopes = []

  safeRows.forEach(row => {
    const target = clean(row.sourceTarget) === 'history' ||
      clean(row.storedSeasonStatus || row.seasonStatus) === 'completed'
      ? 'history'
      : 'current'
    const seasonDoc = buildPlayerSeasonDoc({
      season: {
        ...row,
        seasonStatus: target === 'history' ? 'completed' : 'active',
      },
      team: row,
      player: {
        ...row,
        playerDocumentId,
      },
    })

    nextCurrent = removePlayerSeasonRow({
      rows: nextCurrent,
      season: seasonDoc,
      team: row,
    })
    nextHistory = removePlayerSeasonRow({
      rows: nextHistory,
      season: seasonDoc,
      team: row,
    })

    if (target === 'history') {
      nextHistory.push(seasonDoc)
    } else {
      nextCurrent.push(seasonDoc)
    }

    mergedScopes.push([
      teamDocumentIdOf(row),
      seasonKeyOf(row),
    ].join('::'))
  })

  const trackingReasons = unique([
    ...(Array.isArray(baseDoc.tracking?.trackingReasons)
      ? baseDoc.tracking.trackingReasons
      : []),
    ...safeRows.flatMap(row => [
      ...(Array.isArray(row.expectedTrackingReasons) ? row.expectedTrackingReasons : []),
      ...(Array.isArray(row.computedTrackingReasons) ? row.computedTrackingReasons : []),
      ...resolvePlayerTrackingReasons(row),
    ]),
  ])
  const trackedAt = new Date().toISOString()
  const tracking = trackingReasons.reduce((currentTracking, reason) => (
    buildScoutingPlayerTracking({
      currentTracking,
      reason,
      trackedAt,
    })
  ), normalizeScoutingPlayerTracking(baseDoc.tracking))

  return {
    ...baseDoc,
    favorite: baseDoc.favorite === true || tracking.favorite === true,
    tracking,
    verification: normalizeScoutingPlayerVerification(currentData.verification),
    current: nextCurrent,
    history: nextHistory,
    updatedAt: serverTimestamp(),
    __globalRepairMeta: {
      mergedScopes: unique(mergedScopes),
      rowsMerged: safeRows.length,
    },
  }
}

const applyGlobalPlayerDocumentTarget = async ({ audit, target }) => {
  const playerDocumentId = clean(target?.documentId)
  if (!playerDocumentId) {
    return {
      skipped: true,
      reason: 'missingPlayerDocumentId',
    }
  }

  const rows = resolveGlobalRepairRowsForTarget({
    audit,
    target,
  })
  if (!rows.length) {
    return {
      playerDocumentId,
      skipped: true,
      reason: 'missingAuditRows',
    }
  }

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const nextDataWithMeta = buildMergedPlayerDocumentData({
      currentData,
      playerDocumentId,
      rows,
    })
    const {
      __globalRepairMeta,
      ...nextData
    } = nextDataWithMeta

    if (
      snapshot.exists() &&
      isDocumentUnchanged({
        currentData,
        nextData,
      })
    ) {
      return {
        playerDocumentId,
        updated: false,
        writeSkipped: true,
        rowsMerged: __globalRepairMeta.rowsMerged,
        mergedScopes: __globalRepairMeta.mergedScopes,
      }
    }

    transaction.set(ref, nextData, { merge: true })

    return {
      playerDocumentId,
      updated: true,
      created: !snapshot.exists(),
      rowsMerged: __globalRepairMeta.rowsMerged,
      mergedScopes: __globalRepairMeta.mergedScopes,
    }
  }, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    action: 'playerScoutGlobalRepair-updatePlayer',
    operationSubtype: 'maintenance-transaction',
  })
}

const applyGlobalTeamDocumentTarget = async ({ audit, target }) => {
  const teamDocumentId = clean(target?.documentId)
  const rows = resolveGlobalRepairRowsForTarget({
    audit,
    target,
  })

  if (!teamDocumentId || !rows.length) {
    return {
      teamDocumentId,
      skipped: true,
      reason: !teamDocumentId ? 'missingTeamDocumentId' : 'missingAuditRows',
    }
  }

  return repairTeamDocument({
    teamDocumentId,
    rows,
  })
}

export async function applyPlayerScoutGlobalRepair({
  confirmed = false,
  audit,
  globalPreview,
  selectedIssueIds,
} = {}) {
  if (!confirmed) {
    throw new Error('Global player scout repair requires explicit confirmation')
  }

  const preview = await buildPlayerScoutGlobalApplyPreview({
    audit,
    globalPreview,
    selectedIssueIds,
  })

  assertUsableGlobalRepairPreview({
    preview,
    actionLabel: 'Global player scout repair',
  })
  assertNoGlobalRepairOverlaps(preview)
  assertNoDuplicateGlobalDocumentTargets(preview)

  const targetDocuments = preview.targetDocuments || {}
  const teamTargets = Array.isArray(targetDocuments.teams)
    ? targetDocuments.teams
    : []
  const playerTargets = Array.isArray(targetDocuments.players)
    ? targetDocuments.players
    : []
  const searchIndexTargets = Array.isArray(targetDocuments.searchIndexes)
    ? targetDocuments.searchIndexes
    : []

  if (searchIndexTargets.length) {
    const error = new Error(
      'Global SearchIndex apply requires an explicit document-level merge policy before it can run.'
    )
    error.code = 'PLAYER_SCOUT_GLOBAL_SEARCH_INDEX_APPLY_NOT_READY'
    error.targets = searchIndexTargets.map(target => ({
      documentId: target.documentId,
      issueIds: target.issueIds,
    }))
    throw error
  }

  const teamResults = []
  const playerResults = []

  for (const target of teamTargets) {
    teamResults.push(await applyGlobalTeamDocumentTarget({
      audit,
      target,
    }))
  }

  for (const target of playerTargets) {
    playerResults.push(await applyGlobalPlayerDocumentTarget({
      audit,
      target,
    }))
  }

  const selectedGlobalIssueIds = unique(
    preview?.selectedIssuesSummary?.selectedIssueIds
  )

  return {
    generatedAt: new Date().toISOString(),
    mode: 'global-apply',
    actualDocumentWrites: preview.actualDocumentWrites,
    teamResults,
    playerResults,
    searchIndexResults: [],
    verificationCoverage: buildVerificationCoverage({
      selectedIssueIds: selectedGlobalIssueIds,
    }),
    summary: {
      teamDocumentsUpdated: teamResults.filter(result => result.updated).length,
      playerDocumentsUpdated: playerResults.filter(result => result.updated).length,
      playerDocumentsCreated: playerResults.filter(result => result.created).length,
      writesPerformed:
        teamResults.filter(result => result.updated).length +
        playerResults.filter(result => result.updated).length,
      skipped:
        teamResults.filter(result => result.skipped || result.writeSkipped).length +
        playerResults.filter(result => result.skipped || result.writeSkipped).length,
    },
  }
}

export async function applyPlayerScoutGlobalDirectSearchIndexRepair({
  confirmed = false,
  audit,
  globalPreview,
  verifySelected = true,
} = {}) {
  if (!confirmed) {
    throw new Error('Global direct SearchIndex repair requires explicit confirmation')
  }
  if (!audit || audit.mode !== 'read-only') {
    throw new Error('Global direct SearchIndex repair requires a loaded full audit')
  }

  const preview = globalPreview || await buildPlayerScoutGlobalRepairPreview({
    audit,
  })
  assertUsableGlobalRepairPreview({
    preview,
    actionLabel: 'Global direct SearchIndex repair',
  })

  const directIssues = collectSafeDirectSearchIndexIssues({
    audit,
    preview,
  })

  if (!directIssues.length) {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'global-direct-search-index-apply',
      selection: {
        mode: 'safe_direct_search_index',
        selectedIssueIds: [],
        selectedIssuesCount: 0,
      },
      directSearchIndex: {
        issuesCount: 0,
        reads: 0,
        writes: 0,
        updatedCount: 0,
        alreadyRepairedCount: 0,
        skippedCount: 0,
        results: [],
      },
      targetedVerification: {
        executed: false,
        reason: 'no_safe_direct_search_index_issues',
        verificationMode: 'NONE',
        selectedIssuesCount: 0,
        verifiedIssuesCount: 0,
        remainingIssuesCount: 0,
        remainingIssueIds: [],
        readsUsed: 0,
        failures: [],
      },
      verificationCoverage: buildVerificationCoverage(),
    }
  }

  const directSearchIndex = await repairSearchIndexIssuesDirect({
    issues: directIssues,
  })
  const targetedVerification = verifySelected
    ? await verifySelectedPlayerScoutRepair({
        selectedIssues: directIssues,
      })
    : {
        executed: false,
        reason: 'verification_disabled',
        verificationMode: 'NONE',
        selectedIssuesCount: directIssues.length,
        verifiedIssuesCount: 0,
        remainingIssuesCount: 0,
        remainingIssueIds: [],
        readsUsed: 0,
        failures: [],
      }

  return {
    generatedAt: new Date().toISOString(),
    mode: 'global-direct-search-index-apply',
    selection: {
      mode: 'safe_direct_search_index',
      selectedIssueIds: unique(directIssues.map(issue => issue.issueId)),
      selectedIssuesCount: directIssues.length,
    },
    directSearchIndex,
    targetedVerification,
    verificationCoverage: buildVerificationCoverage({
      selectedIssueIds: directIssues.map(issue => issue.issueId),
      verificationSelectedIssueIds: directIssues.map(issue => issue.issueId),
      targetedVerification,
    }),
    summary: {
      searchIndexDocumentsUpdated: directSearchIndex.updatedCount,
      alreadyRepairedCount: directSearchIndex.alreadyRepairedCount,
      skippedCount: directSearchIndex.skippedCount,
      repairReads: directSearchIndex.reads,
      repairWrites: directSearchIndex.writes,
      verificationReads: targetedVerification.readsUsed,
      verifiedIssuesCount: targetedVerification.verifiedIssuesCount,
      remainingIssuesCount: targetedVerification.remainingIssuesCount,
    },
  }
}

export async function applyPlayerScoutGlobalRegularRepair({
  confirmed = false,
  audit,
  globalPreview,
  verifySelected = true,
  maxDocuments = 5,
} = {}) {
  if (!confirmed) {
    throw new Error('Global regular repair requires explicit confirmation')
  }
  if (!audit || audit.mode !== 'read-only') {
    throw new Error('Global regular repair requires a loaded full audit')
  }

  const preview = globalPreview || await buildPlayerScoutGlobalRepairPreview({
    audit,
  })
  assertUsableGlobalRepairPreview({
    preview,
    actionLabel: 'Global regular repair',
  })

  const plan = collectSafeClassPlan({
    preview,
    repairClass: 'regularRepair',
    maxDocuments,
  })
  const selectedIssueIds = plan.selectedIssueIds

  if (!selectedIssueIds.length) {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'global-regular-apply',
      selection: {
        mode: 'safe_regular_no_overlap',
        selectedIssueIds: [],
        selectedIssuesCount: 0,
      },
      skipped: true,
      reason: 'no_safe_regular_issues',
      verificationCoverage: buildVerificationCoverage(),
    }
  }

  let result = null
  let writesMayHaveStarted = false

  try {
    writesMayHaveStarted = true
    result = await applyPlayerScoutRepair({
      confirmed: true,
      audit,
      selectedIssueIds,
      verifySelected,
    })
  } catch (error) {
    if (writesMayHaveStarted && error && typeof error === 'object') {
      error.playerScoutGlobalRepairPostWriteFailure = true
    }
    throw error
  }

  const verificationCoverage = buildVerificationCoverage({
    selectedIssueIds,
    verificationSelectedIssueIds: result?.selection?.selectedIssueIds,
    targetedVerification: result?.targetedVerification,
  })
  const regularDiagnostics = {
    selectedIssueIds,
    selectedIssuesByType: buildSelectedIssuesByType({
      audit,
      selectedIssueIds,
    }),
    verificationCoverage: {
      coveredIssueIds: verificationCoverage.coveredIssueIds,
      verifiedIssueIds: verificationCoverage.verifiedIssueIds,
      remainingIssueIds: verificationCoverage.remainingIssueIds,
      unverifiedIssueIds: verificationCoverage.unverifiedIssueIds,
    },
    verificationFailures: Array.isArray(result?.targetedVerification?.failures)
      ? result.targetedVerification.failures
      : [],
    playerSchemaDiagnostics: Array.isArray(result?.playerSchemaDiagnostics)
      ? result.playerSchemaDiagnostics
      : [],
    writeSummary: {
      teamDocumentsUpdated: Number(result?.teamDocumentsUpdated || 0),
      teamDocumentIdsUpdated: unique(result?.teamDocumentIdsUpdated),
      playerDocumentsWritten: unique(result?.playerDocumentIdsWritten).length,
      playerDocumentIdsWritten: unique(result?.playerDocumentIdsWritten),
      searchIndexDocumentsWritten: unique(result?.searchIndexDocumentIdsWritten).length,
      searchIndexDocumentIdsWritten: unique(result?.searchIndexDocumentIdsWritten),
      writeOperations: result?.writeOperations || {},
    },
  }

  return {
    ...result,
    mode: 'global-regular-apply',
    selectedIssueIds,
    selectedIssuesByType: regularDiagnostics.selectedIssuesByType,
    regularDiagnostics,
    globalSelection: {
      mode: 'safe_regular_no_overlap',
      selectedIssueIds,
      selectedIssuesCount: selectedIssueIds.length,
    },
    verificationCoverage,
    executionTelemetry: buildGlobalSafeExecutionTelemetry({
      targetDocumentsSelected: plan.targets.length,
      repairResult: result,
      targetedVerification: result?.targetedVerification,
    }),
  }
}

export async function applyPlayerScoutGlobalSelectedSafeRepair({
  confirmed = false,
  audit,
  globalPreview,
  selectedIssueIds = [],
  repairClass = '',
  verifySelected = true,
  maxDocuments = 5,
} = {}) {
  if (!confirmed) {
    throw new Error('Global selected repair requires explicit confirmation')
  }
  if (!audit || audit.mode !== 'read-only') {
    throw new Error('Global selected repair requires a loaded full audit')
  }

  const preview = globalPreview || await buildPlayerScoutGlobalRepairPreview({
    audit,
  })
  assertUsableGlobalRepairPreview({
    preview,
    actionLabel: 'Global selected repair',
  })

  const targetRepairClass = clean(repairClass)
  const safeClassPlan = targetRepairClass
    ? buildPlayerScoutSafeClassClosurePlan({
        preview,
        repairClass: targetRepairClass,
        maxDocuments,
      })
    : null
  const effectiveSelectedIssueIds = safeClassPlan
    ? safeClassPlan.selectedIssueIds
    : selectedIssueIds

  assertSelectedIssuesNotDeferred({
    preview,
    selectedIssueIds: effectiveSelectedIssueIds,
    actionLabel: 'Global selected repair',
  })

  const safeSelectedIssueIds = assertSelectedIssuesAreSafe({
    preview,
    selectedIssueIds: effectiveSelectedIssueIds,
  })
  assertSelectedDocumentLimit({
    preview,
    selectedIssueIds: safeSelectedIssueIds,
    maxDocuments,
    actionLabel: 'Global selected repair',
  })

  if (!safeSelectedIssueIds.length) {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'global-selected-safe-apply',
      selection: {
        mode: 'safe_selected_no_overlap',
        selectedIssueIds: [],
        selectedIssuesCount: 0,
      },
      skipped: true,
      reason: 'no_selected_safe_issues',
      verificationCoverage: buildVerificationCoverage(),
    }
  }

  const engineIssueIds = collectSafeSelectedIssueIdsByRepairClass({
    preview,
    selectedIssueIds: safeSelectedIssueIds,
    repairClass: 'engineRefresh',
  })
  const engineIssueIdSet = new Set(engineIssueIds)
  const repairIssueIds = safeSelectedIssueIds.filter(issueId => (
    !engineIssueIdSet.has(issueId)
  ))
  let repairResult = null
  let engineRefreshResult = null
  let writesMayHaveStarted = false

  try {
    if (repairIssueIds.length) {
      writesMayHaveStarted = true
      repairResult = await applyPlayerScoutRepair({
        confirmed: true,
        audit,
        selectedIssueIds: repairIssueIds,
        verifySelected,
      })
    }

    if (engineIssueIds.length) {
      writesMayHaveStarted = true
      engineRefreshResult = await applyPlayerScoutEngineRefresh({
        confirmed: true,
        audit: filterAuditByIssueIds({
          audit,
          selectedIssueIds: engineIssueIds,
        }),
      })
    }
  } catch (error) {
    if (writesMayHaveStarted && error && typeof error === 'object') {
      error.playerScoutGlobalRepairPostWriteFailure = true
    }
    throw error
  }
  const engineSummary = engineRefreshResult?.summary || {}
  const repairSummary = repairResult?.summary || {}
  const teamDocumentsUpdated = Number(
    repairResult?.teamDocumentsUpdated ||
    repairSummary.teamDocumentsUpdated ||
    0
  ) + Number(engineSummary.teamDocumentsUpdated || 0)
  const playerDocumentsUpdated = Number(
    repairResult?.playerDocumentsUpdated ||
    repairSummary.playerDocumentsUpdated ||
    0
  ) + Number(engineSummary.playerDocumentsUpdated || 0)
  const searchIndexRowsUpdated = Number(
    repairResult?.searchIndexRowsUpdated ||
    repairSummary.searchIndexDocumentsUpdated ||
    0
  ) + Number(engineSummary.searchIndexesUpdated || 0)

  return {
    ...(repairResult || {}),
    mode: 'global-selected-safe-apply',
    globalSelection: {
      mode: 'safe_selected_no_overlap',
      selectedIssueIds: safeSelectedIssueIds,
      selectedIssuesCount: safeSelectedIssueIds.length,
      repairIssueIds,
      engineIssueIds,
      repairClass: targetRepairClass,
      targetDocumentsSelected: safeClassPlan
        ? safeClassPlan.targets.length
        : null,
      availableTargetDocuments: safeClassPlan
        ? safeClassPlan.availableTargetsCount
        : null,
    },
    verificationCoverage: buildVerificationCoverage({
      selectedIssueIds: safeSelectedIssueIds,
      verificationSelectedIssueIds: repairResult?.selection?.selectedIssueIds,
      targetedVerification: repairResult?.targetedVerification,
      attemptedUnverifiedIssueIds: engineRefreshResult ? engineIssueIds : [],
    }),
    engineRefreshResult,
    teamDocumentsUpdated,
    playerDocumentsUpdated,
    searchIndexRowsUpdated,
    playerDocumentsCreated: Number(
      repairResult?.playerDocumentsCreated ||
      repairSummary.playerDocumentsCreated ||
      0
    ),
    executionTelemetry: buildGlobalSafeExecutionTelemetry({
      targetDocumentsSelected: safeClassPlan
        ? safeClassPlan.targets.length
        : [
            ...(Array.isArray(preview?.targetDocuments?.teams)
              ? preview.targetDocuments.teams
              : []),
            ...(Array.isArray(preview?.targetDocuments?.players)
              ? preview.targetDocuments.players
              : []),
            ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
              ? preview.targetDocuments.searchIndexes
              : []),
          ].filter(target => (
            unique(target?.issueIds).some(issueId => (
              new Set(safeSelectedIssueIds).has(issueId)
            ))
          )).length,
      repairResult,
      engineRefreshResult,
      targetedVerification: repairResult?.targetedVerification,
    }),
    summary: {
      ...(repairSummary || {}),
      teamDocumentsUpdated,
      teamPlayerStatesUpdated: Number(engineSummary.teamPlayerStatesUpdated || 0),
      playerDocumentsUpdated,
      playerSeasonsUpdated: Number(engineSummary.playerSeasonsUpdated || 0),
      searchIndexesUpdated: Number(engineSummary.searchIndexesUpdated || 0),
      repairIssuesCount: repairIssueIds.length,
      engineIssuesCount: engineIssueIds.length,
    },
  }
}

export async function applyPlayerScoutGlobalSafeDependencyOverlapRepair({
  confirmed = false,
  audit,
  globalPreview,
  verifySelected = true,
  maxDocuments = 5,
  maxWriteDocuments = 80,
  maxWriteOperations = 150,
} = {}) {
  if (!confirmed) {
    throw new Error('Global safe dependency overlap repair requires explicit confirmation')
  }
  if (!audit || audit.mode !== 'read-only') {
    throw new Error(
      'Global safe dependency overlap repair requires a loaded full audit'
    )
  }

  const preview = globalPreview || await buildPlayerScoutGlobalRepairPreview({
    audit,
  })
  assertUsableGlobalRepairPreview({
    preview,
    actionLabel: 'Global safe dependency overlap repair',
  })

  const plan = await buildPlayerScoutSafeDependencyWriteBudgetPlan({
    audit,
    preview,
    maxDocuments,
    maxWriteDocuments,
    maxWriteOperations,
  })
  assertSafeDependencyWriteBudget({ plan })

  if (!plan.selectedIssueIds.length) {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'global-safe-dependency-overlap-apply',
      globalSelection: {
        mode: 'safe_dependency_overlap',
        selectedIssueIds: [],
        selectedIssuesCount: 0,
        repairIssueIds: [],
        engineIssueIds: [],
        targetDocumentsCount: 0,
        availableTargetDocumentsCount: plan.availableTargetsCount,
      },
      skipped: true,
      reason: plan.skippedByWriteBudgetCount
        ? 'no_safe_dependency_overlap_issues_within_write_budget'
        : 'no_safe_dependency_overlap_issues',
      writeBudgetPlan: plan,
      verificationCoverage: buildVerificationCoverage(),
    }
  }

  assertSelectedIssuesNotDeferred({
    preview,
    selectedIssueIds: plan.selectedIssueIds,
    actionLabel: 'Global safe dependency overlap repair',
  })

  let repairResult = null
  let engineRefreshResult = null
  let targetedVerification = null
  let writesMayHaveStarted = false

  try {
    if (plan.repairIssueIds.length) {
      writesMayHaveStarted = true
      repairResult = await applyPlayerScoutRepair({
        confirmed: true,
        audit,
        selectedIssueIds: plan.repairIssueIds,
        verifySelected: false,
      })
    }

    if (plan.engineIssueIds.length) {
      writesMayHaveStarted = true
      engineRefreshResult = await applyPlayerScoutEngineRefresh({
        confirmed: true,
        audit: filterAuditByIssueIds({
          audit,
          selectedIssueIds: plan.engineIssueIds,
        }),
      })
    }

    const issueMap = issuesById(audit)
    const verificationIssues = plan.repairIssueIds
      .map(issueId => issueMap.get(issueId))
      .filter(Boolean)

    targetedVerification = (
      verifySelected !== false &&
      verificationIssues.length
    )
      ? await verifySelectedPlayerScoutRepair({
          selectedIssues: verificationIssues,
        })
      : {
          executed: false,
          reason: verifySelected === false
            ? 'verification_disabled'
            : 'no_repair_issues_to_verify',
          verificationMode: 'NONE',
          selectedIssuesCount: verificationIssues.length,
          verifiedIssuesCount: 0,
          remainingIssuesCount: 0,
          remainingIssueIds: [],
          readsUsed: 0,
          failures: [],
        }
  } catch (error) {
    if (writesMayHaveStarted && error && typeof error === 'object') {
      error.playerScoutGlobalRepairPostWriteFailure = true
    }
    throw error
  }

  const engineSummary = engineRefreshResult?.summary || {}
  const repairSummary = repairResult?.summary || {}
  const teamDocumentsUpdated = Number(
    repairResult?.teamDocumentsUpdated ||
    repairSummary.teamDocumentsUpdated ||
    0
  ) + Number(engineSummary.teamDocumentsUpdated || 0)
  const playerDocumentsUpdated = Number(
    repairResult?.playerDocumentsUpdated ||
    repairSummary.playerDocumentsUpdated ||
    0
  ) + Number(engineSummary.playerDocumentsUpdated || 0)
  const searchIndexRowsUpdated = Number(
    repairResult?.searchIndexRowsUpdated ||
    repairSummary.searchIndexDocumentsUpdated ||
    0
  ) + Number(engineSummary.searchIndexesUpdated || 0)

  return {
    ...(repairResult || {}),
    mode: 'global-safe-dependency-overlap-apply',
    globalSelection: {
      mode: 'safe_dependency_overlap',
      selectedIssueIds: plan.selectedIssueIds,
      selectedIssuesCount: plan.selectedIssueIds.length,
      repairIssueIds: plan.repairIssueIds,
      engineIssueIds: plan.engineIssueIds,
      targetDocumentsCount: plan.targets.length,
      availableTargetDocumentsCount: plan.availableTargetsCount,
    },
    targetedVerification,
    writeBudgetPlan: plan,
    verificationCoverage: buildVerificationCoverage({
      selectedIssueIds: plan.selectedIssueIds,
      verificationSelectedIssueIds: plan.repairIssueIds,
      targetedVerification,
      attemptedUnverifiedIssueIds: engineRefreshResult
        ? plan.engineIssueIds
        : [],
    }),
    engineRefreshResult,
    executionTelemetry: buildSafeDependencyExecutionTelemetry({
      plan,
      repairResult,
      engineRefreshResult,
      targetedVerification,
    }),
    teamDocumentsUpdated,
    playerDocumentsUpdated,
    searchIndexRowsUpdated,
    playerDocumentsCreated: Number(
      repairResult?.playerDocumentsCreated ||
      repairSummary.playerDocumentsCreated ||
      0
    ),
    summary: {
      ...(repairSummary || {}),
      teamDocumentsUpdated,
      teamPlayerStatesUpdated: Number(engineSummary.teamPlayerStatesUpdated || 0),
      playerDocumentsUpdated,
      playerSeasonsUpdated: Number(engineSummary.playerSeasonsUpdated || 0),
      searchIndexesUpdated: Number(engineSummary.searchIndexesUpdated || 0),
      repairIssuesCount: plan.repairIssueIds.length,
      engineIssuesCount: plan.engineIssueIds.length,
      dependencyDocumentsCount: plan.targets.length,
      availableDependencyDocumentsCount: plan.availableTargetsCount,
      verificationReads: Number(targetedVerification?.readsUsed || 0),
      verifiedIssuesCount: Number(targetedVerification?.verifiedIssuesCount || 0),
      remainingIssuesCount: Number(targetedVerification?.remainingIssuesCount || 0),
    },
  }
}

export async function applyPlayerScoutGlobalSelectedOverlapRepair({
  confirmed = false,
  audit,
  globalPreview,
  selectedIssueIds = [],
  verifySelected = true,
} = {}) {
  if (!confirmed) {
    throw new Error('Global overlap selected repair requires explicit confirmation')
  }
  if (!audit || audit.mode !== 'read-only') {
    throw new Error('Global overlap selected repair requires a loaded full audit')
  }

  const preview = globalPreview || await buildPlayerScoutGlobalRepairPreview({
    audit,
  })
  assertUsableGlobalRepairPreview({
    preview,
    actionLabel: 'Global overlap selected repair',
  })

  assertSelectedIssuesNotDeferred({
    preview,
    selectedIssueIds,
    actionLabel: 'Global overlap selected repair',
  })

  const overlapSelectedIssueIds = assertSelectedOverlapIssuesAreSingleRoutePerDocument({
    preview,
    selectedIssueIds,
  })

  if (!overlapSelectedIssueIds.length) {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'global-overlap-selected-apply',
      selection: {
        mode: 'overlap_selected_single_route_per_document',
        selectedIssueIds: [],
        selectedIssuesCount: 0,
      },
      skipped: true,
      reason: 'no_selected_overlap_issues',
      verificationCoverage: buildVerificationCoverage(),
    }
  }

  const result = await applyPlayerScoutRepair({
    confirmed: true,
    audit,
    selectedIssueIds: overlapSelectedIssueIds,
    verifySelected,
  })

  return {
    ...result,
    mode: 'global-overlap-selected-apply',
    globalSelection: {
      mode: 'overlap_selected_single_route_per_document',
      selectedIssueIds: overlapSelectedIssueIds,
      selectedIssuesCount: overlapSelectedIssueIds.length,
    },
    verificationCoverage: buildVerificationCoverage({
      selectedIssueIds: overlapSelectedIssueIds,
      verificationSelectedIssueIds: result?.selection?.selectedIssueIds,
      targetedVerification: result?.targetedVerification,
    }),
  }
}
