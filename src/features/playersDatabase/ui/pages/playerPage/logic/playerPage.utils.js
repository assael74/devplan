// features/playersDatabase/ui/pages/playerPage/logic/playerPage.utils.js

import {
  buildScoutProfileCombinations,
  SCOUT_PROFILES,
} from '../../../../../../shared/players/scouting/index.js'

const cleanValue = value => String(value || '').trim()

const SCOUT_PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const resolveScoutProfileLabel = profile => {
  const profileId = cleanValue(profile?.profileId || profile?.id)

  if (!profileId) return ''

  return cleanValue(
    profile?.label ||
    SCOUT_PROFILE_BY_ID[profileId]?.label ||
    profileId
  )
}

const buildScoutProfileDisplay = (profiles = []) => {
  const scoutProfiles = Array.isArray(profiles) ? profiles : []
  const signals = scoutProfiles
    .map(profile => ({
      ...profile,
      profileId: cleanValue(profile?.profileId || profile?.id),
    }))
    .filter(profile => profile.profileId)
  const combinations = buildScoutProfileCombinations({ signals })
  const combination = combinations[0] || null

  if (combination) {
    return {
      type: 'combination',
      id: cleanValue(combination.id),
      label: cleanValue(combination.label),
      reliability: cleanValue(
        scoutProfiles[0]?.reliabilityLevel ||
        scoutProfiles[0]?.profileReliability
      ),
      baseProfiles: (combination.matchedProfileIds || []).map(profileId => ({
        id: profileId,
        label: SCOUT_PROFILE_BY_ID[profileId]?.label || profileId,
      })),
    }
  }

  const primaryProfile = scoutProfiles[0] || null

  if (!primaryProfile) {
    return {
      type: 'none',
      id: '',
      label: '',
      reliability: '',
      baseProfiles: [],
    }
  }

  return {
    type: 'profile',
    id: cleanValue(primaryProfile.profileId || primaryProfile.id),
    label: resolveScoutProfileLabel(primaryProfile),
    reliability: cleanValue(
      primaryProfile.reliabilityLevel ||
      primaryProfile.profileReliability
    ),
    baseProfiles: [],
  }
}

export const toNumber = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

export const formatValue = value => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return value
}

export const parsePlayerMeta = value => {
  const text = cleanValue(value)

  if (!text) {
    return {
      position: '',
      birthYear: '',
    }
  }

  const parts = text
    .split('·')
    .map(part => part.trim())
    .filter(Boolean)

  const birthYearPart = parts.find(part => (
    part.includes('שנתון')
  ))
  const positionPart = parts.find(part => (
    !part.includes('שנתון')
  ))

  return {
    position: positionPart || '',
    birthYear: cleanValue(birthYearPart)
      .replace('שנתון', '')
      .trim(),
  }
}

export const resolvePlayerHeaderMeta = player => {
  const parsedMeta = parsePlayerMeta(player.ageLabel)

  return {
    fullName: cleanValue(player.fullName) || 'שחקן ללא שם',
    position: cleanValue(
      player.position ||
      parsedMeta.position
    ),
    birthYear: cleanValue(
      player.birthYear ||
      player.yearOfBirth ||
      parsedMeta.birthYear
    ),
    certainty: cleanValue(
      player.certainty ||
      player.reliability
    ) || 'לא ידועה',
  }
}

export const resolvePlayerHistoryRows = player => {
  const rows = (
    player.seasonContexts ||
    player.history ||
    player.seasons ||
    []
  )

  if (!Array.isArray(rows)) return []

  return rows.map((row, index) => ({
    id: row.id || [
      row.seasonKey,
      row.teamId,
      row.clubId,
      index,
    ].filter(Boolean).join('_'),
    seasonKey: row.seasonKey || row.season || '-',
    isCurrentSeason: Boolean(
      row.isCurrentSeason ||
      row.current ||
      row.target === 'current'
    ),
    clubName: row.clubShortName || row.clubName || row.club || '-',
    ageGroupLabel: row.ageGroupLabel || row.teamName || row.team || '-',
    teamName: row.ageGroupLabel || row.teamName || row.team || '-',
    leagueName: row.leagueName || row.league || '-',
    games: toNumber(row.games),
    starts: toNumber(row.starts),
    minutes: toNumber(row.minutes),
    goals: toNumber(row.goals),
    yellowCards: toNumber(row.yellowCards),
    scoutProfiles: Array.isArray(row.scoutProfiles) ? row.scoutProfiles : [],
    scoutProfileDisplay: row.scoutProfileDisplay || buildScoutProfileDisplay(row.scoutProfiles),
    profile: row.scoutProfileDisplay?.label || buildScoutProfileDisplay(row.scoutProfiles).label || '-',
    placeholder: Boolean(row.placeholder),
  }))
}

export const resolveCurrentSeasonContext = rows => {
  if (!rows.length) return {}

  return (
    rows.find(row => row.isCurrentSeason) ||
    rows[0] ||
    {}
  )
}

export const resolveProfilesLabel = profiles => {
  if (!Array.isArray(profiles) || !profiles.length) {
    return 'ללא פרופילים'
  }

  if (profiles.length === 1) {
    return profiles[0].label || profiles[0].name || 'פרופיל אחד'
  }

  return `${profiles.length} פרופילים`
}
