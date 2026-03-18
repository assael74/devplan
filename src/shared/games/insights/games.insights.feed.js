// shared/games/insights/games.insights.feed.js

export const buildTeamFeedItems = ({ recent, streaks, byVenue = [] }) => {
  const items = []

  const home = byVenue.find((x) => x.id === 'home') || null
  const away = byVenue.find((x) => x.id === 'away') || null

  if (recent?.sampleSize >= 3) {
    items.push({
      id: 'recent-form',
      kind: 'form',
      label: 'מומנטום אחרון',
      text: `הקבוצה צברה ${recent.points} נק׳ מתוך ${recent.maxPoints} ב-${recent.sampleSize} המשחקים האחרונים.`,
      color: recent.ppg >= 2 ? 'success' : recent.ppg >= 1 ? 'warning' : 'danger',
    })
  }

  if (home && away && Math.abs((home.ppg || 0) - (away.ppg || 0)) >= 0.75) {
    items.push({
      id: 'venue-gap',
      kind: 'venue',
      label: 'פער בית/חוץ',
      text:
        home.ppg > away.ppg
          ? `הקבוצה חזקה יותר בבית עם ${home.ppg} נק׳ למשחק לעומת ${away.ppg} בחוץ.`
          : `הקבוצה חזקה יותר בחוץ עם ${away.ppg} נק׳ למשחק לעומת ${home.ppg} בבית.`,
      color: 'primary',
    })
  }

  if ((streaks?.currentStreakCount || 0) >= 2) {
    items.push({
      id: 'streak',
      kind: 'streak',
      label: 'רצף פעיל',
      text: `הקבוצה נמצאת ברצף של ${streaks.currentStreakCount} משחקי ${streaks.currentStreakTypeH}.`,
      color: streaks.currentStreakColor,
    })
  }

  return items
}

export const buildPlayerFeedItems = ({ participation, scoring }) => {
  const items = []

  if ((participation?.gamesPct || 0) >= 70) {
    items.push({
      id: 'high-usage',
      kind: 'usage',
      label: 'שחקן רוטציה מרכזי',
      text: `השחקן היה מעורב ב-${participation.gamesPct}% מהמשחקים ששוחקו.`,
      color: 'success',
    })
  }

  if ((participation?.minutesPct || 0) >= 65) {
    items.push({
      id: 'high-minutes',
      kind: 'minutes',
      label: 'נפח דקות גבוה',
      text: `השחקן צבר ${participation.minutesPlayed} דקות שהן ${participation.minutesPct}% מסך דקות הקבוצה האפשריות.`,
      color: 'primary',
    })
  }

  if ((scoring?.contributionsPer90 || 0) >= 0.7) {
    items.push({
      id: 'high-output',
      kind: 'output',
      label: 'קצב תרומה גבוה',
      text: `השחקן מייצר ${scoring.contributionsPer90} תרומות ישירות ל-90 דקות.`,
      color: 'success',
    })
  }

  return items
}
