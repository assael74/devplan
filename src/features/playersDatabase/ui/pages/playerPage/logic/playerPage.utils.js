// src/features/playersDatabase/ui/pages/playerPage/logic/playerPage.utils.js

import { resolveAgeGroupLabel } from '../../../../catalog/ageGroups.catalog.js'

const cleanValue = value => {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'object'
  ) {
    return ''
  }

  return String(value).trim()
}

const resolveStrengthDepthPct = value => {
  if (value && typeof value === 'object') {
    const number = Number(value.depthPct)
    return Number.isFinite(number) ? number : null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const resolvePlayerScopeProfileStrength = rows => {
  const depthValues = (Array.isArray(rows) ? rows : []).flatMap(row => {
    const profiles = Array.isArray(row.scoutProfiles)
      ? row.scoutProfiles
      : []

    return profiles
      .map(profile => resolveStrengthDepthPct(profile?.profileStrength))
      .filter(value => value !== null)
  })

  if (!depthValues.length) {
    return {
      label: '-',
      color: 'neutral',
    }
  }

  const maxDepthPct = Math.max(...depthValues)

  return {
    label: `${Math.round(maxDepthPct)}%`,
    color: 'neutral',
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
  const scoutProfiles = Array.isArray(player.scoutProfiles)
    ? player.scoutProfiles
    : []

  return {
    fullName: cleanValue(player.fullName) || 'שחקן ללא שם',
    position: cleanValue(player.position || parsedMeta.position),
    birthYear: cleanValue(
      player.birthYear ||
      player.yearOfBirth ||
      parsedMeta.birthYear
    ),
    hasScoutProfiles: scoutProfiles.length > 0,
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
