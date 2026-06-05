// src/features/hub/teamProfile/editLogic/games/entryGames/import/entryImport.logic.js

import {
  clean,
  toNum,
} from '../entryGame.shared.js'

import {
  getAssistsTotal,
  getGameDurationLimit,
  getGoalsTotal,
  getOnStartTotal,
  getTeamGoalsLimit,
} from '../teamGameEntry.model.js'

const TRUE_VALUES = ['כן', 'כן.', 'true', '1', 'v', 'וי', 'בסגל', 'הרכב', 'פותח']
const FALSE_VALUES = ['לא', 'false', '0', 'x', 'לא בסגל', 'לא בהרכב']

const COLUMN_ALIASES = {
  playerNumber: ['מספר', 'מספר חולצה', 'חולצה', 'number', 'shirt', 'playerNumber'],
  playerName: ['שם', 'שם שחקן', 'שחקן', 'player', 'playerName', 'name'],
  onSquad: ['בסגל', 'סגל', 'onSquad', 'squad'],
  onStart: ['הרכב', 'פותח', 'onStart', 'starting', 'start'],
  timePlayed: ['דקות', 'דקות משחק', 'זמן משחק', 'timePlayed', 'minutes'],
  goals: ['שערים', 'גולים', 'goals'],
  assists: ['בישולים', 'assists'],
}

const cleanKey = value => {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]/g, '')
}

const normalizeName = value => {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[״"']/g, '')
}

const splitRows = text => {
  return clean(text)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
}

const splitCells = line => {
  if (line.includes('\t')) return line.split('\t').map(clean)
  if (line.includes(';')) return line.split(';').map(clean)
  return line.split(',').map(clean)
}

const buildColumnMap = headers => {
  const aliases = Object.entries(COLUMN_ALIASES).reduce((acc, [field, list]) => {
    list.forEach(label => {
      acc[cleanKey(label)] = field
    })

    return acc
  }, {})

  return headers.reduce((acc, header, index) => {
    const field = aliases[cleanKey(header)]
    if (field) acc[field] = index
    return acc
  }, {})
}

const parseBool = value => {
  const v = clean(value).toLowerCase()

  if (!v) return null
  if (TRUE_VALUES.includes(v)) return true
  if (FALSE_VALUES.includes(v)) return false

  return null
}

const parseOptionalNum = value => {
  const v = clean(value)
  if (!v) return ''

  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : ''
}

const findPlayerMatch = ({ importRow, existingRows }) => {
  const number = clean(importRow.playerNumber)
  const name = normalizeName(importRow.playerName)

  if (number) {
    const byNumber = existingRows.filter(row => {
      return clean(row?.playerNumber) === number
    })

    if (byNumber.length === 1) {
      return {
        status: 'matched',
        row: byNumber[0],
        by: 'number',
      }
    }

    if (byNumber.length > 1) {
      return {
        status: 'ambiguous',
        row: null,
        by: 'number',
      }
    }
  }

  if (name) {
    const byName = existingRows.filter(row => {
      return normalizeName(row?.playerName) === name
    })

    if (byName.length === 1) {
      return {
        status: 'matched',
        row: byName[0],
        by: 'name',
      }
    }

    if (byName.length > 1) {
      return {
        status: 'ambiguous',
        row: null,
        by: 'name',
      }
    }

    const partial = existingRows.filter(row => {
      const rowName = normalizeName(row?.playerName)
      return rowName.includes(name) || name.includes(rowName)
    })

    if (partial.length === 1) {
      return {
        status: 'matched',
        row: partial[0],
        by: 'partialName',
      }
    }

    if (partial.length > 1) {
      return {
        status: 'ambiguous',
        row: null,
        by: 'partialName',
      }
    }
  }

  return {
    status: 'notFound',
    row: null,
    by: '',
  }
}

export function parseEntryImportText(text = '') {
  const lines = splitRows(text)

  if (lines.length < 2) {
    return {
      ok: false,
      message: 'צריך שורת כותרות ולפחות שורת שחקן אחת',
      rows: [],
      headers: [],
      columnMap: {},
    }
  }

  const headers = splitCells(lines[0])
  const columnMap = buildColumnMap(headers)

  if (columnMap.playerName == null && columnMap.playerNumber == null) {
    return {
      ok: false,
      message: 'חסרה עמודת שם שחקן או מספר חולצה',
      rows: [],
      headers,
      columnMap,
    }
  }

  const rows = lines.slice(1).map((line, index) => {
    const cells = splitCells(line)

    const get = field => {
      const cellIndex = columnMap[field]
      return cellIndex == null ? '' : cells[cellIndex]
    }

    return {
      importIndex: index,
      displayIndex: index + 1,
      raw: cells,
      playerNumber: get('playerNumber'),
      playerName: get('playerName'),
      onSquad: parseBool(get('onSquad')),
      onStart: parseBool(get('onStart')),
      timePlayed: parseOptionalNum(get('timePlayed')),
      goals: parseOptionalNum(get('goals')),
      assists: parseOptionalNum(get('assists')),
    }
  })

  return {
    ok: true,
    message: '',
    rows,
    headers,
    columnMap,
  }
}

export function buildEntryImportPreview({ text = '', draft = {} }) {
  const parsed = parseEntryImportText(text)

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message,
      rows: [],
      summary: {
        total: 0,
        matched: 0,
        error: 0,
      },
    }
  }

  const existingRows = Array.isArray(draft?.rows) ? draft.rows : []

  const rows = parsed.rows.map(importRow => {
    const match = findPlayerMatch({
      importRow,
      existingRows,
    })

    const errors = []

    if (match.status === 'notFound') {
      errors.push('לא נמצא שחקן מתאים')
    }

    if (match.status === 'ambiguous') {
      errors.push('נמצאו כמה שחקנים אפשריים')
    }

    return {
      ...importRow,
      status: errors.length ? 'error' : 'matched',
      valid: errors.length === 0,
      errors,
      matchBy: match.by,
      playerId: match.row?.playerId || '',
      currentRow: match.row || null,
      resolvedPlayerName: match.row?.playerName || '',
      resolvedPlayerNumber: match.row?.playerNumber || '',
    }
  })

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1
      if (row.valid) acc.matched += 1
      else acc.error += 1
      return acc
    },
    {
      total: 0,
      matched: 0,
      error: 0,
    }
  )

  return {
    ok: summary.error === 0,
    message: summary.error ? 'יש שורות שלא זוהו' : 'השורות מוכנות להחלה',
    rows,
    summary,
  }
}

