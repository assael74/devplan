// Reconcile missing Movement counterparts from canonical local transfersIn.
// A missing source Team Season remains legal; this service never creates one.

import {
  COUNTERPART_RECONCILIATION,
} from '../../../domain/movement/index.js'
import {
  reconcileTeamSeasonMovementCounterpartsWithClubRefresh,
} from './teamSeasonMovementProjection.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const buildCounterpartRequest = ({ season = {}, incoming = {} } = {}) => {
  const movementId = clean(incoming.movementId)
  const playerId = clean(incoming.playerId)
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const sourceBirthTeamDocumentId = clean(incoming.fromBirthTeamDocumentId)
  const targetBirthTeamDocumentId = clean(
    season.birthTeamDocumentId || season.teamDocumentId
  )

  if (
    !movementId ||
    !playerId ||
    !seasonKey ||
    !sourceBirthTeamDocumentId ||
    !targetBirthTeamDocumentId
  ) {
    return null
  }

  return {
    movementId,
    playerId,
    seasonKey,
    counterpartSeasonKey: clean(incoming.counterpartSeasonKey),
    counterpartSeasonUnknown: !clean(incoming.counterpartSeasonKey),
    sourceBirthTeamDocumentId,
    outgoing: {
      movementId,
      playerId,
      toClubId: clean(season.clubId),
      fromClubLevel: Number(incoming.fromClubLevel) || 0,
      toClubLevel: Number(incoming.toClubLevel || season.clubLevel) || 0,
      direction: clean(incoming.direction) || 'unknown',
      toBirthTeamId: clean(season.birthTeamId || season.teamId),
      toBirthTeamDocumentId: targetBirthTeamDocumentId,
      toBirthTeamSlot: Number(season.birthTeamSlot || season.teamSlot) || 1,
      timing: clean(incoming.timing),
      targetSnapshotKey: clean(incoming.targetSnapshotKey),
      effectiveAt: incoming.effectiveAt || null,
    },
  }
}

const buildIncomingCounterpartRequest = ({ season = {}, outgoing = {} } = {}) => {
  const movementId = clean(outgoing.movementId)
  const playerId = clean(outgoing.playerId)
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const targetBirthTeamDocumentId = clean(outgoing.toBirthTeamDocumentId)
  const sourceBirthTeamDocumentId = clean(season.birthTeamDocumentId || season.teamDocumentId)

  if (!movementId || !playerId || !seasonKey || !targetBirthTeamDocumentId || !sourceBirthTeamDocumentId) {
    return null
  }

  return {
    movementId,
    playerId,
    seasonKey,
    counterpartSeasonKey: clean(outgoing.counterpartSeasonKey),
    counterpartSeasonUnknown: !clean(outgoing.counterpartSeasonKey),
    counterpartBirthTeamDocumentId: targetBirthTeamDocumentId,
    incoming: {
      movementId,
      playerId,
      fromClubId: clean(season.clubId),
      fromClubLevel: Number(outgoing.fromClubLevel || season.clubLevel) || 0,
      toClubLevel: Number(outgoing.toClubLevel) || 0,
      direction: clean(outgoing.direction) || 'unknown',
      fromBirthTeamId: clean(season.birthTeamId || season.teamId),
      fromBirthTeamDocumentId: sourceBirthTeamDocumentId,
      fromBirthTeamSlot: Number(season.birthTeamSlot || season.teamSlot) || 1,
      timing: clean(outgoing.timing),
      targetSnapshotKey: clean(outgoing.targetSnapshotKey),
      effectiveAt: outgoing.effectiveAt || null,
    },
  }
}

export async function retryTeamSeasonMovementCounterparts({
  teamSeason = {},
} = {}) {
  const requests = [
    ...(Array.isArray(teamSeason.transfersIn)
    ? teamSeason.transfersIn
    : [])
    .map(incoming => buildCounterpartRequest({
      season: teamSeason,
      incoming,
    }))
    .filter(Boolean),
    ...(Array.isArray(teamSeason.transfersOut)
      ? teamSeason.transfersOut
      : [])
      .map(outgoing => buildIncomingCounterpartRequest({
        season: teamSeason,
        outgoing,
      }))
      .filter(Boolean),
  ]

  if (!requests.length) {
    return {
      status: COUNTERPART_RECONCILIATION.NOT_REQUIRED,
      results: [],
    }
  }

  return reconcileTeamSeasonMovementCounterpartsWithClubRefresh({ requests })
}
