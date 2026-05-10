// src/shared/players/targets/playerTargets.view.js

import {
  buildLowHighChips,
  buildRangeThresholdChips,
  buildRangeObjThresholdChips,
  buildSingleTargetChips,
  buildPctThresholdChips,
  formatPlayerTargetValue,
  formatPlayerTargetRange,
  formatPlayerTargetRangeObj,
} from './playerTargets.chips.js'

import {
  getPlayerTargetsSectionOrder,
  PLAYER_TARGET_SECTION_META,
} from './playerTargets.sections.js'

const emptyText = '—'

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const pickNumber = (source = {}, keys = []) => {
  for (let i = 0; i < keys.length; i++) {
    const n = toNumber(source?.[keys[i]])

    if (Number.isFinite(n)) return n
  }

  return null
}

const pickNestedNumber = (sources = []) => {
  for (let i = 0; i < sources.length; i++) {
    const n = toNumber(sources[i])

    if (Number.isFinite(n)) return n
  }

  return null
}

const getActuals = ({
  player = {},
  team = {},
} = {}) => {
  const playerStats = player?.stats || player?.metrics || player?.seasonStats || {}
  const teamStats = team?.stats || team?.metrics || {}

  return {
    player: {
      goals: pickNestedNumber([
        player.goals,
        playerStats.goals,
        playerStats.totalGoals,
      ]),
      assists: pickNestedNumber([
        player.assists,
        playerStats.assists,
        playerStats.totalAssists,
      ]),
      goalContributions: pickNestedNumber([
        player.goalContributions,
        playerStats.goalContributions,
        playerStats.goalsAssists,
      ]),
      minutesPct: pickNestedNumber([
        player.minutesPct,
        playerStats.minutesPct,
        playerStats.minutesSharePct,
      ]),
      startsPct: pickNestedNumber([
        player.startsPct,
        playerStats.startsPct,
        playerStats.startsSharePct,
      ]),
    },

    team: {
      points: pickNestedNumber([
        team.points,
        teamStats.points,
      ]),
      successRate: pickNestedNumber([
        team.successRate,
        team.pointsRate,
        teamStats.successRate,
        teamStats.pointsRate,
      ]),
      goalsFor: pickNestedNumber([
        team.leagueGoalsFor,
        team.goalsFor,
        teamStats.goalsFor,
      ]),
      goalsAgainst: pickNestedNumber([
        team.leagueGoalsAgainst,
        team.goalsAgainst,
        teamStats.goalsAgainst,
      ]),
    },
  }
}

const buildSummaryCards = ({
  targets = {},
  actuals = {},
} = {}) => {
  const values = targets?.values || {}
  const attack = values.attack || {}
  const usage = values.usage || {}
  const teamSeason = values.teamSeason || {}

  return {
    personal: [
      {
        id: 'goals',
        label: 'שערים',
        value: formatPlayerTargetValue(actuals.player.goals),
        sub: `יעד ${formatPlayerTargetRangeObj(attack.goalsTargetRange)}`,
        color: 'success',
        icon: 'goal',
      },
      {
        id: 'assists',
        label: 'בישולים',
        value: formatPlayerTargetValue(actuals.player.assists),
        sub: `יעד ${formatPlayerTargetRangeObj(attack.assistsTargetRange)}`,
        color: 'primary',
        icon: 'assist',
      },
      {
        id: 'minutes',
        label: 'דקות',
        value: formatPlayerTargetValue(actuals.player.minutesPct, '%'),
        sub: `יעד ${formatPlayerTargetRange(usage.minutesRange, '%')}`,
        color: 'neutral',
        icon: 'minutes',
      },
    ],

    team: [
      {
        id: 'points',
        label: 'נקודות קבוצה',
        value: formatPlayerTargetValue(actuals.team.points),
        sub: `יעד ${formatPlayerTargetValue(teamSeason.points)}`,
        color: 'primary',
        icon: 'points',
      },
      {
        id: 'goalsFor',
        label: 'שערי זכות',
        value: formatPlayerTargetValue(actuals.team.goalsFor),
        sub: `יעד ${formatPlayerTargetValue(teamSeason.goalsFor)}`,
        color: 'success',
        icon: 'goal',
      },
      {
        id: 'goalsAgainst',
        label: 'שערי חובה',
        value: formatPlayerTargetValue(actuals.team.goalsAgainst),
        sub: `יעד ${formatPlayerTargetValue(teamSeason.goalsAgainst)}`,
        color: 'danger',
        icon: 'defense',
      },
    ],
  }
}

const buildTeamImpactRows = ({
  values = {},
  actuals = {},
} = {}) => {
  const teamSeason = values.teamSeason || {}

  return [
    {
      id: 'teamPoints',
      label: 'נקודות קבוצה',
      actual: formatPlayerTargetValue(actuals.team.points),
      chips: buildSingleTargetChips({
        value: teamSeason.points,
      }),
      helper: 'יעד נקודות קבוצתי שממנו נגזרת רמת העונה',
    },
    {
      id: 'teamGoalsFor',
      label: 'שערי זכות קבוצה',
      actual: formatPlayerTargetValue(actuals.team.goalsFor),
      chips: buildSingleTargetChips({
        value: teamSeason.goalsFor,
      }),
      helper: 'בסיס לחישוב יעדי שערים ובישולים לשחקן',
    },
    {
      id: 'teamGoalsAgainst',
      label: 'שערי חובה קבוצה',
      actual: formatPlayerTargetValue(actuals.team.goalsAgainst),
      chips: buildSingleTargetChips({
        value: teamSeason.goalsAgainst,
      }),
      helper: 'בסיס ליעדי הגנה ואחריות לפי דקות',
    },
  ]
}

