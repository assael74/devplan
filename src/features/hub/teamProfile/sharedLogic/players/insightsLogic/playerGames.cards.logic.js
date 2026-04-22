// teamProfile/sharedLogic/players/insightsLogic/playerGames.cards.logic.js

export const buildPlayerGamesCards = (summary) => {
  const participation = summary?.participation || {}
  const scoring = summary?.scoring || {}
  const splits = summary?.splits || {}
  const recent = summary?.recent || {}

  const grouped = summary?.grouped || {}
  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway) ? grouped.byHomeOrAway : []

  const home = byHomeOrAway.find((item) => item?.id === 'home') || null
  const away = byHomeOrAway.find((item) => item?.id === 'away') || null

  const start = splits?.start || {}
  const bench = splits?.bench || {}
  const comparison = splits?.comparison || {}

  return [
    {
      id: 'successPct',
      label: 'אחוז הצלחה',
      value: `${participation?.contributedPointsPct ?? 0}%`,
      subValue: `${participation?.contributedPoints ?? 0}/${participation?.contributedPointsPossible ?? 0} נק׳`,
      color:
        (participation?.contributedPointsPct ?? 0) >= 60
          ? 'success'
          : (participation?.contributedPointsPct ?? 0) >= 40
            ? 'warning'
            : 'danger',
    },

    {
      id: 'gamesInvolved',
      label: 'מעורבות משחקים',
      value: `${participation?.gamesIncluded ?? 0}/${participation?.teamGamesTotal ?? 0}`,
      subValue: `${participation?.gamesPct ?? 0}%`,
      color:
        (participation?.gamesPct ?? 0) >= 70
          ? 'success'
          : (participation?.gamesPct ?? 0) >= 40
            ? 'warning'
            : 'danger',
    },

    {
      id: 'minutesPct',
      label: 'אחוז דקות',
      value: `${participation?.minutesPct ?? 0}%`,
      subValue: `${participation?.minutesPlayed ?? 0}/${participation?.minutesPossible ?? 0} דק׳`,
      color:
        (participation?.minutesPct ?? 0) >= 70
          ? 'success'
          : (participation?.minutesPct ?? 0) >= 40
            ? 'warning'
            : 'danger',
    },

    {
      id: 'goalContrib',
      label: 'תרומה ישירה',
      value: scoring?.goalContributions ?? 0,
      subValue: `${scoring?.goals ?? 0} שערים · ${scoring?.assists ?? 0} בישולים`,
      color: 'neutral',
    },

    {
      id: 'contributionsPerGame',
      label: 'תרומה מנורמלת',
      value: scoring?.contributionsPerGame ?? 0,
      subValue: `${scoring?.goalsPerGame ?? 0} שערים · ${scoring?.assistsPerGame ?? 0} בישולים`,
      color: 'primary',
    },

    {
      id: 'recent',
      label: 'תרומה אחרונה',
      value: recent?.goalContributions ?? 0,
      subValue: `${recent?.sampleSize ?? 0} משחקים · ${recent?.contributionsPerGame ?? 0} מנורמל`,
      color: (recent?.goalContributions ?? 0) > 0 ? 'success' : 'neutral',
    },

    {
      id: 'startsVsBench',
      label: 'פותח / מחליף',
      value: `${start?.contributionsPerGame ?? 0} / ${bench?.contributionsPerGame ?? 0}`,
      subValue:
        comparison?.preferredRole === 'start'
          ? 'עדיף כפותח'
          : comparison?.preferredRole === 'bench'
            ? 'עדיף כמחליף'
            : 'תפוקה דומה',
      color:
        comparison?.preferredRole === 'start'
          ? 'success'
          : comparison?.preferredRole === 'bench'
            ? 'warning'
            : 'neutral',
    },

    {
      id: 'homeAway',
      label: 'בית / חוץ',
      value: `${home?.ppg ?? 0} / ${away?.ppg ?? 0}`,
      subValue: 'נק׳ למשחק עם השחקן',
      color: 'neutral',
    },
  ]
}
