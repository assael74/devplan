// features/playersDatabase/domain/movement/movement.reconciliation.js

import {
  createEmptyMovementState,
  ROSTER_IMPORT_MODE,
  resolveMovementDirection,
} from './movement.contract.js'
import {
  compareSeasonKeys,
  resolveMovementTiming,
} from './movement.timing.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const uniqueById = rows => {
  const lookup = new Map()

  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const id = clean(row.movementId || row.pendingId || row.resolutionId)
    if (id) lookup.set(id, row)
  })

  return [...lookup.values()]
}

const playerKey = player => clean(player?.playerId || player?.externalPlayerId || player?.identityKey)

const buildPlayerLookup = players => new Map(
  (Array.isArray(players) ? players : [])
    .map(player => [playerKey(player), player])
    .filter(([key]) => Boolean(key))
)

const normalizeMembership = row => ({
  playerId: clean(row.playerId),
  seasonKey: clean(row.seasonKey),
  clubId: clean(row.clubId),
  clubLevel: Number(row.clubLevel) || 0,
  birthTeamId: clean(row.birthTeamId || row.teamId),
  birthTeamDocumentId: clean(row.birthTeamDocumentId || row.teamDocumentId),
  birthTeamSlot: Number(row.birthTeamSlot || row.teamSlot) || 1,
})

const normalizeManualTeam = row => ({
  clubId: clean(row?.clubId),
  clubLevel: Number(row?.clubLevel) || 0,
  birthTeamId: clean(row?.birthTeamId || row?.teamId),
  birthTeamDocumentId: clean(row?.birthTeamDocumentId || row?.teamDocumentId),
  birthTeamSlot: Number(row?.birthTeamSlot || row?.teamSlot) || 1,
})

const selectSourceMembership = ({ player, seasonKey, currentBirthTeamDocumentId }) => {
  const memberships = (Array.isArray(player?.identityMemberships)
    ? player.identityMemberships
    : [])
    .map(normalizeMembership)
    .filter(row => (
      row.birthTeamDocumentId &&
      row.birthTeamDocumentId !== clean(currentBirthTeamDocumentId) &&
      compareSeasonKeys(row.seasonKey, seasonKey) <= 0
    ))
    .sort((left, right) => compareSeasonKeys(right.seasonKey, left.seasonKey))

  return memberships[0] || null
}

const buildMovementId = ({
  playerId,
  seasonKey,
  sourceSnapshotKey,
  targetSnapshotKey,
  sourceBirthTeamDocumentId,
  targetBirthTeamDocumentId,
}) => [
  'movement',
  playerId,
  seasonKey,
  sourceBirthTeamDocumentId,
  targetBirthTeamDocumentId,
  sourceSnapshotKey || 'source',
  targetSnapshotKey || 'target',
].map(clean).filter(Boolean).join('__')

const buildPendingId = ({ playerId, seasonKey, lastPresentSnapshotKey }) => [
  'pending',
  playerId,
  seasonKey,
  lastPresentSnapshotKey || 'previous',
].map(clean).filter(Boolean).join('__')

const buildResolvedAbsenceId = ({ playerId, seasonKey, resolution }) => [
  'resolved-absence', playerId, seasonKey, resolution,
].map(clean).filter(Boolean).join('__')

