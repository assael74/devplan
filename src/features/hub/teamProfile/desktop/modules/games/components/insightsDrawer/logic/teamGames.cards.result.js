import {
  toNum,
  toText,
  pointsColor,
  getResultMeta,
  calcPctFromTotal,
} from './teamGames.cards.shared.js'

export const buildRecordText = (result) => {
  const wins = toNum(result?.wins)
  const draws = toNum(result?.draws)
  const losses = toNum(result?.losses)

  return `ניצחון ${wins} · תיקו ${draws} · הפסד ${losses}`
}

export const buildRecordPctChips = (result) => {
  const wins = toNum(result?.wins)
  const draws = toNum(result?.draws)
  const losses = toNum(result?.losses)

  const total = toNum(result?.totalPlayed || wins + draws + losses)

  const winMeta = getResultMeta('win')
  const drawMeta = getResultMeta('draw')
  const lossMeta = getResultMeta('loss')

  const winPct = calcPctFromTotal(wins, total)
  const drawPct = calcPctFromTotal(draws, total)
  const lossPct = calcPctFromTotal(losses, total)

  return [
    {
      id: 'win',
      label: `${winPct}%`,
      icon: winMeta.idIcon,
      color: winMeta.color,
      pct: winPct,
      fullLabel: `${winMeta.labelH} ${wins} (${winPct}%)`,
    },
    {
      id: 'draw',
      label: `${drawPct}%`,
      icon: drawMeta.idIcon,
      color: drawMeta.color,
      pct: drawPct,
      fullLabel: `${drawMeta.labelH} ${draws} (${drawPct}%)`,
    },
    {
      id: 'loss',
      label: `${lossPct}%`,
      icon: lossMeta.idIcon,
      color: lossMeta.color,
      pct: lossPct,
      fullLabel: `${lossMeta.labelH} ${losses} (${lossPct}%)`,
    },
  ]
}

export const resolveSuccessPct = (result) => {
  return toNum(result?.pointsPct)
}

export const resolveStreakValue = (streaks) => {
  const count = toNum(streaks?.currentStreakCount)
  const typeH = streaks?.currentStreakTypeH || 'ללא רצף'
  if (!count) return 'ללא'
  return `${count} ${typeH}`
}

export const buildTeamGamesTopStats = (summary) => {
  const result = summary?.core?.result || {}
  const goals = summary?.core?.goals || {}
  const streaks = summary?.trends?.streaks || {}

  return [
    {
      id: 'success',
      title: 'אחוז הצלחה',
      value: `${resolveSuccessPct(result)}%`,
      sub: `${toText(result?.points, '0')}/${toText(result?.maxPoints, '0')} נק׳`,
      icon: 'rate',
    },
    {
      id: 'ppg',
      title: 'נקודות למשחק',
      value: toText(result?.ppg),
      sub: `${toText(result?.totalPlayed, '0')} משחקים`,
      icon: 'points',
    },
    {
      id: 'goals',
      title: 'שערים',
      value: `${toText(goals?.gf, '0')} - ${toText(goals?.ga, '0')}`,
      sub: `הפרש ${toText(goals?.gd, '0')}`,
      icon: 'result',
    },
    {
      id: 'streak',
      title: 'רצף נוכחי',
      value: resolveStreakValue(streaks),
      sub: 'מגמה פעילה',
      icon: 'trend',
    },
  ]
}

export const buildTeamGamesCards = (summary) => {
  const result = summary?.core?.result || {}
  const recent = summary?.trends?.recent || {}

  const recentPointsPct = toNum(recent?.pointsPct)

  return [
    {
      id: 'record',
      title: 'מאזן',
      value: '',
      subValue: buildRecordText(result),
      icon: 'game',
      color: 'neutral',
      chips: buildRecordPctChips(result),
      valueMode: 'chips',
    },
    {
      id: 'recent',
      title: '5 משחקים אחרונים',
      value: `${recentPointsPct}%`,
      subValue: recent?.formText || `${toNum(recent?.sampleSize)} אחרונים`,
      icon: 'trend',
      color: pointsColor(recentPointsPct),
    },
  ]
}