const buildAttackRows = ({
  values = {},
  actuals = {},
} = {}) => {
  const attack = values.attack || {}

  return [
    {
      id: 'goals',
      label: 'שערים',
      actual: formatPlayerTargetValue(actuals.player.goals),
      chips: buildRangeObjThresholdChips({
        rangeObj: attack.goalsTargetRange,
      }),
      helper: 'טווח שערים לפי יעד שערי הקבוצה, עמדה ומעמד',
    },
    {
      id: 'assists',
      label: 'בישולים',
      actual: formatPlayerTargetValue(actuals.player.assists),
      chips: buildRangeObjThresholdChips({
        rangeObj: attack.assistsTargetRange,
      }),
      helper: 'טווח בישולים לפי תפקיד התקפי',
    },
    {
      id: 'contributions',
      label: 'מעורבות בשערים',
      actual: formatPlayerTargetValue(actuals.player.goalContributions),
      chips: buildRangeObjThresholdChips({
        rangeObj: attack.goalContributionsTargetRange,
      }),
      helper: 'שערים + בישולים',
    },
  ]
}

const buildUsageRows = ({
  values = {},
  actuals = {},
} = {}) => {
  const usage = values.usage || {}

  return [
    {
      id: 'minutes',
      label: 'דקות',
      actual: formatPlayerTargetValue(actuals.player.minutesPct, '%'),
      chips: buildRangeThresholdChips({
        range: usage.minutesRange,
        suffix: '%',
      }),
      helper: 'טווח דקות מצופה לפי מעמד בסגל',
    },
    {
      id: 'starts',
      label: 'פתיחות',
      actual: formatPlayerTargetValue(actuals.player.startsPct, '%'),
      chips: buildRangeThresholdChips({
        range: usage.startsRange,
        suffix: '%',
      }),
      helper: 'טווח פתיחות מצופה לפי מעמד בסגל',
    },
  ]
}

const buildDefenseRows = ({
  values = {},
  actuals = {},
} = {}) => {
  const defense = values.defense || {}

  return [
    {
      id: 'teamGoalsAgainst',
      label: 'ספיגה קבוצתית',
      actual: formatPlayerTargetValue(actuals.team.goalsAgainst),
      chips: buildSingleTargetChips({
        value: defense.teamGoalsAgainstTarget,
      }),
      helper: 'יעד שערי חובה של הקבוצה',
    },
    {
      id: 'goalsAgainstPerGame',
      label: 'ספיגה למשחק',
      actual: emptyText,
      chips: buildSingleTargetChips({
        value: defense.goalsAgainstPerGameTarget,
      }),
      helper: 'נגזר מיעד שערי חובה ומספר משחקי ליגה',
    },
    {
      id: 'playerGoalsAgainst',
      label: 'אחריות לפי דקות',
      actual: emptyText,
      chips: buildRangeObjThresholdChips({
        rangeObj: defense.playerGoalsAgainstTargetRange,
      }),
      helper: 'חלק יחסי לפי טווח הדקות הצפוי',
    },
  ]
}

const buildPositionRows = ({
  values = {},
} = {}) => {
  const position = values.position || {}

  return [
    {
      id: 'contributionPerGame',
      label: 'תרומה למשחק',
      actual: emptyText,
      chips: buildPctThresholdChips({
        greenMin: position.contributionPerGameTarget,
        redBelow: null,
        suffix: '',
      }),
      helper: 'רף בסיס לפי שכבת עמדה',
    },
    {
      id: 'teamGoalsSharePct',
      label: 'חלק משערי הקבוצה',
      actual: emptyText,
      chips: buildPctThresholdChips({
        greenMin: position.teamGoalsSharePctTarget,
        redBelow: null,
        suffix: '%',
      }),
      helper: 'חלק יחסי משערי הקבוצה',
    },
    {
      id: 'cleanSheetPct',
      label: 'שער נקי',
      actual: emptyText,
      chips: buildPctThresholdChips({
        greenMin: position.cleanSheetPctTarget,
        redBelow: null,
        suffix: '%',
      }),
      helper: 'רלוונטי בעיקר לשוערים והגנה',
    },
  ].filter((row) => row.chips.length > 0)
}

const buildSectionsMap = ({
  values,
  actuals,
}) => {
  return {
    teamImpact: buildTeamImpactRows({ values, actuals }),
    attack: buildAttackRows({ values, actuals }),
    usage: buildUsageRows({ values, actuals }),
    defense: buildDefenseRows({ values, actuals }),
    position: buildPositionRows({ values, actuals }),
  }
}

export function buildPlayerTargetsViewModel({
  player = {},
  team = {},
  targets = {},
} = {}) {
  const labels = targets?.labels || {}
  const values = targets?.values || {}
  const positionLayer = targets?.position?.layerKey || targets?.position?.id || ''

  const actuals = getActuals({
    player,
    team,
  })

  const summaryCards = buildSummaryCards({
    targets,
    actuals,
  })

  const sectionRowsMap = buildSectionsMap({
    values,
    actuals,
  })

  const order = getPlayerTargetsSectionOrder({
    positionLayer,
  })

  const sections = order
    .map((sectionId) => {
      const meta = PLAYER_TARGET_SECTION_META[sectionId]
      const rows = sectionRowsMap[sectionId] || []

      if (!meta || rows.length === 0) return null

      return {
        ...meta,
        rows,
      }
    })
    .filter(Boolean)

  return {
    hasTargets: targets?.hasTargets === true,

    labels: {
      role: labels.role || emptyText,
      position: labels.position || emptyText,
      teamProfile: labels.teamProfile || emptyText,
      playerTarget: labels.playerTarget || emptyText,
    },

    actuals,
    summaryCards,
    sections,

    emptyText,
  }
}
