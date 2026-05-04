// teamProfile/sharedLogic/games/insightsLogic/teamGames.cards.result.js

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

export const resolveSuccessPct = (league) => {
  return toNum(league?.pointsRate)
}

export const resolveStreakValue = (streaks) => {
  const count = toNum(streaks?.currentStreakCount)
  const typeH = streaks?.currentStreakTypeH || 'ללא רצף'
  if (!count) return 'ללא'
  return `${count} ${typeH}`
}

export const buildTeamGamesTopStats = ({ league, games }) => {
  const streaks = games?.trends?.streaks || {}

  return [
    {
      id: 'success',
      title: 'אחוז הצלחה',
      value: `${resolveSuccessPct(league)}%`,
      sub: `${toText(league?.points, '0')}/${toText(league?.maxPoints, '0')} נק׳`,
      icon: 'rate',
      level: 'light',
      color: pointsColor(resolveSuccessPct(league)),
    },
    {
      id: 'ppg',
      title: 'נקודות למשחק',
      value: toText(league?.pointsPerGame),
      sub: `${toText(league?.playedGames, '0')} משחקים מתוך ${toText(league?.totalGames, '0')}`,
      icon: 'points',
      level: 'light',
      color: pointsColor(resolveSuccessPct(league)),
    },
    {
      id: 'goals',
      title: 'שערים',
      value: `${toText(league?.goalsFor, '0')} - ${toText(league?.goalsAgainst, '0')}`,
      sub: `הפרש ${toText(league?.goalDifference, '0')}`,
      icon: 'result',
      level: 'light',
      color: league?.goalDifference >= 0 ? 'success' : 'danger',
    },
    {
      id: 'projection',
      title: 'צפי נקודות',
      value: toText(league?.projectedTotalPoints),
      sub: `עד סוף ${toText(league?.totalGames, '0')} משחקים`,
      icon: 'projection',
      level: 'light',
      color: pointsColor(resolveSuccessPct(league)),
    },
    {
      id: 'streak',
      title: 'רצף נוכחי',
      value: resolveStreakValue(streaks),
      sub: games ? 'מגמה פעילה' : 'דורש סנכרון משחקים',
      icon: 'trend',
      level: 'medium',
      color: games ? 'primary' : 'neutral',
    },
  ]
}

export const buildTeamGamesCards = ({ league, games }) => {
  const result = games?.result || {}
  const recent = games?.trends?.recent || {}

  const recentPointsPct = toNum(recent?.pointsPct)

  const cards = [
    {
      id: 'leagueProjection',
      title: 'תחזית עונה',
      value: `${toText(league?.projectedTotalPoints, '0')} נק׳`,
      subValue: `שערים צפויים: ${toText(league?.projectedGoalsFor, '0')} - ${toText(league?.projectedGoalsAgainst, '0')}`,
      icon: 'projection',
      color: pointsColor(toNum(league?.pointsRate)),
      level: 'light',
    },
  ]

  if (!games) return cards

  cards.push(
    {
      id: 'record',
      title: 'מאזן משחקים',
      value: '',
      subValue: buildRecordText(result),
      icon: 'game',
      color: 'neutral',
      chips: buildRecordPctChips(result),
      valueMode: 'chips',
      level: 'medium',
    },
    {
      id: 'recent',
      title: '5 משחקים אחרונים',
      value: `${recentPointsPct}%`,
      subValue: recent?.formText || `${toNum(recent?.sampleSize)} אחרונים`,
      icon: 'trend',
      color: pointsColor(recentPointsPct),
      level: 'medium',
    }
  )

  return cards
}
