// playerProfile/sharedLogic/games/insightsDrawer/cards/playerSummary.cards.js

import {
  formatNumber,
  formatPercent,
  resolvePctColor,
  toNum,
} from './playerCards.shared.js'

export const buildPlayerGamesTopStats = ({ games = {}, targets = {} } = {}) => {
  const usage = games?.usage || {}
  const scoring = games?.scoring || {}
  const defense = games?.defense || {}
  const reliability = games?.reliability || {}

  const role = targets?.role || {}
  const position = targets?.position || {}

  return [
    {
      id: 'minutesPct',
      title: 'אחוז דקות',
      value: formatPercent(usage?.minutesPct),
      sub: `${formatNumber(usage?.minutesPlayed)} דקות מתוך ${formatNumber(
        usage?.minutesPossible
      )}`,
      icon: 'time',
      color: resolvePctColor(usage?.minutesPct),
      level: 'medium',
    },
    {
      id: 'starts',
      title: 'פתיחות',
      value: formatPercent(usage?.startsPctFromTeamGames),
      sub: `${formatNumber(usage?.starts)} פתיחות מתוך ${formatNumber(
        usage?.teamGamesTotal
      )} משחקים`,
      icon: 'isStart',
      color: resolvePctColor(usage?.startsPctFromTeamGames),
      level: 'medium',
    },
    {
      id: 'goalContributions',
      title: 'מעורבות שערים',
      value: formatNumber(scoring?.goalContributions),
      sub: `${formatNumber(scoring?.goals)} שערים · ${formatNumber(
        scoring?.assists
      )} בישולים`,
      icon: 'goals',
      color: toNum(scoring?.goalContributions) > 0 ? 'success' : 'neutral',
      level: 'medium',
    },
    {
      id: 'contributionsPerGame',
      title: 'מעורבות למשחק',
      value: formatNumber(scoring?.contributionsPerGame, 2),
      sub: `לפי ${formatNumber(games?.leagueGameTime || 90)} דקות משחק`,
      icon: 'gameStats',
      color: toNum(scoring?.contributionsPerGame) >= 0.45
        ? 'success'
        : toNum(scoring?.contributionsPerGame) > 0
          ? 'warning'
          : 'neutral',
      level: 'medium',
    },
    {
      id: 'role',
      title: 'מעמד בסגל',
      value: role?.label || 'לא הוגדר',
      sub: position?.layerLabel || 'עמדה לא הוגדרה',
      icon: role?.idIcon || 'teams',
      color: role?.id ? 'primary' : 'neutral',
      level: 'light',
    },
    {
      id: 'reliability',
      title: 'אמינות',
      value: reliability?.label || 'לא ידוע',
      sub: reliability?.caution ? 'יש לפרש בזהירות' : 'מדגם תקין',
      icon: reliability?.caution ? 'info' : 'verified',
      color: reliability?.tone || 'neutral',
      level: 'medium',
    },
    {
      id: 'goalsAgainst',
      title: 'ספיגה איתו',
      value: formatNumber(defense?.goalsAgainstPerGame, 2),
      sub: `${formatNumber(defense?.goalsAgainst)} שערי חובה בזמן ששיחק`,
      icon: 'defense',
      color: 'neutral',
      level: 'medium',
    },
  ]
}
