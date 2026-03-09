export const statusStats = (game, statsParm = []) => {
  if (!game) {
    return {
      status: 'empty',
      countIsStarting: { trueCount: 0, falseCount: 0, hasTrue: false },
      countIsSelect: { trueCount: 0, falseCount: 0, hasTrue: false },
    }
  }

  const rows = Array.isArray(game.playerStats) ? game.playerStats : []

  const defaultFields = new Set((statsParm || []).filter((p) => p.isDefault).map((p) => p.id))

  const EXCLUDED = new Set([
    'playerId',
    'teamId',
    'gameId',
    'isStarting',
    'isSelected',
    'timeVideoStats',
    'position',
  ])

  const isFilled = (v) => v !== null && v !== undefined && v !== ''

  const countByKey = (key) => {
    let t = 0,
      f = 0
    for (const r of rows) r?.[key] ? t++ : f++
    return { trueCount: t, falseCount: f, hasTrue: t > 0 }
  }

  const isStartingNum = countByKey('isStarting')
  const isSelectNum = countByKey('isSelected')

  const defaultFilled = isStartingNum.hasTrue || isSelectNum.hasTrue

  if (!defaultFilled) {
    return { status: 'empty', countIsStarting: isStartingNum, countIsSelect: isSelectNum }
  }

  const hasAnyExtraFilled = rows.some((row) => {
    if (!row || typeof row !== 'object') return false
    return Object.keys(row).some((k) => {
      if (EXCLUDED.has(k) || defaultFields.has(k)) return false
      return isFilled(row[k])
    })
  })

  return {
    status: hasAnyExtraFilled ? 'full' : 'partial',
    countIsStarting: isStartingNum,
    countIsSelect: isSelectNum,
  }
}
