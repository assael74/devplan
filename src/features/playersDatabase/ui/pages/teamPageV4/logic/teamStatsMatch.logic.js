// features/playersDatabase/ui/pages/teamPage/logic/teamStatsMatch.logic.js

import { clean } from './teamPage.utils.js'
import {
  buildPlayerNameVariants,
  normalizePlayerNameValue,
} from '../../../../model/playerIdentity.model.js'
import { pickDefinedValue } from '../../../../model/value.model.js'
export const STATS_IDENTITY_STATUS = {
  ROSTER_MATCH: 'roster_match',
  SYSTEM_MATCH: 'system_match',
  SYSTEM_CANDIDATE: 'system_candidate',
  NEW_PLAYER: 'new_player',
  AMBIGUOUS: 'ambiguous',
  UNRESOLVED: 'unresolved',
}

const buildRosterNameVariants = player => [
  player?.fullName,
  player?.normalizedName,
  ...(Array.isArray(player?.aliases) ? player.aliases : []),
]

export const getRosterPlayerOptionValue = player => clean(
  player?.playerDocumentId ||
  player?.playerId ||
  player?.externalPlayerId ||
  player?.fullName
)

export const buildRosterLookup = players => {
  const names = new Set()
  const ids = new Set()
  const byName = new Map()
  const byOptionValue = new Map()

  players.forEach(player => {
    buildRosterNameVariants(player).forEach(value => {
      buildPlayerNameVariants(value).forEach(name => {
        names.add(name)
        if (!byName.has(name)) byName.set(name, player)
      })
    })

    if (player.externalPlayerId) ids.add(clean(player.externalPlayerId))
    if (player.playerId) ids.add(clean(player.playerId))

    const optionValue = getRosterPlayerOptionValue(player)
    if (optionValue) byOptionValue.set(optionValue, player)
  })

  return {
    names,
    ids,
    byName,
    byOptionValue,
    players,
  }
}

export const findRosterPlayerByValue = (players, value) => {
  const optionValue = clean(value)
  if (!optionValue) return null

  return players.find(player => getRosterPlayerOptionValue(player) === optionValue) || null
}

export const findStatsRosterMatch = (row, rosterLookup) => {
  if (!row || !rosterLookup) return null

  const selectedPlayer = rosterLookup.byOptionValue?.get(clean(row.matchedPlayerId))
  if (selectedPlayer) return selectedPlayer

  const nameVariants = buildPlayerNameVariants(row.fullName)
  for (const name of nameVariants) {
    const matchedPlayer = rosterLookup.byName?.get(name)
    if (matchedPlayer) return matchedPlayer
  }

  return null
}

const mergeRosterPlayerContext = ({ row, player }) => ({
  ...row,
  playerId: clean(player?.playerId),
  playerDocumentId: clean(player?.playerDocumentId),
  externalPlayerId: clean(player?.externalPlayerId),
  identityKey: clean(player?.identityKey),
  normalizedName: clean(player?.normalizedName || player?.fullName),
  birthYear: pickDefinedValue(player?.birthYear, player?.yearOfBirth, row.birthYear),
  yearOfBirth: pickDefinedValue(player?.yearOfBirth, player?.birthYear, row.yearOfBirth),
  primaryPosition: clean(player?.primaryPosition || row.primaryPosition),
  positionLayer: clean(player?.positionLayer || row.positionLayer),
  positions: Array.isArray(player?.positions)
    ? player.positions
    : Array.isArray(row.positions)
      ? row.positions
      : [],
  clubLevel: pickDefinedValue(player?.clubLevel, row.clubLevel),
  birthTeamSlot: pickDefinedValue(player?.birthTeamSlot, player?.teamSlot, row.birthTeamSlot),
})

export const enrichStatsRowForPreview = (row, rosterLookup) => {
  const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
  const matchedName = matchedPlayer?.fullName || row.fullName || ''
  const pastedName = row.fullName || ''
  const isAlias = matchedPlayer
    && pastedName
    && normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)
  const baseRow = {
    ...row,
    fullName: matchedName,
    originalFullName: pastedName,
    aliases: isAlias ? [pastedName] : [],
    matchedPlayerId: matchedPlayer ? getRosterPlayerOptionValue(matchedPlayer) : '',
    matchedPlayerName: matchedPlayer?.fullName || '',
    rosterStatus: matchedPlayer
      ? clean(matchedPlayer.rosterStatus) || 'regular'
      : 'unresolved',
    isYoungerAgeGroup: Boolean(
      matchedPlayer?.isYoungerAgeGroup ||
      clean(matchedPlayer?.rosterStatus) === 'youngerAgeGroup'
    ),
    identityStatus: matchedPlayer
      ? STATS_IDENTITY_STATUS.ROSTER_MATCH
      : STATS_IDENTITY_STATUS.UNRESOLVED,
    identityMessage: matchedPlayer
      ? 'זוהה בסגל לפי שם'
      : 'טרם בוצע חיפוש במערכת',
  }

  return matchedPlayer
    ? mergeRosterPlayerContext({
      row: baseRow,
      player: matchedPlayer,
    })
    : baseRow
}

export const applyResolvedStatsIdentity = ({ row, resolvedPlayer }) => {
  if (row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH) return row

  const matchStatus = clean(resolvedPlayer?.identityMatchStatus)
  const candidateIds = Array.isArray(resolvedPlayer?.identityCandidateIds)
    ? resolvedPlayer.identityCandidateIds
    : []
  const candidates = Array.isArray(resolvedPlayer?.identityCandidates)
    ? resolvedPlayer.identityCandidates
    : []

  if (matchStatus === 'matched') {
    return {
      ...row,
      ...resolvedPlayer,
      identityStatus: STATS_IDENTITY_STATUS.SYSTEM_MATCH,
      identityMessage: 'זוהה שחקן קיים במערכת',
    }
  }

  if (matchStatus === 'ambiguous') {
    return {
      ...row,
      identityStatus: STATS_IDENTITY_STATUS.AMBIGUOUS,
      identityMessage: candidateIds.length
        ? `נמצאו ${candidateIds.length} התאמות אפשריות`
        : 'נמצאו כמה התאמות אפשריות',
      identityCandidateIds: candidateIds,
      identityCandidates: candidates,
    }
  }

  if (matchStatus === 'candidate') {
    const candidate = candidates[0] || null
    const hasCanonicalPlayerId = Boolean(clean(candidate?.playerId))

    return {
      ...row,
      ...resolvedPlayer,
      identityStatus: STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE,
      identityMessage: hasCanonicalPlayerId
        ? 'נמצא Player Document קיים; נדרש אישור התאמה'
        : 'קיים במערכת אך חסר קישור זהות קנוני',
      identityCandidateIds: candidateIds,
      identityCandidates: candidates,
    }
  }

  return {
    ...row,
    ...resolvedPlayer,
    identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
    identityMessage: 'לא נמצאה זהות קיימת במערכת',
  }
}

export const getStatsIdentityLabel = status => ({
  [STATS_IDENTITY_STATUS.ROSTER_MATCH]: 'זוהה בסגל',
  [STATS_IDENTITY_STATUS.SYSTEM_MATCH]: 'זוהה במערכת',
  [STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE]: 'נדרש אישור התאמה',
  [STATS_IDENTITY_STATUS.NEW_PLAYER]: 'שחקן חדש',
  [STATS_IDENTITY_STATUS.AMBIGUOUS]: 'נדרשת בדיקה',
  [STATS_IDENTITY_STATUS.UNRESOLVED]: 'לא זוהה',
}[clean(status)] || 'לא זוהה')
