// shared/teams/targets/teamTargets.view.logic.js

export const TEAM_TARGET_DEFAULT_SQUAD_SIZE = 24

export const emptyTargetText = '-'

export const isTargetValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

export const formatTargetValue = (value, suffix = '') => {
  if (!isTargetValue(value)) return emptyTargetText
  return `${value}${suffix}`
}

export const formatChipValue = (value, suffix = '') => {
  if (!isTargetValue(value)) return ''
  if (Number(value) === 1 && String(suffix).trim() === 'שחקנים') {
    return '1 שחקן'
  }

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
  return `${min}-${max} שחקנים`
}

export const formatCountRange = (range = [], suffix = '') => {
  if (!Array.isArray(range)) return ''

  const min = Number(range[0])
  const max = Number(range[1])

  if (!Number.isFinite(min) && !Number.isFinite(max)) return ''
  if (Number.isFinite(min) && Number.isFinite(max)) {
    if (min === max) return `${min}${suffix}`
    return `${min}-${max}${suffix}`
  }
  if (Number.isFinite(min)) return `${min}+${suffix}`

  return `עד ${max}${suffix}`
}

const isExactMode = (mode) => String(mode || '').trim() === 'exact'

const makeChip = ({ id, label, color = 'success', variant = 'soft' }) => {
  if (!label) return null

  return {
    id,
    label,
    color,
    variant,
  }
}

const compactChips = (chips = []) => chips.filter(Boolean)

export const buildPointsRuleChips = (rule = {}) => {
  if (!rule || typeof rule !== 'object') return []

  return compactChips([
    isTargetValue(rule.targetRate)
      ? makeChip({
          id: 'targetRate',
          label: formatPointsPct(rule.targetRate),
        })
      : null,
    isTargetValue(rule.greenMin)
      ? makeChip({
          id: 'greenMin',
          label: `מ-${formatPointsPct(rule.greenMin)}`,
        })
      : null,
    isTargetValue(rule.greenMax)
      ? makeChip({
          id: 'greenMax',
          label: `עד ${formatPointsPct(rule.greenMax)}`,
        })
      : null,
    isTargetValue(rule.redBelow)
      ? makeChip({
          id: 'redBelow',
          label: `מתחת ${formatPointsPct(rule.redBelow)}`,
          color: 'danger',
        })
      : null,
    isTargetValue(rule.redAbove)
      ? makeChip({
          id: 'redAbove',
          label: `מעל ${formatPointsPct(rule.redAbove)}`,
          color: 'danger',
        })
      : null,
    isTargetValue(rule.redMin)
      ? makeChip({
          id: 'redMin',
          label: `מ-${formatPointsPct(rule.redMin)}`,
          color: 'danger',
        })
      : null,
  ])
}

export const buildScorersRuleChips = (rule = {}, suffix = '', options = {}) => {
  if (!rule || typeof rule !== 'object') return []

  if (isExactMode(options.targetPositionMode)) {
    return compactChips([
      isTargetValue(rule.target)
        ? makeChip({
            id: 'target',
            label: formatChipValue(rule.target, suffix),
            color: 'primary',
          })
        : null,
    ])
  }

  if (Array.isArray(rule.range)) {
    return compactChips([
      makeChip({
        id: 'range',
        label: formatCountRange(rule.range, suffix),
      }),
    ])
  }

  return compactChips([
    isTargetValue(rule.target)
      ? makeChip({
          id: 'target',
          label: formatChipValue(rule.target, suffix),
          color: 'primary',
        })
      : null,
    isTargetValue(rule.greenMin)
      ? makeChip({
          id: 'greenMin',
          label: `מ-${formatChipValue(rule.greenMin, suffix)}`,
        })
      : null,
    isTargetValue(rule.greenMax)
      ? makeChip({
          id: 'greenMax',
          label: `עד ${formatChipValue(rule.greenMax, suffix)}`,
        })
      : null,
    isTargetValue(rule.redBelow)
      ? makeChip({
          id: 'redBelow',
          label: `מתחת ${formatChipValue(rule.redBelow, suffix)}`,
          color: 'danger',
        })
      : null,
    isTargetValue(rule.redAbove)
      ? makeChip({
          id: 'redAbove',
          label: `מעל ${formatChipValue(rule.redAbove, suffix)}`,
          color: 'danger',
        })
      : null,
  ])
}