export const reconcileRosterMovement = ({
  seasonKey = '',
  team = {},
  incomingPlayers = [],
  missingPlayers = [],
  currentSeason = null,
  previousSeason = null,
  rosterImport = {},
} = {}) => {
  const existingState = {
    ...createEmptyMovementState(),
    transfersIn: Array.isArray(currentSeason?.transfersIn) ? currentSeason.transfersIn : [],
    transfersOut: Array.isArray(currentSeason?.transfersOut) ? currentSeason.transfersOut : [],
    pendingPlayers: Array.isArray(currentSeason?.pendingPlayers) ? currentSeason.pendingPlayers : [],
    resolvedRosterAbsences: Array.isArray(currentSeason?.resolvedRosterAbsences)
      ? currentSeason.resolvedRosterAbsences
      : [],
  }
  const currentPlayers = Array.isArray(currentSeason?.teamPlayers)
    ? currentSeason.teamPlayers
    : []
  const previousPlayers = Array.isArray(previousSeason?.teamPlayers)
    ? previousSeason.teamPlayers
    : []
  const baselinePlayers = currentPlayers.length ? currentPlayers : previousPlayers
  const incomingLookup = buildPlayerLookup(incomingPlayers)
  const incomingKeys = new Set(incomingLookup.keys())
  // A confirmed missing player is not part of the new roster snapshot. It is
  // only a Movement candidate, so it must not be added to incomingKeys.
  const confirmedMissingPlayers = (Array.isArray(missingPlayers) ? missingPlayers : [])
    .filter(player => clean(player?.playerId) && clean(player?.statsMovementTeam?.birthTeamDocumentId))
  const confirmedMissingKeys = new Set(confirmedMissingPlayers.map(playerKey))
  const olderAgeExceptionPlayers = (Array.isArray(missingPlayers) ? missingPlayers : [])
    .filter(player => clean(player?.playerId) && clean(player?.missingResolution) === 'olderAgeException')
  const resolvedAbsenceKeys = new Set(olderAgeExceptionPlayers.map(playerKey))
  const movementPlayers = [
    ...(Array.isArray(incomingPlayers) ? incomingPlayers : []),
    ...confirmedMissingPlayers.map(player => ({
      ...player,
      statsMovementDecision: 'left',
    })),
  ]
  const sourceSnapshotKey = clean(rosterImport.sourceSnapshotKey)
  const previousSnapshotKey = clean(currentSeason?.rosterImport?.sourceSnapshotKey)
  const currentBirthTeamDocumentId = clean(
    team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId
  )
  const currentClubId = clean(team.clubId)
  const currentClubLevel = Number(team.clubLevel) || 0
  const currentBirthTeamSlot = Number(team.birthTeamSlot || team.teamSlot) || 1
  const transfersIn = [...existingState.transfersIn]
  const transfersOut = [...existingState.transfersOut]
  let pendingPlayers = [...existingState.pendingPlayers]
  const resolvedRosterAbsences = [
    ...existingState.resolvedRosterAbsences,
    ...olderAgeExceptionPlayers.map(player => ({
      resolutionId: buildResolvedAbsenceId({
        playerId: player.playerId,
        seasonKey,
        resolution: 'olderAgeException',
      }),
      playerId: clean(player.playerId),
      externalPlayerId: clean(player.externalPlayerId),
      fullName: clean(player.fullName),
      birthYear: Number(player.birthYear) || 0,
      resolution: 'olderAgeException',
      previousSeasonKey: clean(previousSeason?.seasonKey),
      previousBirthTeamDocumentId: currentBirthTeamDocumentId,
    })),
  ]
  const counterpartRequests = []

  movementPlayers.forEach(player => {
    const key = playerKey(player)
    if (!key) return

    pendingPlayers = pendingPlayers.filter(pending => clean(pending.playerId) !== clean(player.playerId))

    const decision = clean(player.statsMovementDecision)
    const manualTeam = normalizeManualTeam(player.statsMovementTeam)

    if (decision === 'youngerAgeGroup') return

    if (decision === 'left') {
      if (!manualTeam.birthTeamDocumentId) return

      const timing = resolveMovementTiming({
        sourceSeasonKey: seasonKey,
        movementSeasonKey: seasonKey,
        effectiveAt: rosterImport.effectiveAt,
      })
      const movementId = buildMovementId({
        playerId: player.playerId,
        seasonKey,
        sourceSnapshotKey,
        targetSnapshotKey: manualTeam.birthTeamDocumentId,
        sourceBirthTeamDocumentId: currentBirthTeamDocumentId,
        targetBirthTeamDocumentId: manualTeam.birthTeamDocumentId,
      })
      const outgoing = {
        movementId,
        playerId: clean(player.playerId),
        toClubId: manualTeam.clubId,
        fromClubLevel: currentClubLevel,
        toClubLevel: manualTeam.clubLevel,
        direction: resolveMovementDirection({
          fromClubId: currentClubId,
          toClubId: manualTeam.clubId,
          fromClubLevel: currentClubLevel,
          toClubLevel: manualTeam.clubLevel,
          fromBirthTeamSlot: currentBirthTeamSlot,
          toBirthTeamSlot: manualTeam.birthTeamSlot,
        }),
        toBirthTeamId: manualTeam.birthTeamId,
        toBirthTeamDocumentId: manualTeam.birthTeamDocumentId,
        toBirthTeamSlot: manualTeam.birthTeamSlot,
        timing,
        targetSnapshotKey: sourceSnapshotKey,
        effectiveAt: rosterImport.effectiveAt || null,
      }
      transfersOut.push(outgoing)
      counterpartRequests.push({
        movementId,
        playerId: clean(player.playerId),
        seasonKey,
        counterpartSeasonUnknown: true,
        counterpartBirthTeamDocumentId: manualTeam.birthTeamDocumentId,
        incoming: {
          movementId,
          playerId: clean(player.playerId),
          fromClubId: currentClubId,
          fromClubLevel: currentClubLevel,
          toClubLevel: manualTeam.clubLevel,
          direction: resolveMovementDirection({
            fromClubId: currentClubId,
            toClubId: manualTeam.clubId,
            fromClubLevel: currentClubLevel,
            toClubLevel: manualTeam.clubLevel,
            fromBirthTeamSlot: currentBirthTeamSlot,
          toBirthTeamSlot: manualTeam.birthTeamSlot,
          }),
          fromBirthTeamId: clean(team.birthTeamId || team.teamId),
          fromBirthTeamDocumentId: currentBirthTeamDocumentId,
          fromBirthTeamSlot: currentBirthTeamSlot,
          timing,
          targetSnapshotKey: sourceSnapshotKey,
          effectiveAt: rosterImport.effectiveAt || null,
        },
      })
      return
    }

    const previousOutgoing = [...transfersOut]
      .reverse()
      .find(row => (
        clean(row.playerId) === clean(player.playerId) &&
        clean(row.toBirthTeamDocumentId) &&
        clean(row.toBirthTeamDocumentId) !== currentBirthTeamDocumentId
      ))
    const source = decision === 'joined' && manualTeam.birthTeamDocumentId
      ? {
        playerId: clean(player.playerId),
        seasonKey,
        ...manualTeam,
      }
      : previousOutgoing
      ? {
        playerId: clean(player.playerId),
        seasonKey,
        clubId: clean(previousOutgoing.toClubId),
        clubLevel: Number(previousOutgoing.toClubLevel) || 0,
        birthTeamId: clean(previousOutgoing.toBirthTeamId),
        birthTeamDocumentId: clean(previousOutgoing.toBirthTeamDocumentId),
        birthTeamSlot: Number(previousOutgoing.toBirthTeamSlot) || 1,
      }
      : selectSourceMembership({
        player,
        seasonKey,
        currentBirthTeamDocumentId,
      })
    if (!source) return

    const timing = resolveMovementTiming({
      sourceSeasonKey: source.seasonKey,
      movementSeasonKey: seasonKey,
      previousSnapshotKey,
      sourceSnapshotKey,
      effectiveAt: rosterImport.effectiveAt,
    })
    const movementId = buildMovementId({
      playerId: player.playerId,
      seasonKey,
      sourceSnapshotKey: source.seasonKey,
      targetSnapshotKey: sourceSnapshotKey,
      sourceBirthTeamDocumentId: source.birthTeamDocumentId,
      targetBirthTeamDocumentId: currentBirthTeamDocumentId,
    })
    const incoming = {
      movementId,
      playerId: clean(player.playerId),
      fromClubId: source.clubId,
      fromClubLevel: Number(source.clubLevel) || 0,
      toClubLevel: currentClubLevel,
      direction: resolveMovementDirection({
        fromClubId: source.clubId,
        toClubId: currentClubId,
        fromClubLevel: source.clubLevel,
        toClubLevel: currentClubLevel,
        fromBirthTeamSlot: source.birthTeamSlot,
        toBirthTeamSlot: currentBirthTeamSlot,
      }),
      fromBirthTeamId: source.birthTeamId,
      fromBirthTeamDocumentId: source.birthTeamDocumentId,
      fromBirthTeamSlot: source.birthTeamSlot,
      timing,
      counterpartSeasonKey: clean(source.seasonKey) || seasonKey,
      targetSnapshotKey: sourceSnapshotKey,
      effectiveAt: rosterImport.effectiveAt || null,
    }

    transfersIn.push(incoming)
    counterpartRequests.push({
      movementId,
      playerId: clean(player.playerId),
      seasonKey,
      counterpartSeasonKey: clean(source.seasonKey) || seasonKey,
      sourceBirthTeamDocumentId: source.birthTeamDocumentId,
      outgoing: {
        movementId,
        playerId: clean(player.playerId),
        toClubId: currentClubId,
        fromClubLevel: Number(source.clubLevel) || 0,
        toClubLevel: currentClubLevel,
        direction: resolveMovementDirection({
          fromClubId: source.clubId,
          toClubId: currentClubId,
          fromClubLevel: source.clubLevel,
          toClubLevel: currentClubLevel,
          fromBirthTeamSlot: source.birthTeamSlot,
        toBirthTeamSlot: currentBirthTeamSlot,
        }),
        toBirthTeamId: clean(team.birthTeamId || team.teamId),
        toBirthTeamDocumentId: currentBirthTeamDocumentId,
        toBirthTeamSlot: currentBirthTeamSlot,
        timing,
        targetSnapshotKey: sourceSnapshotKey,
        effectiveAt: rosterImport.effectiveAt || null,
      },
    })
  })

  if (rosterImport.mode === ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT) {
    baselinePlayers.forEach(player => {
      const key = playerKey(player)
      if (
        !key ||
        incomingKeys.has(key) ||
        confirmedMissingKeys.has(key) ||
        resolvedAbsenceKeys.has(key)
      ) return

      const playerId = clean(player.playerId)
      if (!playerId) return

      const existingPending = pendingPlayers.find(pending => (
        clean(pending.playerId) === playerId
      ))
      if (existingPending) return

      const pendingId = buildPendingId({
        playerId,
        seasonKey,
        lastPresentSnapshotKey: previousSnapshotKey || previousSeason?.seasonKey,
      })

      pendingPlayers.push({
        pendingId,
        playerId,
        externalPlayerId: clean(player.externalPlayerId),
        identityKey: clean(player.identityKey),
        fullName: clean(player.fullName),
        previousSeasonKey: clean(currentSeason?.seasonKey || previousSeason?.seasonKey),
        previousBirthTeamDocumentId: currentBirthTeamDocumentId,
        detectedSnapshotKey: sourceSnapshotKey,
      })
    })
  }

  return {
    transfersIn: uniqueById(transfersIn),
    transfersOut: uniqueById(transfersOut),
    pendingPlayers: uniqueById(pendingPlayers),
    resolvedRosterAbsences: uniqueById(resolvedRosterAbsences),
    counterpartRequests,
  }
}
