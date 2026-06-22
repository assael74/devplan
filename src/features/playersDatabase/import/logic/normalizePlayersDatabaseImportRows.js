const clean = (value) => String(value ?? '').trim()

const HEADER_ALIASES = {
  externalPlayerId: [
    'externalPlayerId',
    'playerExternalId',
    'Player ID',
    'player id',
    'מזהה שחקן',
    'external id',
    'external_id',
    'מזהה שחקן',
    'מזהה חיצוני',
  ],
  profileUrl: [
    'profileUrl',
    'playerProfileUrl',
    'profile url',
    'קישור שחקן',
    'קישור',
    'קישור שחקן',
    'קישור פרופיל',
  ],
  externalTeamId: [
    'externalTeamId',
    'teamExternalId',
    'Team ID',
    'team id',
    'מזהה קבוצה',
    'מזהה קבוצה',
  ],
  teamUrl: [
    'teamUrl',
    'teamProfileUrl',
    'team url',
    'קישור קבוצה',
    'קישור קבוצה',
  ],
  fullName: [
    'fullName',
    'playerName',
    'name',
    'שם שחקן',
    'שם',
    'שם שחקן',
  ],
  birthYear: [
    'birthYear',
    'birth',
    'שנתון',
    'שנתון',
    'שנת לידה',
  ],
  birthDate: [
    'birthDate',
    'dateOfBirth',
    'birthDay',
    'birthday',
    'birthMonthYear',
    'monthBirthYear',
    'month/year birth',
    'חודש/שנת לידה',
    'חודש שנת לידה',
    'תאריך לידה',
  ],
  primaryPosition: [
    'primaryPosition',
    'positionCode',
    'playerPosition',
    'עמדה',
  ],
  positions: [
    'positions',
    'positionList',
    'עמדות',
  ],
  positionLayer: [
    'positionLayer',
    'layer',
    'חוליה',
  ],
  clubName: [
    'clubName',
    'club',
    'מועדון',
    'מועדון',
    'שם מועדון',
  ],
  teamName: [
    'teamName',
    'team',
    'שם הקבוצה',
    'שם קבוצה',
    'שם הקבוצה',
  ],
  teamSlot: [
    'teamSlot',
    'teamNumber',
    'team no',
    'קבוצה',
    'קבוצה',
    'מספר קבוצה',
  ],
  leagueName: [
    'leagueName',
    'league',
    'ליגה',
    'ליגה',
    'שם ליגה',
  ],
  leagueNum: [
    'leagueNum',
    'leagueNumber',
    'league no',
    'league #',
    'מספר ליגה',
    'ליגה מספר',
  ],
  teamsCount: [
    'teamsCount',
    'teamCount',
    'clubsCount',
    'clubCount',
    'numberOfTeams',
    'מספר קבוצות',
    'כמות קבוצות',
    'מספר מועדונים',
    'כמות מועדונים',
  ],
  seasonId: [
    'seasonId',
    'season',
    'עונה',
    'עונה',
  ],
  ageGroupId: [
    'ageGroupId',
    'ageGroup',
    'קבוצת גיל',
    'גיל',
    'קבוצת גיל',
    'שכבת גיל',
  ],
  position: [
    'position',
    'rank',
    'place',
    'מס׳',
    'מיקום',
    'מקום',
    'מס׳',
    'מס',
  ],
  games: [
    'games',
    'matches',
    'משחקים',
  ],
  wins: [
    'wins',
    'נצחונות',
    'ניצחונות',
  ],
  draws: [
    'draws',
    'תיקו',
  ],
  losses: [
    'losses',
    'הפסדים',
  ],
  goalsFor: [
    'goalsFor',
    'gf',
    'שערי זכות',
  ],
  goalsAgainst: [
    'goalsAgainst',
    'ga',
    'שערי חובה',
  ],
  goalDifference: [
    'goalDifference',
    'gd',
    'הפרש שערים',
  ],
  points: [
    'points',
    'pts',
    'נקודות',
  ],
  capturedAt: [
    'capturedAt',
    'snapshotDate',
    'date',
    'תאריך צילום',
    'תאריך',
  ],
  roundNumber: [
    'roundNumber',
    'round',
    'matchday',
    'מחזור',
    'מספר מחזור',
  ],
  minutes: [
    'minutes',
    'דקות',
    'דקות משחק',
  ],
  goals: [
    'goals',
    'שערים',
  ],
  appearances: [
    'appearances',
    'הופעות',
  ],
  starts: [
    'starts',
    'הרכב',
    'פתח בהרכב',
  ],
  playingUpMinutes: [
    'playingUpMinutes',
    'דקות בשנתון מעל',
    'שנתון מעל',
  ],
}

const normalizeHeader = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')

const aliasMap = Object.entries(HEADER_ALIASES).reduce((acc, [field, aliases]) => {
  aliases.forEach((alias) => {
    acc[normalizeHeader(alias)] = field
  })
  return acc
}, {})

const toNumberOrEmpty = (value) => {
  const text = clean(value).replace(/,/g, '')
  if (!text) return ''

  const n = Number(text)
  return Number.isFinite(n) ? n : ''
}

const NUMERIC_FIELDS = new Set([
  'birthYear',
  'leagueNum',
  'teamsCount',
  'position',
  'teamSlot',
  'games',
  'wins',
  'draws',
  'losses',
  'goalsFor',
  'goalsAgainst',
  'goalDifference',
  'points',
  'roundNumber',
  'minutes',
  'goals',
  'appearances',
  'starts',
  'playingUpMinutes',
])

export function normalizePlayersDatabaseImportRows({ headers = [], rows = [] } = {}) {
  const mappedHeaders = headers.map((header) => aliasMap[normalizeHeader(header)] || '')
  const unknownHeaders = headers.filter((header, index) => !mappedHeaders[index] && clean(header))

  const normalizedRows = rows.map((row, rowIndex) => {
    const item = {
      rowId: `import-row-${rowIndex + 1}`,
    }

    row.forEach((cell, cellIndex) => {
      const field = mappedHeaders[cellIndex]
      if (!field) return

      item[field] = NUMERIC_FIELDS.has(field) ? toNumberOrEmpty(cell) : clean(cell)
    })

    return item
  })

  return {
    rows: normalizedRows,
    unknownHeaders,
    mappedHeaders,
  }
}
