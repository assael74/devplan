// features/playersDatabase/ui/pages/playerPage/logic/playerPage.utils.js

import { resolveAgeGroupLabel } from '../../../../catalog/ageGroups.catalog.js'

const cleanValue = value => String(value || '').trim()

const RELIABILITY_LABELS = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

export const resolveCertaintyLabel = value => {
  if (value && typeof value === 'object') {
    const level = cleanValue(value.level)
    const label = cleanValue(value.label)

    return RELIABILITY_LABELS[level.toLowerCase()] ||
      label ||
      level ||
      'לא ידועה'
  }

  const level = cleanValue(value)

  return RELIABILITY_LABELS[level.toLowerCase()] ||
    level ||
    'לא ידועה'
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

  const birthYearPart = parts.find(part => part.includes('שנתון'))
  const positionPart = parts.find(part => !part.includes('שנתון'))

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
    position: cleanValue(player.position || parsedMeta.position),
    birthYear: cleanValue(
      player.birthYear ||
      player.yearOfBirth ||
      parsedMeta.birthYear
    ),
    certainty: resolveCertaintyLabel(
      player.certainty || player.reliability
    ),
  }
}

export const resolvePlayerHistoryRows = player => {
  const rows = player.seasonContexts || player.history || player.seasons || []

  if (!Array.isArray(rows)) return []

  return rows.map((row, index) => {
    const scoutProfileDisplay = row.scoutProfileDisplay || row.scout?.display || {
      type: 'none',
      id: '',
      label: '',
      reliability: {},
      baseProfiles: [],
    }

    return {
      ...row,
      id: row.id || [
        row.seasonKey,
        row.teamId,
        row.clubId,
        index,
      ].filter(Boolean).join('_'),
      seasonKey: row.seasonKey || row.season || '-',
      isCurrentSeason: Boolean(
        row.isCurrentSeason ||
        row.lifecycle?.type === 'current'
      ),
      clubName: row.clubShortName || row.clubName || row.club || '-',
      ageGroupLabel: resolveAgeGroupLabel({
        ageGroupId: row.ageGroupId,
        ageGroupLabel: row.ageGroupLabel || row.teamName || row.team,
      }),
      teamName: resolveAgeGroupLabel({
        ageGroupId: row.ageGroupId,
        ageGroupLabel: row.ageGroupLabel || row.teamName || row.team,
      }),
      leagueName: row.leagueName || row.league || '-',
      games: toNumber(row.games),
      starts: toNumber(row.starts),
      minutes: toNumber(row.minutes),
      goals: toNumber(row.goals),
      yellowCards: toNumber(row.yellowCards),
      scoutProfiles: Array.isArray(row.scoutProfiles)
        ? row.scoutProfiles
        : Array.isArray(row.scout?.profiles)
          ? row.scout.profiles
          : [],
      scoutProfileCount: Math.max(
        Array.isArray(row.scoutProfiles)
          ? row.scoutProfiles.length
          : 0,
        Array.isArray(row.scout?.profiles)
          ? row.scout.profiles.length
          : 0,
        Number(row.scoutProfileCount) || 0
      ),
      scoutProfileDisplay,
      profile: scoutProfileDisplay.label || '-',
      placeholder: Boolean(row.placeholder),
    }
  })
}

export const resolveCurrentSeasonContext = rows => {
  if (!rows.length) return {}

  return rows.find(row => row.isCurrentSeason) || rows[0] || {}
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