export const buildCountRuleChips = (rule = {}, suffix = '', options = {}) => {
  if (!rule || typeof rule !== 'object') return []

  if (isExactMode(options.targetPositionMode)) {
    return compactChips([
      isTargetValue(rule.target)
        ? makeChip({
            id: 'target',
            label: formatChipValue(rule.target, suffix),
            color: 'primary',
          })
        : null,
    ])
  }

  if (Array.isArray(rule.greenRange)) {
    return compactChips([
      makeChip({
        id: 'greenRange',
        label: formatCountRange(rule.greenRange, suffix),
      }),
    ])
  }

  return compactChips([
    isTargetValue(rule.target)
      ? makeChip({
          id: 'target',
          label: formatChipValue(rule.target, suffix),
          color: 'primary',
        })
      : null,
    isTargetValue(rule.redLowMax)
      ? makeChip({
          id: 'redLowMax',
          label: `מתחת ${formatChipValue(rule.redLowMax, suffix)}`,
          color: 'danger',
        })
      : null,
    isTargetValue(rule.redHighMin)
      ? makeChip({
          id: 'redHighMin',
          label: `מעל ${formatChipValue(rule.redHighMin, suffix)}`,
          color: 'danger',
        })
      : null,
  ])
}

export const buildPercentRangeChips = (rule = {}, options = {}) => {
  if (!rule || typeof rule !== 'object') return []

  if (isExactMode(options.targetPositionMode)) {
    return compactChips([
      isTargetValue(rule.target)
        ? makeChip({
            id: 'target',
            label: formatChipValue(rule.target, '%'),
            color: 'primary',
          })
        : null,
    ])
  }

  if (Array.isArray(rule.greenRange)) {
    return compactChips([
      makeChip({
        id: 'greenRange',
        label: formatCountRange(rule.greenRange, '%'),
      }),
    ])
  }

  return compactChips([
    isTargetValue(rule.target)
      ? makeChip({
          id: 'target',
          label: formatChipValue(rule.target, '%'),
          color: 'primary',
        })
      : null,
    isTargetValue(rule.redLowMax)
      ? makeChip({
          id: 'redLowMax',
          label: `מתחת ${formatChipValue(rule.redLowMax, '%')}`,
          color: 'danger',
        })
      : null,
    isTargetValue(rule.redHighMin)
      ? makeChip({
          id: 'redHighMin',
          label: `מעל ${formatChipValue(rule.redHighMin, '%')}`,
          color: 'danger',
        })
      : null,
  ])
}

export const buildSquadUsageChips = (rule = {}, options = {}) => {
  if (!rule || typeof rule !== 'object') return []

  const squadSize = Number(options.squadSize) || TEAM_TARGET_DEFAULT_SQUAD_SIZE
  const includeRiskChips = options.includeRiskChips === true

  return compactChips([
    Array.isArray(rule.greenRange)
      ? makeChip({
          id: 'greenRange',
          label: formatPlayersRange(rule.greenRange, squadSize),
        })
      : null,
    includeRiskChips && isTargetValue(rule.redBelow)
      ? makeChip({
          id: 'redBelow',
          label: `מתחת ${formatPlayersPct(rule.redBelow, squadSize)}`,
          color: 'danger',
        })
      : null,
    includeRiskChips && isTargetValue(rule.redAbove)
      ? makeChip({
          id: 'redAbove',
          label: `מעל ${formatPlayersPct(rule.redAbove, squadSize)}`,
          color: 'danger',
        })
      : null,
  ])
}

export const buildHomeAwayRows = (homeAway = {}) => {
  return [
    {
      id: 'home',
      idIcon: 'home',
      label: 'בית',
      chips: buildPointsRuleChips(homeAway.home),
    },
    {
      id: 'away',
      idIcon: 'away',
      label: 'חוץ',
      chips: buildPointsRuleChips(homeAway.away),
    },
  ]
}

export const buildDifficultyRows = (difficulty = {}) => {
  return [
    {
      id: 'easy',
      idIcon: 'easy',
      label: 'יריבה נוחה',
      chips: buildPointsRuleChips(difficulty.easy),
    },
    {
      id: 'equal',
      idIcon: 'equal',
      label: 'יריבה שווה',
      chips: buildPointsRuleChips(difficulty.equal),
    },
    {
      id: 'hard',
      idIcon: 'hard',
      label: 'יריבה חזקה',
      chips: buildPointsRuleChips(difficulty.hard),
    },
  ]
}

