// src/features/playersDatabase/models/league.model.js

import { PLAYERS_DATABASE_AGE_GROUPS_CATALOG } from '../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_LEAGUE_DEFINITIONS } from '../catalog/leagues.catalog.js'

export const clean = value =>
  String(value ?? '').trim()

const normalizeText = value =>
  clean(value)
    .toLowerCase()
    .replace(/[״"]/g, '')
    .replace(/[׳']/g, '')
    .replace(/\s+/g, ' ')

export const normalizeRegion = value => {
  const text = normalizeText(value)

  if (!text) return ''
  if (text === 'צפון' || text === 'north') return 'north'
  if (text === 'דרום' || text === 'south') return 'south'

  return text.replace(/\s+/g, '-')
}

export const getAgeGroupLabel = ageGroupId =>
  PLAYERS_DATABASE_AGE_GROUPS_CATALOG.find(
    item => item.id === clean(ageGroupId)
  )?.label || ''

const getLeagueKey = level => {
  if (level === 1) return 'premier'
  if (level === 2) return 'national'
  if (level === 3) return 'regional'
  if (level === 4) return 'district'

  return ''
}

const matchesDefinition = (definition, leagueName) => {
  const name = normalizeText(leagueName)
  if (!name) return false

  const candidates = [
    definition.name,
    ...(definition.aliases || []),
  ]
    .map(normalizeText)
    .filter(Boolean)

  return candidates.some(candidate =>
    name === candidate || name.includes(candidate)
  )
}

const findDefinition = leagueName =>
  PLAYERS_DATABASE_LEAGUE_DEFINITIONS.find(
    definition => matchesDefinition(definition, leagueName)
  ) || null

const deriveLevelFromName = leagueName => {
  const name = normalizeText(leagueName)

  if (
    name === 'על' ||
    name.includes('ליגת על')
  ) {
    return 1
  }

  if (name.includes('לאומית')) return 2
  if (name.includes('ארצית')) return 3
  if (name.includes('מחוזית')) return 4

  return null
}

const deriveRegionFromName = leagueName => {
  const name = normalizeText(leagueName)

  if (name.includes('צפון')) return 'north'
  if (name.includes('דרום')) return 'south'

  return ''
}

export const deriveLeagueMeta = ({
  leagueName,
  region,
} = {}) => {
  const definition = findDefinition(leagueName)
  const level =
    definition?.level ??
    deriveLevelFromName(leagueName)

  const key = getLeagueKey(level)
  const explicitRegion = normalizeRegion(region)

  if (!level || !key) {
    return {
      level: null,
      key: '',
      region: explicitRegion,
    }
  }

  if (level === 4) {
    return {
      level,
      key,
      region:
        explicitRegion ||
        definition?.region ||
        '',
    }
  }

  return {
    level,
    key,
    region:
      explicitRegion ||
      definition?.region ||
      deriveRegionFromName(leagueName),
  }
}

export const createSeasonKey = seasonId =>
  `s${clean(seasonId).replace(/[^0-9a-zA-Z]+/g, '_')}`

export const createLeagueId = form => {
  const meta = deriveLeagueMeta(form)

  return [
    clean(form?.ageGroupId),
    meta.key,
    meta.region || 'general',
    `y${clean(form?.birthYear)}`,
  ]
    .filter(Boolean)
    .join('_')
}

export const createLeagueSeason = ({
  seasonId,
  birthYear,
  clubsCount,
} = {}) => {
  const numericBirthYear = Number(birthYear)
  const numericClubsCount = Number(clubsCount)

  return {
    seasonId: clean(seasonId),
    birthYears: Number.isInteger(numericBirthYear)
      ? [numericBirthYear]
      : [],
    primaryBirthYear: Number.isInteger(numericBirthYear)
      ? numericBirthYear
      : null,
    clubsCount: Number.isInteger(numericClubsCount)
      ? numericClubsCount
      : 0,
    loadedClubsCount: 0,
    clubIds: [],
    latestSnapshotId: null,
    latestSnapshotAt: null,
    snapshotsCount: 0,
  }
}

export const buildLeagueDocument = (
  form,
  userId = ''
) => {
  const meta = deriveLeagueMeta(form)
  const seasonKey = createSeasonKey(form?.seasonId)

  return {
    id: createLeagueId(form),
    catalogLeagueId: '',
    leagueName: clean(form?.leagueName),
    level: meta.level,
    region: meta.region,
    leagueNum: Number.isInteger(Number(form?.leagueNum))
      ? Number(form?.leagueNum)
      : null,
    ageGroupId: clean(form?.ageGroupId),
    ageGroupLabel: getAgeGroupLabel(form?.ageGroupId),

    seasons: {
      [seasonKey]: createLeagueSeason({
        seasonId: form?.seasonId,
        birthYear: form?.birthYear,
        clubsCount: form?.clubsCount,
      }),
    },

    createdBy: clean(userId),
    updatedBy: clean(userId),
  }
}

export const isValidSeasonId = value =>
  /^\d{4}-\d{4}$/.test(clean(value))

export const validateLeagueForm = form => {
  const meta = deriveLeagueMeta(form)
  const birthYear = Number(form?.birthYear)
  const clubsCount = Number(form?.clubsCount)

  const requiredValues = [
    clean(form?.leagueName),
    clean(form?.seasonId),
    clean(form?.ageGroupId),
    clean(form?.birthYear),
    clean(form?.clubsCount),
  ]

  if (!requiredValues.every(Boolean)) return false
  if (!isValidSeasonId(form?.seasonId)) return false
  if (!meta.level || !meta.key) return false
  if (!Number.isInteger(birthYear)) return false
  if (!Number.isInteger(clubsCount) || clubsCount < 1) return false

  return true
}
