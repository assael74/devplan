// src/features/playersDatabase/domain/signals/teamMovementSignal.js

import { resolveMovementDirection } from '../movement/index.js'
import { resolveActiveProfessionalProfileIds } from '../../model/scout/scoutProfilesSummary.model.js'
import { SCOUT_PROFILE_IDENTITY } from '../../../../shared/scouting/players/ids.js'
import { resolveScoutProfileIdentity } from '../../../../shared/scouting/players/profiles.js'
import { clean, numberOrNull } from '../../model/team/teamInformation.utils.js'
import { TEAM_SIGNAL_CALIBRATION } from '../../../../shared/scouting/teams/signals/teamSignalCalibration.js'

const slotOf = value => {
  const match = clean(value).match(/_([1-9]\d*)$/)
  return match ? Number(match[1]) : null
}

export const resolveTeamMovementDirection = (fact, clubsById = {}) => {
  const stored = clean(fact?.levelDirection || fact?.direction) || 'unknown'
  if (stored !== 'unknown') return stored
  const fromClubId = clean(fact?.fromClubId)
  const toClubId = clean(fact?.toClubId)
  if (!fromClubId || !toClubId || fromClubId === toClubId) return stored
  const fromLevel = numberOrNull(clubsById[fromClubId]?.clubLevel)
  const toLevel = numberOrNull(clubsById[toClubId]?.clubLevel)
  const fromSlot = slotOf(fact?.fromTeamId || fact?.fromBirthTeamDocumentId)
  const toSlot = slotOf(fact?.toTeamId || fact?.toBirthTeamDocumentId)
  if (!fromSlot || fromLevel === null || fromLevel <= 1 || toLevel !== 1 || toSlot !== 2) return stored
  return resolveMovementDirection({
    fromClubId,
    toClubId,
    fromClubLevel: fromLevel,
    toClubLevel: toLevel,
    fromBirthTeamSlot: fromSlot,
    toBirthTeamSlot: toSlot,
  })
}

export const resolveTeamMovementLevelChange = (fact, direction, clubsById = {}) => {
  const fromClubId = clean(fact?.fromClubId)
  const toClubId = clean(fact?.toClubId)
  if (!fromClubId || !toClubId || fromClubId === toClubId || direction === 'unknown') return null
  const fromLevel = numberOrNull(clubsById[fromClubId]?.clubLevel)
  const toLevel = numberOrNull(clubsById[toClubId]?.clubLevel)
  if (fromLevel === null || toLevel === null || fromLevel <= 0 || toLevel <= 0) return null
  const change = fromLevel - toLevel
  if ((change > 0 && direction !== 'up') || (change < 0 && direction !== 'down') ||
    (change === 0 && direction !== 'lateral')) return null
  return Math.abs(change)
}

export const hasTeamScoutingEvidence = player => {
  if (!player) return false
  if (Object.prototype.hasOwnProperty.call(player, 'scoutSeasonProjection')) return Boolean(player.scoutSeasonProjection)
  return ['professionalScoutProfileIds', 'primaryScoutProfileId', 'scoutProfileHierarchy', 'scoutProfiles', 'scoutSignals']
    .some(key => Object.prototype.hasOwnProperty.call(player, key))
}

export const buildTeamMovementDepartureFacts = (rows = []) => {
  const byPlayer = new Map()
  rows.filter(row => row.side === 'out').forEach((row, index) => {
    const key = row.playerId || row.movementId || `out-${index}`
    const previous = byPlayer.get(key) || {}
    const player = row.departureProfilePlayer
    byPlayer.set(key, {
      comparable: previous.comparable || row.levelChange !== null,
      movedUp: previous.movedUp || (row.direction === 'up' && row.levelChange > 0),
      movedLateral: previous.movedLateral || (row.direction === 'lateral' && row.levelChange === 0),
      profileKnown: previous.profileKnown || Boolean(player),
      professionalProfile: previous.professionalProfile || Boolean(player &&
        resolveActiveProfessionalProfileIds(player).some(id => resolveScoutProfileIdentity(id) === SCOUT_PROFILE_IDENTITY.CORE)),
    })
  })
  const players = [...byPlayer.values()]
  return {
    outgoingPlayerCount: players.length,
    higherLevelDepartures: players.filter(player => player.movedUp).length,
    sameLevelDepartures: players.filter(player => player.movedLateral).length,
    higherOrSameLevelDepartures: players.filter(player => player.movedUp || player.movedLateral).length,
    comparableDepartures: players.filter(player => player.comparable).length,
    professionalProfileDepartures: players.filter(player => player.professionalProfile).length,
    profileKnownDepartures: players.filter(player => player.profileKnown).length,
  }
}

export const buildMovementSeasonSignal = (season, clubLevel, suppliedBalancePoint) => {
  const calibration = TEAM_SIGNAL_CALIBRATION.movement
  const balancePoint = suppliedBalancePoint !== undefined ? suppliedBalancePoint
    : [1, 1.5].includes(clubLevel) ? calibration.topClubDepartureReference
      : [2, 2.5].includes(clubLevel) ? calibration.middleClubDepartureReference
        : clubLevel >= 3 ? calibration.otherClubDepartureReference : null
  const directionDepartureCount = clubLevel === 1
    ? season?.higherOrSameLevelDepartures || 0 : season?.higherLevelDepartures || 0
  const professionalDepartureCount = season?.professionalProfileDepartures || 0
  const available = Boolean(season?.movementDataAvailable && !season.isUpcoming && balancePoint !== null)
  const directionActive = available && directionDepartureCount > balancePoint
  const professionalActive = available && professionalDepartureCount > balancePoint
  const count = Number(directionActive) + Number(professionalActive)
  return {
    seasonKey: season?.seasonKey || '', balancePoint, directionDepartureCount, professionalDepartureCount,
    directionActive, professionalActive, count,
    status: !available ? 'limited' : count >= calibration.strongSignalCount ? 'multiple' : count ? 'single' : 'none',
  }
}
