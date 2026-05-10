// teamProfile/sharedLogic/games/insightsLogic/viewModel/tooltips/gameTooltip.model.js

import {
  formatPct,
  formatSignedGap,
  hasValue,
  pickValue,
  toNum,
} from '../common/index.js'

function getGameObject(row = {}) {
  if (row?.game) return row.game

  return row
}

function getGameOpponent(row = {}) {
  const game = getGameObject(row)

  return pickValue(
    [
      row.rivel,
      row.rival,
      row.opponent,
      row.opponentName,
      game.rivel,
      game.rival,
      game.opponent,
      game.opponentName,
    ],
    'יריבה'
  )
}

function getGameGoalsFor(row = {}) {
  const game = getGameObject(row)

  return toNum(
    pickValue([
      row.goalsFor,
      row.gf,
      row.scoreFor,
      game.goalsFor,
      game.gf,
      game.scoreFor,
    ])
  )
}

function getGameGoalsAgainst(row = {}) {
  const game = getGameObject(row)

  return toNum(
    pickValue([
      row.goalsAgainst,
      row.ga,
      row.scoreAgainst,
      game.goalsAgainst,
      game.ga,
      game.scoreAgainst,
    ])
  )
}

function getGamePoints(row = {}) {
  const game = getGameObject(row)
  const explicit = pickValue([row.points, row.gamePoints, game.points], null)

  if (hasValue(explicit)) return toNum(explicit)

  const goalsFor = getGameGoalsFor(row)
  const goalsAgainst = getGameGoalsAgainst(row)

  if (goalsFor > goalsAgainst) return 3
  if (goalsFor === goalsAgainst) return 1

  return 0
}

export function buildGameResultRow(row = {}) {
  const game = getGameObject(row)
  const opponent = getGameOpponent(row)
  const goalsFor = getGameGoalsFor(row)
  const goalsAgainst = getGameGoalsAgainst(row)
  const points = getGamePoints(row)

  return {
    id: row.id || game.id || `${opponent}-${goalsFor}-${goalsAgainst}`,
    text: `${opponent} · ${goalsFor}-${goalsAgainst} · ${points} נק׳`,
  }
}

export function buildGameResultRows(rows = []) {
  if (!Array.isArray(rows)) return []

  return rows.map(buildGameResultRow)
}

export function buildBaseGameTooltipRows(item, actual) {
  return [
    {
      id: 'actual',
      label: 'בפועל',
      value: formatPct(actual),
    },
    {
      id: 'points',
      label: 'נקודות',
      value: `${item?.points || 0}/${item?.maxPoints || 0}`,
    },
    {
      id: 'games',
      label: 'משחקים',
      value: `${item?.games || 0}`,
    },
  ]
}

export function addTargetRows(rows, actual, targetRate) {
  if (targetRate === null || targetRate === undefined) return

  const gap = actual - targetRate

  rows.push({
    id: 'target',
    label: 'יעד',
    value: formatPct(targetRate),
  })

  rows.push({
    id: 'gap',
    label: 'סטייה',
    value: formatSignedGap(gap),
  })
}

export function addResultRows(rows, gameRows) {
  const resultRows = buildGameResultRows(gameRows)

  if (!resultRows.length) return

  rows.push({
    id: 'results',
    label: 'תוצאות',
    items: resultRows,
  })
}

export function buildGameTooltipRows({ item, actual, targetRate }) {
  const rows = buildBaseGameTooltipRows(item, actual)

  addTargetRows(rows, actual, targetRate)
  addResultRows(rows, item?.rows)

  return rows
}
