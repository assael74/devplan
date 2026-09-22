// src/shared/scouting/players/reclassification/playerProfileReclassification.js

import {
  SCOUT_PROFILE_IDENTITY,
} from '../ids.js'

import {
  SCOUT_PROFILES,
} from '../profiles.js'

const PRELIMINARY_LOW_OUTPUT_ID = 'preliminary_low_output'

const normalizeValue = value => String(value || '')
  .trim()
  .toLowerCase()

const resolveTargetProfileId = ({ player = {} } = {}) => {
  const classification = player.lineClassification &&
    typeof player.lineClassification === 'object'
    ? player.lineClassification
    : {}
  const line = normalizeValue(classification.line)
  const position = normalizeValue(classification.position)

  if (line === 'attack' || position === 'attacking_midfielder') {
    return 'attacking_support'
  }
  if (line === 'defense' || line === 'midfield') {
    return 'last_station'
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
  reclassificationReason: 'performance_line_classification',
})

export const reclassifyPlayerScoutSignals = ({
  signals = [],
  player = {},
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

  const targetProfileId = resolveTargetProfileId({ player })
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
      reason: 'performance_line_classification',
    },
  }
}
