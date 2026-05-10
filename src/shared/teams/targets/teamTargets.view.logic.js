// shared/teams/targets/teamTargets.view.logic.js

export const TEAM_TARGET_DEFAULT_SQUAD_SIZE = 24

export const emptyTargetText = '—'

export const isTargetValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

export const formatTargetValue = (value, suffix = '') => {
  if (!isTargetValue(value)) return emptyTargetText
  return `${value}${suffix}`
}

export const formatChipValue = (value, suffix = '') => {
  if (!isTargetValue(value)) return ''
  return `${value}${suffix}`
}

export const pctToPlayers = (
  pct,
  squadSize = TEAM_TARGET_DEFAULT_SQUAD_SIZE
) => {
  const n = Number(pct)

  if (!Number.isFinite(n)) return ''

  return Math.round((n / 100) * squadSize)
}

export const formatPointsPct = (value) => {
  if (!isTargetValue(value)) return ''
  return `${value}% נקודות`
}

export const formatPlayersPct = (
  value,
  squadSize = TEAM_TARGET_DEFAULT_SQUAD_SIZE
) => {
  const players = pctToPlayers(value, squadSize)

  if (!isTargetValue(players)) return ''

  return `${players} שחקנים`
}

export const formatPlayersRange = (
  range = [],
  squadSize = TEAM_TARGET_DEFAULT_SQUAD_SIZE
) => {
  if (!Array.isArray(range)) return ''

  const min = pctToPlayers(range[0], squadSize)
  const max = pctToPlayers(range[1], squadSize)

  if (!isTargetValue(min) || !isTargetValue(max)) return ''

  return `${min}–${max} שחקנים`
}

export const buildPointsRuleChips = (rule = {}) => {
  if (!rule || typeof rule !== 'object') return []

  const chips = []

  if (isTargetValue(rule.targetRate)) {
    chips.push({
      id: 'targetRate',
      label: formatPointsPct(rule.targetRate),
      color: 'success',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.greenMin)) {
    chips.push({
      id: 'greenMin',
      label: `מ־${formatPointsPct(rule.greenMin)}`,
      color: 'success',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.greenMax)) {
    chips.push({
      id: 'greenMax',
      label: `עד ${formatPointsPct(rule.greenMax)}`,
      color: 'success',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.redBelow)) {
    chips.push({
      id: 'redBelow',
      label: `מתחת ${formatPointsPct(rule.redBelow)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.redAbove)) {
    chips.push({
      id: 'redAbove',
      label: `מעל ${formatPointsPct(rule.redAbove)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.redMin)) {
    chips.push({
      id: 'redMin',
      label: `מ־${formatPointsPct(rule.redMin)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  return chips
}

export const buildScorersRuleChips = (rule = {}, suffix = '') => {
  if (!rule || typeof rule !== 'object') return []

  const chips = []

  if (isTargetValue(rule.greenMin)) {
    chips.push({
      id: 'greenMin',
      label: `מ־${formatChipValue(rule.greenMin, suffix)}`,
      color: 'success',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.greenMax)) {
    chips.push({
      id: 'greenMax',
      label: `עד ${formatChipValue(rule.greenMax, suffix)}`,
      color: 'success',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.redBelow)) {
    chips.push({
      id: 'redBelow',
      label: `מתחת ${formatChipValue(rule.redBelow, suffix)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  if (isTargetValue(rule.redAbove)) {
    chips.push({
      id: 'redAbove',
      label: `מעל ${formatChipValue(rule.redAbove, suffix)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  return chips
}

export const buildSquadUsageChips = (
  rule = {},
  options = {}
) => {
  if (!rule || typeof rule !== 'object') return []

  const squadSize = Number(options.squadSize) || TEAM_TARGET_DEFAULT_SQUAD_SIZE
  const includeRiskChips = options.includeRiskChips === true

  const chips = []

  if (Array.isArray(rule.greenRange)) {
    const label = formatPlayersRange(rule.greenRange, squadSize)

    if (label) {
      chips.push({
        id: 'greenRange',
        label,
        color: 'success',
        variant: 'soft',
      })
    }
  }

  if (includeRiskChips && isTargetValue(rule.redBelow)) {
    chips.push({
      id: 'redBelow',
      label: `מתחת ${formatPlayersPct(rule.redBelow, squadSize)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  if (includeRiskChips && isTargetValue(rule.redAbove)) {
    chips.push({
      id: 'redAbove',
      label: `מעל ${formatPlayersPct(rule.redAbove, squadSize)}`,
      color: 'danger',
      variant: 'soft',
    })
  }

  return chips
}

export const buildHomeAwayRows = (homeAway = {}) => {
  return [
    {
      id: 'home',
      label: 'בית',
      chips: buildPointsRuleChips(homeAway.home),
    },
    {
      id: 'away',
      label: 'חוץ',
      chips: buildPointsRuleChips(homeAway.away),
    },
  ]
}

export const buildDifficultyRows = (difficulty = {}) => {
  return [
    {
      id: 'easy',
      label: 'יריבה נוחה',
      chips: buildPointsRuleChips(difficulty.easy),
    },
    {
      id: 'equal',
      label: 'יריבה שווה',
      chips: buildPointsRuleChips(difficulty.equal),
    },
    {
      id: 'hard',
      label: 'יריבה חזקה',
      chips: buildPointsRuleChips(difficulty.hard),
    },
  ]
}

export const buildScorersRows = (scorers = {}) => {
  return [
    {
      id: 'scorers10Plus',
      label: 'כובשי 10+',
      chips: buildScorersRuleChips(scorers.scorers10Plus),
      helper: 'שחקני הכרעה ברמת עונה',
    },
    {
      id: 'scorers5Plus',
      label: 'כובשי 5+',
      chips: buildScorersRuleChips(scorers.scorers5Plus),
      helper: 'מוקדי שערים משמעותיים',
    },
  ]
}

export const buildSquadUsageRows = (
  squadUsage = {},
  options = {}
) => {
  return [
    {
      id: 'players1000Pct',
      label: 'שחקני 1000+ דקות',
      chips: buildSquadUsageChips(squadUsage.players1000Pct, options),
      helper: 'שחקני רוטציה משמעותיים מתוך סגל 24',
    },
    {
      id: 'players2000Pct',
      label: 'שחקני 2000+ דקות',
      chips: buildSquadUsageChips(squadUsage.players2000Pct, options),
      helper: 'שחקני מפתח בהיקף דקות גבוה מתוך סגל 24',
    },
  ]
}
