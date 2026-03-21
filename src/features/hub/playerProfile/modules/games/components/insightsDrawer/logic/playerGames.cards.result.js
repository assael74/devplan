import {
  toNum,
  toInt,
  toFixed1Num,
  pctColor,
  pointsColor,
  diffColor,
} from './playerGames.cards.shared.js'

const resolvePreferredRoleLabel = (id) => {
  if (id === 'start') return 'הרכב'
  if (id === 'bench') return 'ספסל'
  return 'ללא פער'
}

const buildImpactModel = (participation) => {
  const gamesIncluded = toNum(participation?.gamesIncluded)
  const teamGamesTotal = toNum(participation?.teamGamesTotal)

  const contributedPoints = toNum(participation?.contributedPoints)
  const teamPoints = toNum(participation?.teamPoints)

  const ppgWithPlayer =
    gamesIncluded > 0 ? Number((contributedPoints / gamesIncluded).toFixed(2)) : 0

  const gamesWithoutPlayer = Math.max(0, teamGamesTotal - gamesIncluded)
  const pointsWithoutPlayer = Math.max(0, teamPoints - contributedPoints)

  const ppgWithoutPlayer =
    gamesWithoutPlayer > 0 ? Number((pointsWithoutPlayer / gamesWithoutPlayer).toFixed(2)) : 0

  const impactDiff = Number((ppgWithPlayer - ppgWithoutPlayer).toFixed(2))

  return {
    ppgWithPlayer,
    gamesWithoutPlayer,
    pointsWithoutPlayer,
    ppgWithoutPlayer,
    impactDiff,
  }
}

export const buildParticipationChips = (participation) => {
  const gamesPct = toNum(participation?.gamesPct)
  const minutesPct = toNum(participation?.minutesPct)
  const startsPct = toNum(participation?.startsPctFromPlayed)
  const contributedPointsPct = toNum(participation?.contributedPointsPct)
  const pointsShareOfTeam = toNum(participation?.pointsShareOfTeam)

  return [
    {
      id: 'gamesPct',
      label: `${gamesPct}% משחקים`,
      icon: 'game',
      color: pctColor(gamesPct),
      pct: gamesPct,
      fullLabel: `השתתף ב-${gamesPct}% ממשחקי הליגה`,
    },
    {
      id: 'minutesPct',
      label: `${minutesPct}% דקות`,
      icon: 'time',
      color: pctColor(minutesPct),
      pct: minutesPct,
      fullLabel: `שיחק ${minutesPct}% מסך דקות הליגה האפשריות`,
    },
    {
      id: 'pointsPct',
      label: `${contributedPointsPct}% נק׳`,
      icon: 'points',
      color: pointsColor(contributedPointsPct),
      pct: contributedPointsPct,
      fullLabel: `צבר ${contributedPointsPct}% מהנקודות האפשריות במשחקי הליגה בהם שותף`,
    },
    {
      id: 'shareOfTeam',
      label: `${pointsShareOfTeam}% מהקבוצה`,
      icon: 'compare',
      color: pointsColor(pointsShareOfTeam),
      pct: pointsShareOfTeam,
      fullLabel: `היה על המגרש ב-${pointsShareOfTeam}% מנקודות הליגה של הקבוצה`,
    },
    {
      id: 'startsPct',
      label: `${startsPct}% הרכב`,
      icon: 'entry',
      color: pctColor(startsPct),
      pct: startsPct,
      fullLabel: `פתח ב-${startsPct}% מהמשחקים בהם שותף`,
    },
  ]
}

export const buildPlayerGamesTopStats = (summary) => {
  const participation = summary?.participation || {}
  const recent = summary?.recent || {}
  const impact = buildImpactModel(participation)

  const recentPoints = toNum(recent?.points)
  const recentTotal = toNum(recent?.sampleSize)
  const recentPointsPct =
    recentTotal > 0 ? Math.round((recentPoints / (recentTotal * 3)) * 100) : 0

  return [
    {
      id: 'games-usage',
      title: 'מעורבות משחקים',
      value: `${toNum(participation?.gamesPct)}%`,
      sub: `${toNum(participation?.gamesIncluded)} מתוך ${toNum(participation?.teamGamesTotal)} משחקי ליגה`,
      icon: 'game',
      color: pctColor(participation?.gamesPct),
    },
    {
      id: 'minutes-usage',
      title: 'נפח דקות',
      value: `${toNum(participation?.minutesPct)}%`,
      sub: `${toNum(participation?.minutesPlayed)} / ${toNum(participation?.minutesPossible)} דק׳`,
      icon: 'time',
      color: pctColor(participation?.minutesPct),
    },
    {
      id: 'points-impact',
      title: 'נק׳ למשחק',
      value: toFixed1Num(impact.ppgWithPlayer),
      sub: `ללא שחקן ${toFixed1Num(impact.ppgWithoutPlayer)} · פער ${toFixed1Num(impact.impactDiff)}`,
      icon: 'points',
      color: diffColor(impact.impactDiff),
    },
    {
      id: 'recent-points',
      title: 'כושר נקודות',
      value: `${recentPointsPct}%`,
      sub: `${toNum(recent?.sampleSize)} משחקים אחרונים · ${recentPoints} נק׳`,
      icon: 'trend',
      color: pointsColor(recentPointsPct),
    },
  ]
}

export const buildPlayerGamesCards = (summary) => {
  const participation = summary?.participation || {}
  const splits = summary?.splits || {}
  const recent = summary?.recent || {}
  const impact = buildImpactModel(participation)

  const preferredRole = resolvePreferredRoleLabel(splits?.comparison?.preferredRole)

  const recentPoints = toNum(recent?.points)
  const recentTotal = toNum(recent?.sampleSize)
  const recentPointsPct =
    recentTotal > 0 ? Math.round((recentPoints / (recentTotal * 3)) * 100) : 0
  const recentPpg =
    recentTotal > 0 ? Number((recentPoints / recentTotal).toFixed(2)) : 0

  return [
    {
      id: 'points-production',
      title: 'נקודות עם השחקן',
      value: `${toNum(participation?.contributedPoints)} / ${toNum(participation?.contributedPointsPossible)}`,
      subValue: `${toNum(participation?.contributedPointsPct)}% הצלחה · ${toNum(participation?.pointsShareOfTeam)}% מנקודות הליגה של הקבוצה`,
      icon: 'result',
      color: pointsColor(participation?.contributedPointsPct),
    },
    {
      id: 'role-split',
      title: 'הרכב מול ספסל',
      value: preferredRole,
      subValue: `פער תפוקה ${toFixed1Num(splits?.comparison?.contributionsPerGameGap)} · פער דקות ${toFixed1Num(splits?.comparison?.avgMinutesGap)}`,
      icon: 'entry',
      color:
        splits?.comparison?.preferredRole === 'start'
          ? 'success'
          : splits?.comparison?.preferredRole === 'bench'
            ? 'warning'
            : 'neutral',
    },
    {
      id: 'recent',
      title: '5 משחקים אחרונים',
      value: `${recentPointsPct}%`,
      subValue: `${recentPoints} נק׳ · ${toFixed1Num(recentPpg)} נק׳ למשחק · ${toNum(recent?.minutes)} דק׳`,
      icon: 'trend',
      color: pointsColor(recentPointsPct),
    },
  ]
}
