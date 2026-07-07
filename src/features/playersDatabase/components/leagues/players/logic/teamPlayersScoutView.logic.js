// features/playersDatabase/components/leagues/players/logic/teamPlayersScoutView.logic.js

import { SCOUT_PROFILES } from '../../../../../../shared/players/scouting/profiles.js'
import { clean } from '../../../../sharedLogic/index.js'

const profileLabels = Object.fromEntries(
  SCOUT_PROFILES.map(profile => [profile.id, profile.label])
)

const reliabilityLabels = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

const reliabilityColors = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
}

const warningLabels = {
  position_not_verified: 'חסרה עמדה',
  low_player_sample: 'מדגם שחקן נמוך',
  low_team_games_sample: 'מדגם קבוצתי נמוך',
  team_context_sensitive: 'רגיש להקשר קבוצתי',
}

const hiddenReliabilityWarnings = new Set([
  'role_inference_only',
  'penalties_not_separated',
])

export const rowProfileIds = row => {
  const doc = row.statsDoc || row

  return Array.from(new Set([
    ...(Array.isArray(row.scoutProfileIds) ? row.scoutProfileIds : []),
    ...(Array.isArray(row.rawScoutProfileIds) ? row.rawScoutProfileIds : []),
    ...(Array.isArray(doc.scoutProfileIds) ? doc.scoutProfileIds : []),
    ...(Array.isArray(doc.rawScoutProfileIds) ? doc.rawScoutProfileIds : []),
    ...(Array.isArray(doc.eligibleScoutProfileIds) ? doc.eligibleScoutProfileIds : []),
  ].map(clean).filter(Boolean)))
}

export const hasProfileId = (row, profileId) => {
  const id = clean(profileId)
  if (!id) return true

  if (
    id === 'promoted_talent' &&
    (
      row.isPlayingUp ||
      row.statsDoc?.isPlayingUp ||
      row.statsDoc?.current?.isYoungerAgeGroup ||
      Number(row.statsDoc?.current?.playingUpMinutes) > 0
    )
  ) {
    return true
  }

  return rowProfileIds(row).includes(id)
}

const getProfileLabel = (profile, id = '') =>
  clean(
    profile?.label ||
      profile?.profileLabel ||
      profile?.name ||
      profile?.title ||
      profileLabels[id] ||
      profile?.id ||
      id
  )

const getProfileById = (profiles, id) => {
  if (Array.isArray(profiles)) {
    return profiles.find(profile => clean(profile?.id) === clean(id))
  }

  return profiles?.[id]
}

export const getScoutProfilesView = row => {
  const doc = row.statsDoc || {}
  const current = doc.current || {}
  const isPlayingUp = Boolean(
    row.isPlayingUp ||
      doc.isPlayingUp ||
      current.isYoungerAgeGroup ||
      Number(current.playingUpMinutes) > 0
  )
  const eligibleProfiles = doc.eligibleScoutProfiles || doc.scoutProfiles || {}
  const rawProfiles = doc.rawScoutProfiles || {}
  const eligibleIds = Array.isArray(doc.eligibleScoutProfileIds)
    ? doc.eligibleScoutProfileIds
    : Array.isArray(doc.scoutProfileIds)
      ? doc.scoutProfileIds
      : []
  const rawIds = Array.isArray(doc.rawScoutProfileIds) ? doc.rawScoutProfileIds : []
  const ids = eligibleIds.length ? eligibleIds : rawIds
  const profiles = eligibleIds.length ? eligibleProfiles : rawProfiles

  if (!ids.length) {
    if (isPlayingUp) {
      return {
        label: profileLabels.promoted_talent || 'הכישרון המוקפץ',
        title: 'זוהה כשחקן משנתון מתחת',
        reliabilityLabel: 'בינונית',
        reliabilityTitle: 'חסר חישוב מלא ממסמך סטטיסטיקה עדכני',
        reliabilityColor: 'warning',
        color: 'success',
        variant: 'soft',
      }
    }

    return {
      label: '-',
      title: '',
      reliabilityLabel: '-',
      reliabilityTitle: '',
      reliabilityColor: 'neutral',
      color: 'neutral',
      variant: 'plain',
    }
  }

  const labels = ids
    .map(id => getProfileLabel(getProfileById(profiles, id), id))
    .filter(Boolean)
  const bestId = clean(
    doc.bestEligibleScoutProfileId ||
      doc.bestScoutProfileId ||
      doc.bestRawScoutProfileId
  )
  const bestLabel = clean(
    profileLabels[bestId] ||
      doc.bestEligibleScoutProfileLabel ||
      doc.bestScoutProfileLabel ||
      doc.bestRawScoutProfileLabel ||
      labels[0]
  )
  const extraCount = Math.max(ids.length - 1, 0)
  const bestProfile =
    getProfileById(profiles, bestId) ||
    getProfileById(profiles, ids[0]) ||
    {}
  const reliabilityLevel = clean(
    bestProfile.reliabilityLevel ||
      bestProfile.reliability?.level ||
      doc.bestScoutReliabilityLevel
  )
  const reliabilityScore =
    bestProfile.reliabilityScore ??
    bestProfile.reliability?.score ??
    doc.bestScoutReliabilityScore
  const warnings = [
    ...(Array.isArray(bestProfile.warnings) ? bestProfile.warnings : []),
    ...(Array.isArray(doc.scoutWarnings) ? doc.scoutWarnings : []),
  ]
  const missing = Array.from(new Set(warnings
    .filter(item => !hiddenReliabilityWarnings.has(item))
    .map(item => warningLabels[item] || item)
    .filter(Boolean)))
  const reliabilityLabel = reliabilityLevel
    ? `${reliabilityLabels[reliabilityLevel] || reliabilityLevel}${Number.isFinite(Number(reliabilityScore)) ? ` ${reliabilityScore}` : ''}`
    : '-'

  return {
    label: extraCount ? `${bestLabel} +${extraCount}` : bestLabel,
    title: labels.join(' | '),
    reliabilityLabel,
    reliabilityTitle: missing.length ? missing.join(' | ') : 'אין חוסרים מהותיים',
    reliabilityColor: reliabilityColors[reliabilityLevel] || 'neutral',
    color: eligibleIds.length ? 'success' : 'warning',
    variant: eligibleIds.length ? 'soft' : 'outlined',
  }
}
