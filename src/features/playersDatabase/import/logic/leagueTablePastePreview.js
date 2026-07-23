import { resolveClubCatalogMatch } from '../../catalog/catalogResolvers.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import {
  buildTeamIdentity,
  inferTeamSlotByLeagueLevel,
} from '../../catalog/teamIdentity.js'

const clean = (value) => String(value ?? '').trim()

const normalizeHeader = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[׳'״"]/g, '')
    .replace(/\s+/g, '')
    .replace(/[_-]/g, '')

const columns = {
  leaguePosition: ['מיקום', 'מקום', 'leaguePosition', 'position', 'rank'],
  clubName: ['קבוצה', 'מועדון', 'שם קבוצה', 'שם מועדון', 'team', 'club'],
  games: ['משחקים', 'משחק', "מש'", 'מש', 'games', 'matches'],
  wins: ['ניצחונות', 'נצחונות', "נצ'", 'נצ', 'wins'],
  draws: ['תיקו', "תי'", 'draws'],
  losses: ['הפסדים', "הפ'", 'הפ', 'losses'],
  goalsCombined: ['שערים', "שע'", 'שע', 'goals'],
  goalsFor: ['שערי זכות', 'זכות', 'gf', 'goalsfor'],
  goalsAgainst: ['שערי חובה', 'חובה', 'ga', 'goalsagainst'],
  points: ['נקודות', "נק'", 'נק', 'points', 'pts'],
}

const required = [
  'leaguePosition',
  'clubName',
  'games',
  'wins',
  'draws',
  'losses',
  'points',
]

const aliasMap = Object.entries(columns).reduce((acc, [field, aliases]) => {
  aliases.forEach((alias) => {
    acc[normalizeHeader(alias)] = field
  })
  return acc
}, {})

const detectDelimiter = (line = '') => {
  if (line.includes('\t')) return '\t'
  if (line.includes(';')) return ';'
  if (line.includes(',')) return ','
  return null
}

const splitLine = (line = '', delimiter = null) => {
  if (delimiter) return line.split(delimiter).map(clean).filter(Boolean)
  return line.split(/\s{2,}/).map(clean).filter(Boolean)
}

const parseText = (text = '') => {
  const rawText = String(text || '').trim()
  if (!rawText) {
    return { ok: false, message: 'לא הודבקו נתונים', lines: [], headers: [], rows: [] }
  }

  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const delimiter = detectDelimiter(lines[0] || '')

  return {
    ok: true,
    delimiter,
    lines,
    headers: splitLine(lines[0], delimiter),
    rows: lines.slice(1).map((line) => splitLine(line, delimiter)),
  }
}

const mapColumns = (headers = []) => {
  const mapped = {}
  const unknownHeaders = []

  headers.forEach((header, index) => {
    const field = aliasMap[normalizeHeader(header)]
    if (field) {
      mapped[field] = index
      return
    }

    if (clean(header)) unknownHeaders.push({ header, index })
  })

  const missingRequired = required.filter((field) => mapped[field] === undefined)
  const hasGoals = mapped.goalsCombined !== undefined || (mapped.goalsFor !== undefined && mapped.goalsAgainst !== undefined)
  if (!hasGoals) missingRequired.push('goals')

  return {
    mapped,
    unknownHeaders,
    missingRequired,
    ok: missingRequired.length === 0,
  }
}

const toNumber = (value) => {
  const text = clean(value).replace(/,/g, '')
  if (!text) return null

  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

const isLikelyClub = (value) =>
  /[\u0590-\u05ff]/.test(clean(value)) && !Number.isFinite(toNumber(value))

const splitGoals = (value) => {
  const text = clean(value)
  const parts = text.split(/[-:]/).map(toNumber)

  if (parts.length !== 2 || parts.some((item) => !Number.isFinite(item))) {
    return { goalsFor: null, goalsAgainst: null }
  }

  return {
    goalsAgainst: parts[0],
    goalsFor: parts[1],
  }
}

const clubById = (clubId) =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find((club) => club.id === clean(clubId)) || null

const candidateScore = (data = {}) => {
  let score = 0
  const leaguePosition = toNumber(data.leaguePosition)
  const games = toNumber(data.games)

  if (Number.isFinite(leaguePosition) && leaguePosition > 0 && leaguePosition < 80) score += 2
  if (isLikelyClub(data.clubName)) score += 3
  if (Number.isFinite(games) && games >= 0 && games < 80) score += 1
  if (data.goalsCombined || (data.goalsFor && data.goalsAgainst)) score += 1

  return score
}

const mapHeaderlessRow = (cells = [], rowIndex = 0) => {
  const row = cells.map(clean).filter(Boolean)
  const candidates = []

  if (row.length >= 9) {
    candidates.push({
      leaguePosition: row[0],
      clubName: row.slice(1, row.length - 7).join(' '),
      games: row[row.length - 7],
      wins: row[row.length - 6],
      draws: row[row.length - 5],
      losses: row[row.length - 4],
      goalsAgainst: row[row.length - 3],
      goalsFor: row[row.length - 2],
      points: row[row.length - 1],
    })
    candidates.push({
      points: row[0],
      goalsFor: row[1],
      goalsAgainst: row[2],
      losses: row[3],
      draws: row[4],
      wins: row[5],
      games: row[6],
      clubName: row.slice(7, row.length - 1).join(' '),
      leaguePosition: row[row.length - 1],
    })
  }

  if (row.length >= 8) {
    candidates.push({
      leaguePosition: row[0],
      clubName: row.slice(1, row.length - 6).join(' '),
      games: row[row.length - 6],
      wins: row[row.length - 5],
      draws: row[row.length - 4],
      losses: row[row.length - 3],
      goalsCombined: row[row.length - 2],
      points: row[row.length - 1],
    })
    candidates.push({
      points: row[0],
      goalsCombined: row[1],
      losses: row[2],
      draws: row[3],
      wins: row[4],
      games: row[5],
      clubName: row.slice(6, row.length - 1).join(' '),
      leaguePosition: row[row.length - 1],
    })
  }

  const data = candidates
    .map((candidate) => ({ candidate, score: candidateScore(candidate) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate || {}

  return {
    rowIndex,
    displayIndex: rowIndex + 1,
    raw: row,
    data,
  }
}

const mapRows = ({ rows = [], columnsMap = {} }) =>
  rows.map((row, rowIndex) => {
    const data = Object.entries(columnsMap.mapped).reduce((acc, [field, index]) => {
      acc[field] = row[index] ?? ''
      return acc
    }, {})

    return {
      rowIndex,
      displayIndex: rowIndex + 1,
      raw: row,
      data,
    }
  })

const normalizeRow = (row = {}, options = {}) => {
  const data = row.data || {}
  const clubOverrides = options.clubOverrides || {}
  const teamSlotOverrides = options.teamSlotOverrides || {}
  const teamSlot = toNumber(teamSlotOverrides[row.displayIndex]) ||
    inferTeamSlotByLeagueLevel(options.leagueLevel)
  const goals = data.goalsCombined
    ? splitGoals(data.goalsCombined)
    : {
        goalsFor: toNumber(data.goalsFor),
        goalsAgainst: toNumber(data.goalsAgainst),
      }
  const clubOverride = clubById(clubOverrides[row.displayIndex])
  const clubMatch = clubOverride
    ? {
        matched: true,
        id: clubOverride.id,
        name: clubOverride.name,
        confidence: 'manual',
        item: clubOverride,
      }
    : resolveClubCatalogMatch(data.clubName)

  return {
    ...row,
    data: {
      leaguePosition: toNumber(data.leaguePosition),
      clubName: clean(data.clubName),
      clubId: clean(clubMatch?.id),
      clubCatalogName: clean(clubMatch?.name),
      teamSlot,
      ...buildTeamIdentity({
        clubId: clean(clubMatch?.id),
        clubName: clean(clubMatch?.name || data.clubName),
        seasonId: options.seasonId,
        ageGroupId: options.ageGroupId,
        ageGroupLabel: options.ageGroupLabel,
        teamSlot,
        leagueId: options.leagueId,
        leagueName: options.leagueName,
      }),
      games: toNumber(data.games),
      wins: toNumber(data.wins),
      draws: toNumber(data.draws),
      losses: toNumber(data.losses),
      goalsFor: goals.goalsFor,
      goalsAgainst: goals.goalsAgainst,
      goalDifference: goals.goalsFor === null || goals.goalsAgainst === null ? null : goals.goalsFor - goals.goalsAgainst,
      points: toNumber(data.points),
    },
    clubMatch,
  }
}

const validateRow = (row = {}) => {
  const data = row.data || {}
  const errors = []

  if (!Number.isFinite(data.leaguePosition) || data.leaguePosition <= 0) errors.push('מיקום לא תקין')
  if (!data.clubName) errors.push('חסר שם קבוצה')
  if (!data.clubId) errors.push(`מועדון לא זוהה בקטלוג: ${data.clubName || '-'}`)

  ;['games', 'wins', 'draws', 'losses', 'goalsFor', 'goalsAgainst', 'points'].forEach((field) => {
    if (!Number.isFinite(data[field]) || data[field] < 0) {
      errors.push(`${field} לא תקין`)
    }
  })

  return {
    ...row,
    valid: errors.length === 0,
    status: errors.length ? 'error' : 'valid',
    errors,
  }
}

const summaryFrom = (rows = [], expectedRows = 0) => {
  const valid = rows.filter((row) => row.valid).length
  const error = rows.length - valid
  const matchedClubs = rows.filter((row) => row.data?.clubId).length
  const missingRows = Math.max(Number(expectedRows || 0) - rows.length, 0)
  const extraRows = Number(expectedRows || 0) ? Math.max(rows.length - Number(expectedRows || 0), 0) : 0

  return {
    total: rows.length,
    expectedRows: Number(expectedRows || 0),
    missingRows,
    extraRows,
    valid,
    error,
    matchedClubs,
    unmatchedClubs: rows.length - matchedClubs,
  }
}

export function buildLeagueTablePastePreview(text = '', options = {}) {
  const expectedRows = Number(options.expectedRows || 0)
  const clubOverrides = options.clubOverrides || {}
  const teamSlotOverrides = options.teamSlotOverrides || {}
  const parsed = parseText(text)

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
      headers: [],
      rows: [],
      summary: summaryFrom([], expectedRows),
      missingRequired: [],
      unknownHeaders: [],
    }
  }

  const columnsMap = mapColumns(parsed.headers)
  const sourceRows = columnsMap.ok
    ? mapRows({ rows: parsed.rows, columnsMap })
    : parsed.lines.map((line, index) => mapHeaderlessRow(splitLine(line, parsed.delimiter), index))

  if (!columnsMap.ok && !sourceRows.length) {
    return {
      ok: false,
      message: 'חסרות עמודות חובה',
      headers: parsed.headers,
      rows: [],
      summary: summaryFrom([], expectedRows),
      missingRequired: columnsMap.missingRequired,
      unknownHeaders: columnsMap.unknownHeaders,
    }
  }

  const rows = sourceRows
    .map((row) => normalizeRow(row, {
      ...options,
      clubOverrides,
      teamSlotOverrides,
    }))
    .map(validateRow)

  const summary = summaryFrom(rows, expectedRows)
  const ok = summary.error === 0 && summary.missingRows === 0 && summary.extraRows === 0

  return {
    ok,
    message: ok ? 'הטבלה מוכנה לשמירה' : 'יש שורות שדורשות תיקון',
    headers: columnsMap.ok ? parsed.headers : [],
    rows,
    summary,
    missingRequired: columnsMap.ok ? [] : columnsMap.missingRequired,
    unknownHeaders: columnsMap.ok ? columnsMap.unknownHeaders : [],
  }
}

export function buildLeagueTableWritePlanFromPreview(preview = {}, context = {}) {
  const rows = (preview.rows || []).filter((row) => row.valid)
  const seasonKey = `s${clean(context.seasonId).replace(/[^0-9a-zA-Z]+/g, '_')}`
  const clubIds = rows.map((row) => row.data.clubId).filter(Boolean)

  return {
    flowType: 'league_table',
    leaguesToUpsert: [{
      id: clean(context.leagueId),
      leagueName: clean(context.leagueName),
      level: context.level ?? null,
      region: clean(context.region),
      leagueNum: context.leagueNum ?? null,
      ageGroupId: clean(context.ageGroupId),
      ageGroupLabel: clean(context.ageGroupLabel),
      seasons: {
        [seasonKey]: {
          seasonId: clean(context.seasonId),
          birthYears: context.primaryBirthYear ? [Number(context.primaryBirthYear)] : [],
          primaryBirthYear: context.primaryBirthYear ? Number(context.primaryBirthYear) : null,
          clubsCount: Number(context.clubsCount || rows.length),
          loadedClubsCount: rows.length,
          clubIds,
        },
      },
    }],
    summary: {
      leaguesToUpsert: 1,
      warnings: 0,
      blockedRows: preview.ok ? 0 : 1,
    },
  }
}