export const buildScorersRows = (scorers = {}, options = {}) => {
  if (
    scorers.scorer ||
    scorers.doubleDigitScorer ||
    scorers.supportScorer ||
    scorers.occasionalScorer
  ) {
    return [
      {
        id: 'scorer',
        label: 'סקורר',
        idIcon: 'clearScorer',
        chips: buildScorersRuleChips(
          scorers.scorer,
          ' שחקנים',
          options
        ),
        helper: 'שחקנים מעל 15 שערים',
      },
      {
        id: 'doubleDigitScorer',
        label: 'כובש דו ספרתי',
        idIcon: 'killerEfficiency',
        chips: buildScorersRuleChips(
          scorers.doubleDigitScorer,
          ' שחקנים',
          options
        ),
        helper: 'שחקנים בין 10 ל 15 שערים',
      },
      {
        id: 'supportScorer',
        label: 'כובש משלים',
        idIcon: 'secondaryThreat',
        chips: buildScorersRuleChips(
          scorers.supportScorer,
          ' שחקנים',
          options
        ),
        helper: 'שחקנים בין 5 ל 10 שערים',
      },
      {
        id: 'occasionalScorer',
        label: 'כובש מזדמן',
        idIcon: 'targetWorker',
        chips: buildScorersRuleChips(
          scorers.occasionalScorer,
          ' שחקנים',
          options
        ),
        helper: 'שחקנים בין 0 ל 5 שערים',
      },
    ]
  }

  return [
    {
      id: 'scorers10Plus',
      label: 'כובשי 10+',
      idIcon: 'clearScorer',
      chips: buildScorersRuleChips(scorers.scorers10Plus, '', options),
      helper: 'שחקני הכרעה ברמת עונה',
    },
    {
      id: 'scorers5Plus',
      label: 'כובשי 5+',
      idIcon: 'secondaryThreat',
      chips: buildScorersRuleChips(scorers.scorers5Plus, '', options),
      helper: 'מוקדי שערים משמעותיים',
    },
  ]
}

export const buildSquadUsageRows = (squadUsage = {}, options = {}) => {
  if (
    squadUsage.top14MinutesSharePct ||
    squadUsage.playersOver500Minutes ||
    squadUsage.playersOver1000Minutes ||
    squadUsage.playersOver1500Minutes ||
    squadUsage.playersOver2000Minutes ||
    squadUsage.playersOver20Starts ||
    squadUsage.unallocatedMinutesSharePct
  ) {
    return [
      {
        id: 'top14MinutesSharePct',
        label: 'נתח דקות לטופ 14',
        idIcon: 'rate',
        chips: buildPercentRangeChips(
          squadUsage.top14MinutesSharePct,
          options
        ),
        helper: 'איזון עומס בין שחקני הסגל',
      },
      {
        id: 'playersOver500Minutes',
        label: 'שחקני 500+ דקות',
        idIcon: 'fringe',
        chips: buildCountRuleChips(
          squadUsage.playersOver500Minutes,
          ' שחקנים',
          options
        ),
        helper: 'שחקני סגל',
      },
      {
        id: 'playersOver1000Minutes',
        label: 'שחקני 1000+ דקות',
        idIcon: 'rotation',
        chips: buildCountRuleChips(
          squadUsage.playersOver1000Minutes,
          ' שחקנים',
          options
        ),
        helper: 'שחקני רוטציה',
      },
      {
        id: 'playersOver1500Minutes',
        label: 'שחקני 1500+ דקות',
        idIcon: 'corePlayer',
        chips: buildCountRuleChips(
          squadUsage.playersOver1500Minutes,
          ' שחקנים',
          options
        ),
        helper: 'שחקנים מרכזיים',
      },
      {
        id: 'playersOver2000Minutes',
        label: 'שחקני 2000+ דקות',
        idIcon: 'keyPlayer',
        chips: buildCountRuleChips(
          squadUsage.playersOver2000Minutes,
          ' שחקנים',
          options
        ),
        helper: 'שחקני מפתח',
      },
      {
        id: 'playersOver20Starts',
        label: 'שחקני 20+ בהרכב',
        idIcon: 'isStart',
        chips: buildCountRuleChips(
          squadUsage.playersOver20Starts,
          ' שחקנים',
          options
        ),
        helper: 'שחקני הרכב קבועים',
      },
      {
        id: 'unallocatedMinutesSharePct',
        label: 'שנתון צעיר',
        idIcon: 'fringe',
        chips: buildPercentRangeChips(
          squadUsage.unallocatedMinutesSharePct,
          options
        ),
        helper: 'דקות לשנות צעיר',
      },
    ]
  }

  return [
    {
      id: 'players1000Pct',
      label: 'שחקני 1000+ דקות',
      idIcon: 'corePlayer',
      chips: buildSquadUsageChips(squadUsage.players1000Pct, options),
      helper: 'שחקני רוטציה משמעותיים',
    },
    {
      id: 'players2000Pct',
      idIcon: 'keyPlayer',
      label: 'שחקני 2000+ דקות',
      chips: buildSquadUsageChips(squadUsage.players2000Pct, options),
      helper: 'שחקני מפתח',
    },
  ]
}
