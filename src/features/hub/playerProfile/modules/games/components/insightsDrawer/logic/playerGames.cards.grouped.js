import {
  toNum,
  toInt,
  calcPointsPct,
  getDifficultyColor,
  resolveVenueIcon,
  resolveDifficultyBuckets,
  pointsColor,
  diffColor,
} from './playerGames.cards.shared.js'

const buildFeedItemsFromPoints = (insights) => {
  const participation = insights?.summary?.participation || {}
  const grouped = insights?.summary?.grouped || {}
  const recent = insights?.summary?.recent || {}

  const teamGamesTotal = toNum(participation?.teamGamesTotal)
  const gamesIncluded = toNum(participation?.gamesIncluded)
  const contributedPoints = toNum(participation?.contributedPoints)
  const teamPoints = toNum(participation?.teamPoints)
  const pointsShareOfTeam = toNum(participation?.pointsShareOfTeam)

  const ppgWithPlayer =
    gamesIncluded > 0 ? Number((contributedPoints / gamesIncluded).toFixed(2)) : 0

  const gamesWithoutPlayer = Math.max(0, teamGamesTotal - gamesIncluded)
  const pointsWithoutPlayer = Math.max(0, teamPoints - contributedPoints)

  const ppgWithoutPlayer =
    gamesWithoutPlayer > 0 ? Number((pointsWithoutPlayer / gamesWithoutPlayer).toFixed(2)) : 0

  const impactDiff = Number((ppgWithPlayer - ppgWithoutPlayer).toFixed(2))

  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway) ? grouped.byHomeOrAway : []
  const home = byHomeOrAway.find((item) => item?.id === 'home')
  const away = byHomeOrAway.find((item) => item?.id === 'away')

  const homePpg = toNum(home?.ppg)
  const awayPpg = toNum(away?.ppg)

  const hard =
    Array.isArray(grouped?.byDifficulty)
      ? grouped.byDifficulty.find((item) => item?.id === 'hard')
      : null

  const recentPoints = toNum(recent?.points)
  const recentTotal = toNum(recent?.sampleSize)
  const recentPpg = recentTotal > 0 ? Number((recentPoints / recentTotal).toFixed(2)) : 0

  const items = []

  items.push({
    id: 'points-share',
    label: 'חלק מנקודות הקבוצה',
    text: `השחקן היה על המגרש ב-${pointsShareOfTeam}% מנקודות הליגה של הקבוצה.`,
    color: pointsColor(pointsShareOfTeam),
  })

  items.push({
    id: 'impact-diff',
    label: 'השפעה על קצב צבירת נקודות',
    text: `עם השחקן הקבוצה משיגה ${toInt(ppgWithPlayer)} נק׳ למשחק, לעומת ${toInt(ppgWithoutPlayer)} בלעדיו.`,
    color: diffColor(impactDiff),
  })

  if (home && away) {
    items.push({
      id: 'venue-split',
      label: 'בית מול חוץ',
      text:
        homePpg > awayPpg
          ? `במשחקי בית הקבוצה צוברת איתו ${toInt(homePpg)} נק׳ למשחק, יותר מאשר בחוץ ${toInt(awayPpg)}.`
          : awayPpg > homePpg
            ? `במשחקי חוץ הקבוצה צוברת איתו ${toInt(awayPpg)} נק׳ למשחק, יותר מאשר בבית ${toInt(homePpg)}.`
            : `בבית ובחוץ הקבוצה צוברת איתו קצב דומה של ${toInt(homePpg)} נק׳ למשחק.`,
      color:
        homePpg === awayPpg
          ? 'warning'
          : Math.abs(homePpg - awayPpg) >= 0.4
            ? 'success'
            : 'warning',
    })
  }

  if (hard) {
    const hardPpg = toNum(hard?.ppg)
    items.push({
      id: 'hard-games',
      label: 'משחקים קשים',
      text:
        toNum(hard?.total) > 0
          ? `מול יריבות קשות הקבוצה צוברת איתו ${toInt(hardPpg)} נק׳ למשחק ב-${toNum(hard?.total)} משחקים.`
          : 'אין עדיין מספיק משחקי ליגה מול יריבות קשות.',
      color: pointsColor(toNum(hard?.pointsPct)),
    })
  }

  if (recentTotal > 0) {
    items.push({
      id: 'recent-form',
      label: 'מומנטום אחרון',
      text: `בחמשת המשחקים האחרונים הקבוצה צברה איתו ${recentPoints} נק׳, כלומר ${toInt(recentPpg)} נק׳ למשחק.`,
      color: pointsColor(Math.round((recentPoints / (recentTotal * 3)) * 100)),
    })
  }

  return items
}

export const buildHomeAwayInsightItems = (summary) => {
  const grouped = summary?.grouped || {}
  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway) ? grouped.byHomeOrAway : []

  return byHomeOrAway.map((item) => {
    const pointsPct = toNum(item?.pointsPct || calcPointsPct(item?.points, item?.total))
    const ppg = toNum(item?.ppg)

    return {
      id: item?.id,
      title: item?.label,
      value: `${pointsPct}%`,
      subValue:
        toNum(item?.total) > 0
          ? `${toInt(ppg)} נק׳ למשחק · ${toNum(item?.points)} נק׳ · ${toNum(item?.total)} משחקים`
          : 'אין משחקים בקטגוריה זו',
      icon: resolveVenueIcon(item?.id),
      color: item?.id === 'home' ? 'success' : item?.id === 'away' ? 'danger' : 'neutral',
      chips: [
        {
          id: item?.id,
          label: item?.label || '',
          icon: resolveVenueIcon(item?.id),
          color: item?.id === 'home' ? 'success' : item?.id === 'away' ? 'danger' : 'neutral',
        },
      ],
    }
  })
}

export const buildDifficultyInsightItems = (summary) => {
  const grouped = summary?.grouped || {}
  const buckets = resolveDifficultyBuckets(grouped)

  return buckets.map((item) => ({
    id: item.id,
    title: item.label,
    value: `${item.pointsPct}%`,
    subValue:
      item.total > 0
        ? `${toInt(item.ppg)} נק׳ למשחק · ${item.points} נק׳ · ${item.total} משחקים`
        : 'אין משחקים בקטגוריה זו',
    icon: item.idIcon || 'difficulty',
    color: getDifficultyColor(item.id),
  }))
}

export const buildFeedInsightItems = (insights) => {
  const feed = buildFeedItemsFromPoints(insights)

  return feed.map((item) => ({
    id: item?.id,
    title: item?.label,
    value:
      item?.color === 'success'
        ? 'חזק'
        : item?.color === 'danger'
          ? 'חלש'
          : item?.color === 'primary'
            ? 'בולט'
            : 'מידע',
    subValue: item?.text || '',
    icon: 'insights',
    color: item?.color || 'neutral',
  }))
}

export const buildTypeInsightItems = (summary) => {
  const grouped = summary?.grouped || {}
  const byType = Array.isArray(grouped?.byType) ? grouped.byType : []

  return byType.map((item) => {
    const pointsPct = toNum(item?.pointsPct || calcPointsPct(item?.points, item?.total))
    const ppg = toNum(item?.ppg)

    return {
      id: item?.id,
      title: item?.label,
      value: `${pointsPct}%`,
      subValue:
        toNum(item?.total) > 0
          ? `${toInt(ppg)} נק׳ למשחק · ${toNum(item?.points)} נק׳ · ${toNum(item?.total)} משחקים`
          : 'אין משחקים בקטגוריה זו',
      icon: item?.idIcon || 'game',
      color: pointsColor(pointsPct),
    }
  })
}
