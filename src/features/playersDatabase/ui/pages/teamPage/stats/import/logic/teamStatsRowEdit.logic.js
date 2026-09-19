// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/teamStatsRowEdit.logic.js

import { clean } from '../../../logic/teamPage.utils.js'
import { normalizePlayerNameValue } from '../../../../../../model/player/playerIdentity.model.js'
import {
  STATS_IDENTITY_STATUS,
  findRosterPlayerByValue,
} from '../../shared/logic/teamStatsMatch.logic.js'

const withoutStatsMinutesCorrection = row => {
  const nextRow = { ...(row || {}) }
  delete nextRow.statsMinutesCorrection
  return nextRow
}

export const applyRosterMatchEdit = ({ row, value, players }) => {
  if (value === '__createNew') {
    return {
      ...row,
      fullName: row.originalFullName || row.fullName || '',
      matchedPlayerId: '',
      matchedPlayerName: '',
      identityResolution: 'createNew',
      rosterStatus: 'regular',
      identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
      identityMessage: 'אושר במפורש כשחקן חדש',
    }
  }

  const matchedPlayer = findRosterPlayerByValue(players, value)

  if (!matchedPlayer) {
    return {
      ...row,
      matchedPlayerId: '',
      matchedPlayerName: '',
      rosterStatus: 'unresolved',
      identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
      identityResolution: '',
      identityMessage: 'לא נבחר שחקן',
    }
  }

  const pastedName = row.originalFullName || row.fullName || ''
  const matchedName = matchedPlayer.fullName || row.fullName || ''
  const aliases = normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)
    ? Array.from(new Set([...(row.aliases || []), pastedName].filter(Boolean)))
    : row.aliases || []

  return {
    ...row,
    ...matchedPlayer,
    fullName: matchedName,
    originalFullName: pastedName,
    aliases,
    matchedPlayerId: value,
    matchedPlayerName: matchedName,
    rosterStatus: clean(matchedPlayer.rosterStatus) || 'regular',
    isYoungerAgeGroup: Boolean(
      matchedPlayer.isYoungerAgeGroup ||
      clean(matchedPlayer.rosterStatus) === 'youngerAgeGroup'
    ),
    isNameAlias: aliases.length > 0,
    identityStatus: STATS_IDENTITY_STATUS.ROSTER_MATCH,
    identityResolution: '',
    identityMessage: 'נבחר ידנית מתוך הסגל',
  }
}

export const applyMovementDecision = ({ row, value }) => {
  const decision = clean(value?.decision)
  const selectedTeam = value?.team && typeof value.team === 'object'
    ? value.team
    : null
  const requiresTeam = ['joined', 'left'].includes(decision)

  if (
    !['joined', 'left', 'youngerAgeGroup'].includes(decision) ||
    (requiresTeam && !clean(selectedTeam?.birthTeamDocumentId))
  ) {
    return row
  }

  return {
    ...row,
    rosterStatus: decision === 'left'
      ? 'left'
      : decision === 'youngerAgeGroup'
        ? 'youngerAgeGroup'
        : 'regular',
    isYoungerAgeGroup: decision === 'youngerAgeGroup',
    statsMovementDecision: decision,
    statsMovementTeam: requiresTeam ? selectedTeam : null,
    requiresStatsMovementDecision: false,
    identityResolution: clean(row.playerId) ? 'useSystemCandidate' : 'createNew',
    identityMatchStatus: clean(row.playerId) ? 'matched' : 'created',
    identityMessage: decision === 'left'
      ? 'עזיבה אושרה ידנית'
      : decision === 'joined'
        ? 'הצטרפות אושרה ידנית'
        : 'שחקן צעיר אושר ידנית',
  }
}

export const applySystemCandidateApproval = ({ row, value }) => {
  const candidateKey = clean(value)
  const candidate = (Array.isArray(row.identityCandidates)
    ? row.identityCandidates
    : []).find(item => (
    clean(item.candidateKey || item.playerDocumentId || item.playerId) === candidateKey
  ))

  if (!candidate || !clean(candidate.playerId)) return row

  return {
    ...row,
    playerDocumentId: candidate.playerDocumentId,
    approvedPlayerDocumentId: candidate.playerDocumentId,
    approvedIdentityCandidateId: candidate.playerId,
    approvedCanonicalPlayerId: candidate.playerId,
    identityResolution: 'useSystemCandidate',
    rosterStatus: 'regular',
    identityStatus: STATS_IDENTITY_STATUS.SYSTEM_MATCH,
    identityMessage: 'התאמה קיימת אושרה',
  }
}

export const applyRosterStatusEdit = ({ row, value }) => {
  const nextRow = {
    ...withoutStatsMinutesCorrection(row),
    rosterStatus: value,
  }

  if (['left', 'joined'].includes(value)) {
    return {
      ...nextRow,
      rosterStatus: value === 'left' ? 'left' : 'regular',
      isYoungerAgeGroup: false,
      statsMovementDecision: value,
      statsMovementTeam: null,
      requiresStatsMovementDecision: true,
      identityMessage: value === 'left'
        ? 'בחר קבוצת יעד כדי לאשר עזיבה'
        : 'בחר קבוצת מקור כדי לאשר הצטרפות',
    }
  }

  nextRow.rosterStatus = value || 'unresolved'
  nextRow.isYoungerAgeGroup = value === 'youngerAgeGroup'
  nextRow.statsMovementDecision = ''
  nextRow.statsMovementTeam = null
  nextRow.requiresStatsMovementDecision = false

  const canExplicitlyCreateNewPlayer = [
    STATS_IDENTITY_STATUS.NEW_PLAYER,
    STATS_IDENTITY_STATUS.UNRESOLVED,
  ].includes(row.identityStatus)

  if (canExplicitlyCreateNewPlayer) {
    const hasExplicitRosterStatus = ['regular', 'left', 'youngerAgeGroup'].includes(nextRow.rosterStatus)

    nextRow.identityResolution = hasExplicitRosterStatus
      ? 'createNew'
      : ''
    nextRow.identityMatchStatus = hasExplicitRosterStatus ? 'created' : ''
    nextRow.identityStatus = hasExplicitRosterStatus
      ? STATS_IDENTITY_STATUS.NEW_PLAYER
      : row.identityStatus
    nextRow.identityMessage = hasExplicitRosterStatus
      ? 'יצירת שחקן חדש אושרה לפי סטטוס הסגל'
      : 'בחר סטטוס בסגל'
  }

  return nextRow
}

export const applyStatsCellEdit = ({ row, columnKey, value }) => ({
  ...withoutStatsMinutesCorrection(row),
  [columnKey]: value,
})

export const updateStatsImportRow = ({ row, columnKey, value, players }) => {
  if (columnKey === 'fullNameRosterMatch') {
    return applyRosterMatchEdit({ row, value, players })
  }

  if (columnKey === 'statsMovementDecision') {
    return applyMovementDecision({ row, value })
  }

  if (columnKey === 'systemCandidateApproval') {
    return applySystemCandidateApproval({ row, value })
  }

  if (columnKey === 'rosterStatus') {
    return applyRosterStatusEdit({ row, value })
  }

  return applyStatsCellEdit({ row, columnKey, value })
}
