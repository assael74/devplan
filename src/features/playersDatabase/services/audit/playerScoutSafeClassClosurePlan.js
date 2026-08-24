// src/features/playersDatabase/services/audit/playerScoutSafeClassClosurePlan.js

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

export const buildPlayerScoutSafeClassClosurePlan = ({
  preview,
  repairClass,
  maxDocuments = 5,
} = {}) => {
  const targetRepairClass = clean(repairClass)
  const deferredIssueIdSet = new Set(unique(preview?.deferredIssueIds))
  const allTargets = [
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
  const actionableTargetIndexes = []
  const actionableTargetIndexSet = new Set()
  const issueTargetIndexes = new Map()

  allTargets.forEach((target, targetIndex) => {
    unique(target?.issueIds).forEach(issueId => {
      if (!issueTargetIndexes.has(issueId)) {
        issueTargetIndexes.set(issueId, [])
      }
      issueTargetIndexes.get(issueId).push(targetIndex)
    })

    const repairClasses = unique(target?.repairClasses)
    const issueIds = unique(target?.issueIds)
    const actionable = repairClasses.length === 1 &&
      repairClasses[0] === targetRepairClass &&
      issueIds.length > 0 &&
      !issueIds.some(issueId => deferredIssueIdSet.has(issueId))

    if (actionable) {
      actionableTargetIndexes.push(targetIndex)
      actionableTargetIndexSet.add(targetIndex)
    }
  })

  const visitedTargetIndexes = new Set()
  const safeComponents = []

  actionableTargetIndexes.forEach(startTargetIndex => {
    if (visitedTargetIndexes.has(startTargetIndex)) return

    const pendingTargetIndexes = [startTargetIndex]
    const componentTargetIndexSet = new Set()
    const componentIssueIdSet = new Set()
    let componentIsSafe = true

    while (pendingTargetIndexes.length > 0) {
      const targetIndex = pendingTargetIndexes.shift()
      if (componentTargetIndexSet.has(targetIndex)) continue

      componentTargetIndexSet.add(targetIndex)
      visitedTargetIndexes.add(targetIndex)

      if (!actionableTargetIndexSet.has(targetIndex)) {
        componentIsSafe = false
        continue
      }

      unique(allTargets[targetIndex]?.issueIds).forEach(issueId => {
        componentIssueIdSet.add(issueId)

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

    safeComponents.push({
      targetIndexes: actionableTargetIndexes.filter(index => (
        componentTargetIndexSet.has(index)
      )),
      issueIds: unique([...componentIssueIdSet]),
    })
  })

  const normalizedMaxDocuments = normalizeMaxDocuments({ maxDocuments })
  const selectedTargetIndexSet = new Set()
  const selectedIssueIdSet = new Set()

  safeComponents.forEach(component => {
    const nextTargetIndexes = component.targetIndexes.filter(index => (
      !selectedTargetIndexSet.has(index)
    ))
    const nextDocumentsCount = selectedTargetIndexSet.size + nextTargetIndexes.length

    if (
      normalizedMaxDocuments !== null &&
      nextDocumentsCount > normalizedMaxDocuments
    ) {
      return
    }

    component.targetIndexes.forEach(index => selectedTargetIndexSet.add(index))
    component.issueIds.forEach(issueId => selectedIssueIdSet.add(issueId))
  })

  const selectedTargets = actionableTargetIndexes
    .filter(targetIndex => selectedTargetIndexSet.has(targetIndex))
    .map(targetIndex => allTargets[targetIndex])
  const selectableTargetIndexSet = new Set(
    safeComponents.flatMap(component => component.targetIndexes)
  )
  const selectableComponentSizes = safeComponents
    .map(component => component.targetIndexes.length)
    .filter(size => size > 0)
  const oversizedComponentsCount = normalizedMaxDocuments === null
    ? 0
    : selectableComponentSizes.filter(size => size > normalizedMaxDocuments).length

  return {
    targets: selectedTargets,
    availableTargetsCount: selectableTargetIndexSet.size,
    selectedIssueIds: [...selectedIssueIdSet],
    rawActionableTargetsCount: actionableTargetIndexes.length,
    selectableComponentsCount: safeComponents.length,
    selectedTargetsCount: selectedTargets.length,
    blockedTargetsCount: Math.max(
      0,
      actionableTargetIndexes.length - selectableTargetIndexSet.size
    ),
    oversizedComponentsCount,
    smallestSelectableComponentDocuments: selectableComponentSizes.length
      ? Math.min(...selectableComponentSizes)
      : 0,
  }
}
