// teamProfile/sharedLogic/games/moduleLogic/teamGames.section.utils.js

import { isGamePlayed } from '../../../../../../shared/games/games.constants.js'

const safe = v => {
  return v == null ? '' : String(v)
}

const resultColorMap = {
  win: 'success',
  draw: 'warning',
  loss: 'danger',
}

const resultLabelMap = {
  win: 'ניצחון',
  draw: 'תיקו',
  loss: 'הפסד',
}

export const getResultKey = game => {
  if (!isGamePlayed(game)) return ''

  return safe(game?.result).trim().toLowerCase()
}

export const getResultLabel = game => {
  if (!isGamePlayed(game)) return 'לא שוחק'

  return game?.resultH || resultLabelMap[getResultKey(game)] || 'לא שוחק'
}

export const getResultColor = game => {
  if (!isGamePlayed(game)) return 'neutral'

  return resultColorMap[getResultKey(game)] || 'neutral'
}

export const getHomeAwayLabel = game => {
  if (game?.homeH) return game.homeH
  if (game?.homeKey === 'home') return 'בית'
  if (game?.homeKey === 'away') return 'חוץ'

  return 'לא הוגדר'
}

export const getHomeAwayIcon = game => {
  if (game?.homeIcon) return game.homeIcon
  if (game?.homeKey === 'away') return 'away'

  return 'home'
}

export const getHomeAwayColor = game => {
  if (game?.homeKey === 'home') return 'success'
  if (game?.homeKey === 'away') return 'danger'

  return 'neutral'
}

export const getGamePlayers = game => {
  return Array.isArray(game?.gamePlayers) ? game.gamePlayers : []
}

export const getSquadPlayers = players => {
  const base = Array.isArray(players) ? players : []

  return base.filter(player => player?.onSquad === true)
}

export const getPlayedPlayers = players => {
  const base = Array.isArray(players) ? players : []

  return base.filter(player => {
    const timePlayed = Number(player?.timePlayed)

    return Number.isFinite(timePlayed) && timePlayed > 0
  })
}

export const getScorers = players => {
  const base = Array.isArray(players) ? players : []

  return base.filter(player => Number(player?.goals) > 0)
}

export const getAssisters = players => {
  const base = Array.isArray(players) ? players : []

  return base.filter(player => Number(player?.assists) > 0)
}

export const getGameStatsMeta = game => {
  const source = game?.game || game || {}

  return {
    hasStats: source?.hasStats === true,
    statsStatus: safe(source?.statsStatus || source?.advancedStatsStatus),
    statsDocId: safe(source?.statsDocId || source?.gameStatsDocId),
  }
}

export const isGameStatsPartialState = status => {
  return status === 'partial'
}

export const isGameStatsDraftState = status => {
  return status === 'draft'
}

export const isGameStatsCommittedState = status => {
  return status === 'committed'
}

const isLocalStatsDraft = statsDraft => {
  return statsDraft?.status === 'draft'
}

export const resolveGameStatsActionModel = ({ game, statsDraft } = {}) => {
  const meta = getGameStatsMeta(game)

  if (isLocalStatsDraft(statsDraft)) {
    return {
      ...meta,
      hasLocalDraft: true,
      iconId: 'statsDraft',
      iconSx: { color: 'danger.500' },
      color: 'danger',
      variant: 'soft',
      status: 'draft',
      tooltip: 'קיימת טיוטת סטטיסטיקה מקומית — לחץ להמשך עריכה',
    }
  }

  if (meta.hasStats && isGameStatsCommittedState(meta.statsStatus)) {
    return {
      ...meta,
      hasLocalDraft: false,
      iconId: 'statsFull',
      iconSx: { color: 'success.500' },
      color: 'success',
      variant: 'soft',
      status: 'committed',
      tooltip: 'קיימת סטטיסטיקה מלאה למשחק — לחץ לצפייה או עריכה',
    }
  }

  if (meta.hasStats && isGameStatsPartialState(meta.statsStatus)) {
    return {
      ...meta,
      hasLocalDraft: false,
      iconId: 'statsPartial',
      iconSx: { color: 'warning.500' },
      color: 'warning',
      variant: 'soft',
      status: 'partial',
      tooltip: 'קיימת סטטיסטיקה חלקית — לחץ להשלמה',
    }
  }

  if (meta.hasStats && isGameStatsDraftState(meta.statsStatus)) {
    return {
      ...meta,
      hasLocalDraft: false,
      iconId: 'statsDraft',
      iconSx: { color: 'warning.500' },
      color: 'warning',
      status: 'draft',
      variant: 'soft',
      tooltip: 'קיימת טיוטת סטטיסטיקה שמורה — לחץ להמשך עריכה',
    }
  }

  if (meta.hasStats) {
    return {
      ...meta,
      hasLocalDraft: false,
      iconId: 'statsSaved',
      iconSx: { color: 'primary.500' },
      color: 'primary',
      variant: 'soft',
      status: 'saved',
      tooltip: 'קיימת סטטיסטיקה שמורה למשחק — לחץ לצפייה או עריכה',
    }
  }

  return {
    ...meta,
    hasLocalDraft: false,
    iconId: 'addStats',
    iconSx: { color: 'neutral.500' },
    color: 'neutral',
    variant: 'plain',
    status: 'empty',
    tooltip: 'הוספת סטטיסטיקה למשחק',
  }
}