function buildNextRowFromImport({ row, importRow, draft }) {
  const isPlayed = draft?.isPlayed === true

  const importedOnSquad =
    importRow.onSquad == null
      ? row.onSquad === true
      : importRow.onSquad === true

  const importedOnStart =
    importRow.onStart == null
      ? row.onStart === true
      : importRow.onStart === true

  const next = {
    ...row,
    onSquad: importedOnSquad,
    onStart: importedOnSquad ? importedOnStart : false,
  }

  if (!importedOnSquad || !isPlayed) {
    next.goals = importedOnSquad ? row.goals : ''
    next.assists = importedOnSquad ? row.assists : ''
    next.timePlayed = importedOnSquad ? row.timePlayed : ''
    return next
  }

  if (importRow.goals !== '') next.goals = Math.max(0, toNum(importRow.goals))
  if (importRow.assists !== '') next.assists = Math.max(0, toNum(importRow.assists))
  if (importRow.timePlayed !== '') {
    next.timePlayed = Math.max(
      0,
      Math.min(toNum(importRow.timePlayed), getGameDurationLimit(draft))
    )
  }

  return next
}

function enforceEntryLimits(rows = [], draft = {}) {
  const isPlayed = draft?.isPlayed === true
  const teamGoalsLimit = getTeamGoalsLimit(draft)
  const gameDurationLimit = getGameDurationLimit(draft)

  let starters = 0
  let goalsTotal = 0
  let assistsTotal = 0

  return rows.map(row => {
    const next = { ...row }

    if (next.onStart === true) {
      starters += 1
      if (starters > 11) next.onStart = false
    }

    if (!next.onSquad) {
      next.onStart = false
      next.goals = ''
      next.assists = ''
      next.timePlayed = ''
      return next
    }

    if (!isPlayed) {
      next.goals = ''
      next.assists = ''
      next.timePlayed = ''
      return next
    }

    if (next.timePlayed !== '') {
      next.timePlayed = Math.max(0, Math.min(toNum(next.timePlayed), gameDurationLimit))
    }

    if (next.goals !== '') {
      const allowed = Math.max(0, teamGoalsLimit - goalsTotal)
      next.goals = Math.max(0, Math.min(toNum(next.goals), allowed))
      goalsTotal += toNum(next.goals)
    }

    if (next.assists !== '') {
      const allowed = Math.max(0, teamGoalsLimit - assistsTotal)
      next.assists = Math.max(0, Math.min(toNum(next.assists), allowed))
      assistsTotal += toNum(next.assists)
    }

    return next
  })
}

export function applyEntryImportToRows({ draft = {}, preview = {} }) {
  const importRows = Array.isArray(preview?.rows)
    ? preview.rows.filter(row => row.valid && row.playerId)
    : []

  if (!importRows.length) return draft?.rows || []

  const importMap = new Map(importRows.map(row => [row.playerId, row]))

  const nextRows = (draft?.rows || []).map(row => {
    const importRow = importMap.get(row.playerId)
    if (!importRow) return row

    return buildNextRowFromImport({
      row,
      importRow,
      draft,
    })
  })

  return enforceEntryLimits(nextRows, draft)
}
