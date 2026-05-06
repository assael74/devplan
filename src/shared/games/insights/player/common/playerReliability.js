// shared/games/insights/player/common/playerReliability.js

import { toNumber } from '../../team/common/index.js'

export function getPlayerMinutesReliability(minutesPlayed) {
  const minutes = toNumber(minutesPlayed, 0)

  if (minutes <= 0) {
    return {
      id: 'none',
      label: 'אין נתונים',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (minutes < 450) {
    return {
      id: 'veryLow',
      label: 'מדגם נמוך מאוד',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (minutes < 900) {
    return {
      id: 'low',
      label: 'מדגם נמוך',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (minutes < 1500) {
    return {
      id: 'medium',
      label: 'מדגם בינוני',
      tone: 'primary',
      canUseStrongFlag: true,
      caution: false,
    }
  }

  return {
    id: 'high',
    label: 'מדגם גבוה',
    tone: 'success',
    canUseStrongFlag: true,
    caution: false,
  }
}

export function getPlayerWithWithoutReliability({
  withGames,
  withoutGames,
}) {
  const withCount = toNumber(withGames, 0)
  const withoutCount = toNumber(withoutGames, 0)

  const isReady = withCount >= 7 && withoutCount >= 5

  return {
    id: isReady ? 'ready' : 'low',
    label: isReady ? 'מדגם תקין' : 'מדגם נמוך',
    tone: isReady ? 'success' : 'neutral',
    canUseStrongFlag: isReady,
    caution: !isReady,
    withGames: withCount,
    withoutGames: withoutCount,
  }
}
