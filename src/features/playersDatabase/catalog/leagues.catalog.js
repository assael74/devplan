const LEAGUE_DEFINITIONS = [
  {
    key: 'premier',
    name: 'ליגת העל',
    level: 1,
    region: '',
    aliases: ['על', 'ליגת על'],
  },
  {
    key: 'national-north',
    name: 'לאומית צפון',
    level: 2,
    region: 'north',
    aliases: ['לאומית צפון'],
  },
  {
    key: 'national-south',
    name: 'לאומית דרום',
    level: 2,
    region: 'south',
    aliases: ['לאומית דרום'],
  },
  {
    key: 'regional-north',
    name: 'ארצית צפון',
    level: 3,
    region: 'north',
    aliases: ['ארצית צפון'],
  },
  {
    key: 'regional-south',
    name: 'ארצית דרום',
    level: 3,
    region: 'south',
    aliases: ['ארצית דרום'],
  },
  ...[
    { key: 'district-center', name: 'מרכז', region: 'center' },
    { key: 'district-north', name: 'צפון', region: 'north' },
    { key: 'district-south', name: 'דרום', region: 'south' },
    { key: 'district-sharon', name: 'שרון', region: 'sharon' },
    { key: 'district-shfela', name: 'שפלה', region: 'shfela' },
    { key: 'district-dan', name: 'דן', region: 'dan' },
  ].map(definition => ({
    ...definition,
    level: 4,
    aliases: [
      definition.name,
      `ליגה ${definition.name}`,
      `ליגת ${definition.name}`,
      `מחוזית ${definition.name}`,
    ],
  })),
  ...Array.from({ length: 10 }, (_, index) => {
    const number = index + 1

    return {
      key: `district-${number}`,
      name: `מחוזית ${number}`,
      level: 4,
      region: String(number),
      aliases: [`מחוזית ${number}`],
    }
  }),
]

const SEASON_AGE_GROUP_BIRTH_YEARS = {
  '2025-2026': {
    u17: 2009,
    u16: 2010,
    u15: 2011,
    u14: 2012,
    u13: 2013,
  },
  '2026-2027': {
    u17: 2010,
    u16: 2011,
    u15: 2012,
    u14: 2013,
    u13: 2014,
  },
}

const AGE_GROUP_LABEL_BY_ID = {
  u17: 'נערים א',
  u16: 'נערים ב',
  u15: 'נערים ג',
  u14: 'ילדים א',
  u13: 'ילדים ב',
}

const DISTRICT_KEYS = Array.from({ length: 10 }, (_, index) => `district-${index + 1}`)
const REGIONAL_DISTRICT_KEYS = [
  'district-center',
  'district-north',
  'district-south',
  'district-sharon',
  'district-shfela',
  'district-dan',
]

const makeLeague = ({ seasonId, ageGroupId, definition }) => {
  const birthYear = SEASON_AGE_GROUP_BIRTH_YEARS[seasonId]?.[ageGroupId] || null
  const ageGroupLabel = AGE_GROUP_LABEL_BY_ID[ageGroupId] || ageGroupId

  return {
    id: `${seasonId}_${ageGroupId}_${definition.key}`,
    seasonId,
    leagueName: definition.name,
    name: definition.name,
    level: definition.level,
    region: definition.region,
    ageGroupId,
    ageGroupLabel,
    birthYear,
    aliases: [
      definition.name,
      ...definition.aliases,
      `${definition.name} ${ageGroupLabel}`,
      `${ageGroupLabel} ${definition.name}`,
      `ליגה ${ageGroupLabel} ${definition.name}`,
      `ליגת ${ageGroupLabel} ${definition.name}`,
    ],
  }
}

const buildLeaguesForAgeGroups = ({ seasonId, ageGroupIds, leagueKeys }) =>
  ageGroupIds.flatMap((ageGroupId) =>
    leagueKeys
      .map((key) => LEAGUE_DEFINITIONS.find((definition) => definition.key === key))
      .filter(Boolean)
      .map((definition) => makeLeague({ seasonId, ageGroupId, definition }))
  )

export const PLAYERS_DATABASE_LEAGUES_CATALOG = [
  ...buildLeaguesForAgeGroups({
    seasonId: '2025-2026',
    ageGroupIds: ['u17', 'u16', 'u15'],
    leagueKeys: ['premier', 'regional-north', 'regional-south', ...REGIONAL_DISTRICT_KEYS, ...DISTRICT_KEYS],
  }),
  ...buildLeaguesForAgeGroups({
    seasonId: '2025-2026',
    ageGroupIds: ['u14', 'u13'],
    leagueKeys: [...REGIONAL_DISTRICT_KEYS, ...DISTRICT_KEYS],
  }),
  ...buildLeaguesForAgeGroups({
    seasonId: '2026-2027',
    ageGroupIds: ['u17', 'u16'],
    leagueKeys: ['premier', 'regional-north', 'regional-south', ...REGIONAL_DISTRICT_KEYS, ...DISTRICT_KEYS],
  }),
  ...buildLeaguesForAgeGroups({
    seasonId: '2026-2027',
    ageGroupIds: ['u15'],
    leagueKeys: [
      'premier',
      'national-north',
      'national-south',
      'regional-north',
      'regional-south',
      ...REGIONAL_DISTRICT_KEYS,
      ...DISTRICT_KEYS,
    ],
  }),
  ...buildLeaguesForAgeGroups({
    seasonId: '2026-2027',
    ageGroupIds: ['u14', 'u13'],
    leagueKeys: [...REGIONAL_DISTRICT_KEYS, ...DISTRICT_KEYS],
  }),
]

export const PLAYERS_DATABASE_LEAGUE_DEFINITIONS = LEAGUE_DEFINITIONS
export const PLAYERS_DATABASE_SEASON_AGE_GROUP_BIRTH_YEARS = SEASON_AGE_GROUP_BIRTH_YEARS
