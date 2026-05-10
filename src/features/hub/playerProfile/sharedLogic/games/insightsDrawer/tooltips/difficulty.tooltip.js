// playerProfile/sharedLogic/games/insightsDrawer/tooltips/difficulty.tooltip.js

import {
  getFullDateIl,
} from '../../../../../../../shared/format/dateUtiles.js'

import {
  numRow,
  pctRow,
  row,
  tooltip,
} from './tooltip.shared.js'

const safeArray = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

const getSource = (bucket = {}) => {
  if (Array.isArray(bucket.source) && bucket.source.length) {
    return bucket.source[0] || {}
  }

  return {}
}

const getWith = (bucket = {}) => {
  const source = getSource(bucket)
  //console.log(source)

  return (
    bucket.withPlayer ||
    bucket.player ||
    source.withPlayer ||
    source.player ||
    {}
  )
}

const getWithout = (bucket = {}) => {
  const source = getSource(bucket)

  return (
    bucket.withoutPlayer ||
    source.withoutPlayer ||
    {}
  )
}

const getTeam = (bucket = {}) => {
  const source = getSource(bucket)

  return (
    bucket.team ||
    source.team ||
    {}
  )
}

const getBucketGames = (bucket = {}) => {
  const source = getSource(bucket)

  return (
    bucket.games ||
    source.games ||
    {}
  )
}

const getBucket = ({ brief, id }) => {
  const buckets = Array.isArray(brief?.metrics?.buckets) ? brief.metrics.buckets : []

  return buckets.find((bucket) => bucket?.id === id) || {}
}

const getCompareText = (bucket = {}) => {
  const withPlayer = getWith(bucket)
  const withoutPlayer = getWithout(bucket)

  const withGames = Number(withPlayer.games || 0)
  const withoutGames = Number(withoutPlayer.games || 0)

  if (!withGames) {
    return 'אין משחקים עם השחקן ברמת יריבה זו.'
  }

  if (!withoutGames) {
    return 'אין משחקים בלעדיו באותה רמת יריבה, לכן אין השוואה נקייה.'
  }

  return 'השוואה בין משחקים באותה רמת יריבה: איתו מול בלעדיו.'
}

const getGameObject = (gameRow = {}) => {
  return gameRow?.game || gameRow
}

const getGameName = (gameRow = {}) => {
  const game = getGameObject(gameRow)

  return (
    gameRow.rivel ||
    game.rivel ||
    gameRow.rival ||
    game.rival ||
    'יריבה'
  )
}

const getGameDateValue = (gameRow = {}) => {
  return gameRow?.game?.gameDate || gameRow?.gameDate || ''
}

const getGameDateTime = (gameRow = {}) => {
  const date = new Date(getGameDateValue(gameRow))

  if (Number.isNaN(date.getTime())) return 0

  return date.getTime()
}

const sortByDateAsc = (rows = []) => {
  return safeArray(rows).slice().sort((a, b) => {
    return getGameDateTime(a) - getGameDateTime(b)
  })
}

const getGameDate = (gameRow = {}) => {
  return getFullDateIl(getGameDateValue(gameRow))
}

const getScoreText = (gameRow = {}) => {
  const game = getGameObject(gameRow)

  const goalsFor = Number(
    gameRow.goalsFor ??
      game.goalsFor ??
      0
  )

  const goalsAgainst = Number(
    gameRow.goalsAgainst ??
      game.goalsAgainst ??
      0
  )

  return `${goalsFor}-${goalsAgainst}`
}

const getPointsText = (gameRow = {}) => {
  const game = getGameObject(gameRow)

  const points = Number(
    gameRow.points ??
      game.points ??
      0
  )

  return `${points} נק׳`
}

const buildGameItemText = (gameRow = {}) => {
  const opponent = getGameName(gameRow)
  const date = getGameDate(gameRow)
  const dateText = date && date !== '—' ? ` · ${date}` : ''
  const score = getScoreText(gameRow)
  const points = getPointsText(gameRow)

  return `${opponent}${dateText} · ${score} · ${points}`
}

const buildGameItems = (rows = []) => {
  return sortByDateAsc(rows).map((gameRow) => {
    return {
      id: gameRow.id || gameRow.gameId || `${getGameName(gameRow)}_${getGameDateValue(gameRow)}`,
      text: buildGameItemText(gameRow),
    }
  })
}

const addItemsRow = ({ rows, id, label, items }) => {
  if (!Array.isArray(items) || !items.length) return

  rows.push({
    id,
    label,
    items,
  })
}

const buildBucketTooltip = ({ brief, id }) => {
  const bucket = getBucket({
    brief,
    id,
  })

  const withPlayer = getWith(bucket)
  const withoutPlayer = getWithout(bucket)
  const team = getTeam(bucket)
  const games = getBucketGames(bucket)

  const rows = [
    row({
      id: 'compareTo',
      label: 'למה משווים',
      value: getCompareText(bucket),
    }),
    pctRow({
      id: 'withRate',
      label: 'אחוז הצלחה איתו',
      value: withPlayer.pointsRate,
    }),
    numRow({
      id: 'withGames',
      label: 'משחקים איתו',
      value: withPlayer.games,
    }),
    numRow({
      id: 'withPoints',
      label: 'נקודות איתו',
      value: withPlayer.points,
    }),
    pctRow({
      id: 'withoutRate',
      label: 'אחוז הצלחה בלעדיו',
      value: withoutPlayer.pointsRate,
    }),
    numRow({
      id: 'withoutGames',
      label: 'משחקים בלעדיו',
      value: withoutPlayer.games,
    }),
    numRow({
      id: 'withoutPoints',
      label: 'נקודות בלעדיו',
      value: withoutPlayer.points,
    }),
    pctRow({
      id: 'teamRate',
      label: 'אחוז הצלחה קבוצתי',
      value: team.pointsRate,
    }),
    pctRow({
      id: 'gap',
      label: 'פער אחוז הצלחה',
      value: bucket.pointsRateGap,
    }),
    numRow({
      id: 'ppgGap',
      label: 'פער נק׳ למשחק',
      value: bucket.pointsPerGameGap,
      digits: 2,
    }),
    numRow({
      id: 'minutes',
      label: 'דקות',
      value: bucket.minutes,
      suffix: 'דקות',
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'רק משחקי ליגה באותה רמת יריבה. המדד בודק האם הקבוצה השיגה יותר או פחות כשהשחקן שותף.',
    }),
  ]

  addItemsRow({
    rows,
    id: 'withPlayerGames',
    label: 'רשימת משחקים איתו',
    items: buildGameItems(games.withPlayer),
  })

  addItemsRow({
    rows,
    id: 'withoutPlayerGames',
    label: 'רשימת משחקים בלעדיו',
    items: buildGameItems(games.withoutPlayer),
  })

  return tooltip({
    title: `פירוט ${bucket.label || 'רמת יריבה'}`,
    rows,
  })
}

export const buildDifficultyTooltip = ({ id, brief }) => {
  if (id === 'easy' || id === 'equal' || id === 'hard') {
    return buildBucketTooltip({
      brief,
      id,
    })
  }

  return null
}
