// C:\projects\devplan\src\features\playersDatabase\components\modals\leagueModalUtils.js
export const AGE_GROUPS = [
  { id: 'u17', label: 'נערים א' },
  { id: 'u16', label: 'נערים ב' },
  { id: 'u15', label: 'נערים ג' },
  { id: 'u14', label: 'ילדים א' },
  { id: 'u13', label: 'ילדים ב' },
]

export const EMPTY_LEAGUE_FORM = {
  leagueName: '',
  seasonId: '2025-2026',
  ageGroupId: 'u17',
  birthYear: 2009,
  region: '',
  leagueNum: 1,
  clubsCount: '',
}

export const clean = value =>
  String(value ?? '').trim()

export const getAgeGroupLabel = ageGroupId =>
  AGE_GROUPS.find(item => item.id === ageGroupId)?.label || ''

export const normalizeRegion = value => {
  const text = clean(value).toLowerCase()

  if (!text) return ''
  if (text === 'צפון' || text === 'north') return 'north'
  if (text === 'דרום' || text === 'south') return 'south'

  return text.replace(/\s+/g, '-')
}

export const deriveLeagueMeta = ({
  leagueName,
  region,
  leagueNum,
}) => {
  const name = clean(leagueName)
  const explicitRegion = normalizeRegion(region)

  if (
    name === 'על' ||
    name.includes('ליגת על')
  ) {
    return {
      level: 1,
      key: 'premier',
      region: explicitRegion,
    }
  }

  if (name.includes('לאומית')) {
    return {
      level: 2,
      key: 'national',
      region:
        explicitRegion ||
        (name.includes('צפון')
          ? 'north'
          : name.includes('דרום')
            ? 'south'
            : ''),
    }
  }

  if (name.includes('ארצית')) {
    return {
      level: 3,
      key: 'regional',
      region:
        explicitRegion ||
        (name.includes('צפון')
          ? 'north'
          : name.includes('דרום')
            ? 'south'
            : ''),
    }
  }

  if (name.includes('מחוזית')) {
    return {
      level: 4,
      key: 'district',
      region: explicitRegion || clean(leagueNum),
    }
  }

  return {
    level: null,
    key: '',
    region: explicitRegion,
  }
}

export const createSeasonKey = seasonId =>
  `s${clean(seasonId).replace(/[^0-9a-zA-Z]+/g, '_')}`

export const createLeagueId = form => {
  const meta = deriveLeagueMeta(form)

  return [
    clean(form.ageGroupId),
    meta.key,
    meta.region || 'general',
    `league_${clean(form.leagueNum)}`,
  ]
    .filter(Boolean)
    .join('_')
}

export const buildLeagueDocument = (
  form,
  userId = ''
) => {
  const meta = deriveLeagueMeta(form)
  const seasonKey = createSeasonKey(form.seasonId)
  const birthYear = Number(form.birthYear)
  const clubsCount = Number(form.clubsCount)
  const leagueNum = Number(form.leagueNum)

  return {
    id: createLeagueId(form),
    catalogLeagueId: '',
    leagueName: clean(form.leagueName),
    level: meta.level,
    region: meta.region,
    leagueNum,
    ageGroupId: clean(form.ageGroupId),
    ageGroupLabel: getAgeGroupLabel(form.ageGroupId),

    seasons: {
      [seasonKey]: {
        seasonId: clean(form.seasonId),
        birthYears: Number.isFinite(birthYear)
          ? [birthYear]
          : [],
        primaryBirthYear: Number.isFinite(birthYear)
          ? birthYear
          : null,
        clubsCount,
        loadedClubsCount: 0,
        clubIds: [],
        latestSnapshotId: null,
        latestSnapshotAt: null,
        snapshotsCount: 0,
      },
    },

    createdBy: userId,
    updatedBy: userId,
  }
}

export const validateLeagueForm = form => {
  const meta = deriveLeagueMeta(form)
  const birthYear = Number(form.birthYear)
  const leagueNum = Number(form.leagueNum)
  const clubsCount = Number(form.clubsCount)

  const requiredValues = [
    clean(form.leagueName),
    clean(form.seasonId),
    clean(form.ageGroupId),
    clean(form.birthYear),
    clean(form.leagueNum),
    clean(form.clubsCount),
  ]

  if (!requiredValues.every(Boolean)) return false
  if (!/^\d{4}-\d{4}$/.test(clean(form.seasonId))) return false
  if (!meta.level || !meta.key) return false
  if (!Number.isInteger(birthYear)) return false
  if (!Number.isInteger(leagueNum) || leagueNum < 1) return false
  if (!Number.isInteger(clubsCount) || clubsCount < 1) return false

  return true
}
