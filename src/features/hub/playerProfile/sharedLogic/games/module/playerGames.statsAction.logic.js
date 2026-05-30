// playerProfile/sharedLogic/games/module/playerGames.statsAction.logic.js

const safe = value => {
  return value == null ? '' : String(value)
}

export const getPlayerGameStatsMeta = game => {
  const source = game?.game || game || {}

  return {
    hasStats: source?.hasStats === true,
    statsStatus: safe(source?.statsStatus || source?.advancedStatsStatus),
    statsDocId: safe(source?.statsDocId || source?.gameStatsDocId),
  }
}

export const isPlayerGameStatsPartialState = status => {
  return status === 'partial'
}

export const isPlayerGameStatsDraftState = status => {
  return status === 'draft'
}

export const isPlayerGameStatsCommittedState = status => {
  return status === 'committed'
}

const isLocalStatsDraft = statsDraft => {
  return statsDraft?.status === 'draft'
}

export const resolveGameStatsActionModel = ({
  game,
  statsDraft,
} = {}) => {
  const meta = getPlayerGameStatsMeta(game)

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

  if (meta.hasStats && isPlayerGameStatsCommittedState(meta.statsStatus)) {
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

  if (meta.hasStats && isPlayerGameStatsPartialState(meta.statsStatus)) {
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

  if (meta.hasStats && isPlayerGameStatsDraftState(meta.statsStatus)) {
    return {
      ...meta,
      hasLocalDraft: false,
      iconId: 'statsDraft',
      iconSx: { color: 'warning.500' },
      color: 'warning',
      variant: 'soft',
      status: 'draft',
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
