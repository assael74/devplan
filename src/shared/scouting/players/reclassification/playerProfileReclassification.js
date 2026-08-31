// src/shared/scouting/players/reclassification/playerProfileReclassification.js

import {
  SCOUT_PROFILE_IDENTITY,
} from '../ids.js'

import {
  SCOUT_PROFILES,
} from '../profiles.js'

import {
  PLAYER_VERIFICATION_ANSWER,
  PLAYER_VERIFICATION_QUESTION,
} from '../verification/playerVerification.model.js'

const PRELIMINARY_LOW_OUTPUT_ID = 'preliminary_low_output'

const DEFENSIVE_ROLE_VALUES = new Set([
  'cb',
  'dc',
  'dcr',
  'dcl',
  'fb',
  'wb',
  'dr',
  'dl',
  'dm',
  'dmc',
  'dmr',
  'dml',
  'defender',
  'defensive unit',
  'defensive role',
])

const ATTACKING_SUPPORT_ROLE_VALUES = new Set([
  'winger',
  'am',
  'ar',
  'ac',
  'al',
  'attack',
  'atmidfield',
  'advanced midfielder',
  'attacking role',
  'supporting role',
  'attacking/supporting role',
])

const normalizeValue = value => String(value || '')
  .trim()
  .toLowerCase()

const resolveVerifiedRoleValues = (player = {}) => {
  const values = [
    player.verifiedRole,
    player.verifiedPosition,
    player.primaryPosition,
    player.position,
    player.positionId,
    player.positionLayer,
    player.positionLayerCode,
    player.layerCode,
    player.primaryPositionLayer,
  ]

  return values
    .map(normalizeValue)
    .filter(Boolean)
}

const isPositionVerificationConfirmed = verification => (
  Array.isArray(verification?.checks) &&
  verification.checks.some(check => (
    check?.questionId === PLAYER_VERIFICATION_QUESTION.POSITION_CONTEXT_VERIFIED &&
    check?.answer === PLAYER_VERIFICATION_ANSWER.YES
  ))
)

const resolveTargetProfileId = ({ player, verification } = {}) => {
  if (!isPositionVerificationConfirmed(verification)) return ''

  const roleValues = resolveVerifiedRoleValues(player)

  // A specific position wins over a broad layer because the values are kept in
  // that order. When the position itself is not mapped, the selected layer is
  // still a valid professional indication for the reclassification.
  if (roleValues.some(roleValue => DEFENSIVE_ROLE_VALUES.has(roleValue))) {
    return 'last_station'
  }
  if (roleValues.some(roleValue => ATTACKING_SUPPORT_ROLE_VALUES.has(roleValue))) {
    return 'attacking_support'
  }

  return ''
}

const getProfileById = profileId => (
  SCOUT_PROFILES.find(profile => profile.id === profileId) || null
)

const buildReclassifiedSignal = ({ preliminarySignal, targetProfile } = {}) => ({
  ...preliminarySignal,
  profileId: targetProfile.id,
  profileLabel: targetProfile.label,
  profileShortLabel: targetProfile.shortLabel || '',
  profileIdentity: SCOUT_PROFILE_IDENTITY.CORE,
  positionContext: targetProfile.positionContext || '',
  warnings: targetProfile.warnings || [],
  requiredReview: [],
  classificationState: 'reclassified',
  sourcePreliminaryProfileId: preliminarySignal.profileId,
  reclassificationReason: 'verified_professional_role',
})

export const reclassifyPlayerScoutSignals = ({
  signals = [],
  player = {},
  verification = null,
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const preliminarySignal = safeSignals.find(signal => (
    signal?.profileId === PRELIMINARY_LOW_OUTPUT_ID &&
    signal?.profileIdentity === SCOUT_PROFILE_IDENTITY.PRELIMINARY
  ))

  if (!preliminarySignal) {
    return {
      signals: safeSignals,
      reclassification: null,
    }
  }

  const targetProfileId = resolveTargetProfileId({ player, verification })
  const targetProfile = getProfileById(targetProfileId)

  if (!targetProfile) {
    return {
      signals: safeSignals,
      reclassification: null,
    }
  }

  const reclassifiedSignal = buildReclassifiedSignal({
    preliminarySignal,
    targetProfile,
  })
  const nextSignals = safeSignals.map(signal => (
    signal === preliminarySignal
      ? {
          ...signal,
          classificationState: 'reclassified',
          reclassifiedToProfileId: targetProfileId,
        }
      : signal
  ))

  nextSignals.push(reclassifiedSignal)

  return {
    signals: nextSignals,
    reclassification: {
      state: 'reclassified',
      sourceProfileId: PRELIMINARY_LOW_OUTPUT_ID,
      targetProfileId,
      reason: 'verified_professional_role',
    },
  }
}
