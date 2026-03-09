// teamProfile/modules/games/filters/gameFilters.config.js
const safe = (v) => (v == null ? '' : String(v))

export const gameInitialFilters = {
  result: 'all',
  type: 'all',
  difficulty: 'all',
}

export const gameFilterRules = {
  result: (iVal, fVal, row) => safe(row?.result).toLowerCase() === safe(fVal).toLowerCase(),
  type: (iVal, fVal, row) => safe(row?.type).toLowerCase() === safe(fVal).toLowerCase(),
  difficulty: (iVal, fVal, row) => safe(row?.difficulty).toLowerCase() === safe(fVal).toLowerCase(),
}
