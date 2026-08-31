// features/playersDatabase/ui/pages/teamPage/logic/teamStatsImport.logic.js

import {
  buildStatsHeaderMap,
  getMappedStatsCell,
  hasMappedStatsHeader,
  hasPlayerStatsHeader,
} from './teamStatsImport.headers.js'

import {
  buildLooseStatsRow,
  buildStatsFallbackMap,
  splitStatsCells,
} from './teamStatsImport.rows.js'

import {
  clean,
  toNumber,
} from './teamPage.utils.js'
import { isValidExternalPlayerId } from '../../../../model/playerIdentity.model.js'

const resolvePlayerIdFromUrl = value => {
  const match = clean(value).match(/[?&]player_id=(\d+)/i)
  return match?.[1] || ''
}

const getStatsCell = ({
  cells,
  headerMap,
  fallback,
  key,
}) => {
  if (hasMappedStatsHeader(headerMap)) {
    return getMappedStatsCell({
      cells,
      headerMap,
      key,
      fallbackIndex: fallback[key],
    })
  }

  const fallbackIndex = fallback[key]

  if (!Number.isInteger(fallbackIndex)) return ''

  return cells[fallbackIndex] || ''
}

const buildParsedStatsRow = ({
  cells,
  headerMap,
  rowIndex,
}) => {
  const fallback = buildStatsFallbackMap(cells)
  const fullName = getStatsCell({
    cells,
    headerMap,
    fallback,
    key: 'fullName',
  })
  const index = getStatsCell({
    cells,
    headerMap,
    fallback,
    key: 'index',
  })
  const birthYear = toNumber(getStatsCell({
    cells,
    headerMap,
    fallback,
    key: 'birthYear',
  }))
  const playerUrl = clean(getStatsCell({
    cells,
    headerMap,
    fallback,
    key: 'playerUrl',
  }))
  const mappedExternalPlayerId = clean(getStatsCell({
    cells,
    headerMap,
    fallback,
    key: 'externalPlayerId',
  }))
  const urlExternalPlayerId = resolvePlayerIdFromUrl(playerUrl)
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: urlExternalPlayerId,
    birthYear,
  })
    ? urlExternalPlayerId
    : isValidExternalPlayerId({
      externalPlayerId: mappedExternalPlayerId,
      birthYear,
    })
      ? mappedExternalPlayerId
      : ''

  return {
    id: `${rowIndex + 1}_${fullName || cells[0] || 'player'}`,
    index: index || `${rowIndex + 1}`,
    fullName,
    birthYear,
    externalPlayerId,
    playerUrl,
    games: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'games',
    })),
    goals: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'goals',
    })),
    yellowCards: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'yellowCards',
    })),
    starts: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'starts',
    })),
    substituteIn: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'substituteIn',
    })),
    substitutedOut: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'substitutedOut',
    })),
    minutes: toNumber(getStatsCell({
      cells,
      headerMap,
      fallback,
      key: 'minutes',
    })),
  }
}

export const parsePlayerStatsRows = value => {
  const rows = clean(value)
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)

  const headerRowIndex = rows.findIndex(hasPlayerStatsHeader)
  const headerCells = headerRowIndex >= 0
    ? splitStatsCells(rows[headerRowIndex])
    : []
  const headerMap = headerCells.length
    ? buildStatsHeaderMap(headerCells)
    : {}
  const dataRows = headerCells.length
    ? rows.slice(headerRowIndex + 1)
    : rows

  const parsedRows = dataRows.map((row, index) => {
    const cells = splitStatsCells(row)
    const looseRow = (
      !hasMappedStatsHeader(headerMap) &&
      cells.length === 1
    )
      ? buildLooseStatsRow(row, index)
      : null

    if (looseRow) return looseRow

    return buildParsedStatsRow({
      cells,
      headerMap,
      rowIndex: index,
    })
  })

  return parsedRows
}
