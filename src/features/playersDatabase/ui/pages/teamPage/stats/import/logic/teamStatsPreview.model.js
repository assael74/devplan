// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/teamStatsPreview.model.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const getPlayerKeys = player => [
  clean(player?.playerDocumentId),
  clean(player?.playerId),
  clean(player?.externalPlayerId),
  clean(player?.originalPlayerId),
  clean(player?.fullName || player?.matchedPlayerName || player?.originalFullName).toLowerCase(),
].filter(Boolean)

const buildScoutLookup = approvedStatsPlan => {
  const lookup = new Map()
  const scoutedPlayers = Array.isArray(approvedStatsPlan?.playerScout?.scoutedPlayers)
    ? approvedStatsPlan.playerScout.scoutedPlayers
    : []

  scoutedPlayers.forEach(player => {
    getPlayerKeys(player).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, player)
    })
  })

  return lookup
}

const findScoutedPlayer = (row, lookup) => {
  for (const key of getPlayerKeys(row)) {
    if (lookup.has(key)) return lookup.get(key)
  }
  return null
}

const getProfileMap = player => {
  const profiles = Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : []
  const hierarchyIds = Array.isArray(player?.scoutProfileHierarchy?.orderedProfileIds)
    ? player.scoutProfileHierarchy.orderedProfileIds
    : []
  const profileMap = new Map()

  profiles.forEach(profile => {
    const profileId = clean(profile?.profileId || profile?.id)
    if (!profileId) return
    profileMap.set(profileId, clean(profile?.profileLabel || profile?.label || profileId))
  })

  hierarchyIds.forEach(profileId => {
    const cleanId = clean(profileId)
    if (cleanId && !profileMap.has(cleanId)) profileMap.set(cleanId, cleanId)
  })

  return profileMap
}

const buildMinutesCorrectionImpact = ({ correction, player }) => {
  if (!correction) return undefined

  const beforeProfiles = new Map(
    (Array.isArray(correction.beforeProfiles) ? correction.beforeProfiles : [])
      .map(profile => [clean(profile?.profileId), clean(profile?.label)])
      .filter(([profileId]) => Boolean(profileId))
  )
  const afterProfiles = getProfileMap(player)

  return {
    amount: correction.amount,
    addedProfiles: [...afterProfiles.entries()]
      .filter(([profileId]) => !beforeProfiles.has(profileId))
      .map(([profileId, label]) => ({ profileId, label })),
    removedProfiles: [...beforeProfiles.entries()]
      .filter(([profileId]) => !afterProfiles.has(profileId))
      .map(([profileId, label]) => ({ profileId, label })),
  }
}

export const snapshotStatsPreviewProfiles = row => (
  [...getProfileMap(row).entries()].map(([profileId, label]) => ({ profileId, label }))
)

export const buildStatsPreviewModel = ({ rows = [], approvedStatsPlan = null } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  if (!approvedStatsPlan) return safeRows

  const scoutLookup = buildScoutLookup(approvedStatsPlan)

  return safeRows.map(row => {
    const scoutedPlayer = findScoutedPlayer(row, scoutLookup)
    if (!scoutedPlayer) return row

    const statsMinutesCorrection = buildMinutesCorrectionImpact({
      correction: row.statsMinutesCorrection,
      player: scoutedPlayer,
    })

    return {
      ...row,
      ...scoutedPlayer,
      ...(statsMinutesCorrection ? { statsMinutesCorrection } : {}),
    }
  })
}

export const buildStatsMovementPreviewModel = ({ rows = [], approvedStatsPlan = null } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const movementState = approvedStatsPlan?.canonical?.canonicalCommit?.movementState || null
  const canonicalPlayers = Array.isArray(approvedStatsPlan?.canonical?.canonicalCommit?.players)
    ? approvedStatsPlan.canonical.canonicalCommit.players
    : []
  const decisionRequiredCount = safeRows.filter(row => (
    row.requiresStatsMovementDecision || [
      'system_candidate',
      'ambiguous',
      'unresolved',
    ].includes(clean(row.identityStatus))
  )).length

  return {
    existingIncomingCount: safeRows.filter(row => clean(row.identityStatus) === 'system_match').length,
    newPlayerCount: safeRows.filter(row => clean(row.identityStatus) === 'new_player').length,
    decisionRequiredCount,
    leftCount: movementState
      ? (Array.isArray(movementState.transfersOut) ? movementState.transfersOut.length : 0)
      : safeRows.filter(row => clean(row.statsMovementDecision) === 'left' || clean(row.rosterStatus) === 'left').length,
    joinedCount: movementState
      ? (Array.isArray(movementState.transfersIn) ? movementState.transfersIn.length : 0)
      : safeRows.filter(row => clean(row.statsMovementDecision) === 'joined').length,
    youngerAgeGroupCount: movementState
      ? canonicalPlayers.filter(player => clean(player.rosterStatus) === 'youngerAgeGroup').length
      : safeRows.filter(row => clean(row.rosterStatus) === 'youngerAgeGroup').length,
    requiresDecision: decisionRequiredCount > 0,
  }
}
