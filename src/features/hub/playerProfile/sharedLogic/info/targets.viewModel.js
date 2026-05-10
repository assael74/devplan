// features/hub/playerProfile/sharedLogic/info/targets.viewModel.js

import {
  EMPTY,
  formatRange,
  formatTargetValue,
  isDefensivePlayer,
} from './targets.formatters.js'

import {
  buildActualCards,
  buildPlayerTargetsActuals,
} from './targets.actuals.js'

const buildAttackTargetCards = ({
  values = {},
}) => {
  const attack = values.attack || {}
  const usage = values.usage || {}

  const goalsTarget = formatRange({
    range: attack.goalsTargetRange,
  })

  const assistsTarget = formatRange({
    range: attack.assistsTargetRange,
  })

  const goalContributionsTarget = formatRange({
    range: attack.goalContributionsTargetRange,
  })

  const minutesTarget = formatRange({
    range: usage.minutesRange,
    suffix: '%',
  })

  return [
    {
      id: 'goals',
      label: 'יעד שערים',
      value: goalsTarget,
      helper: 'לפי עמדה, מעמד ויעד קבוצה',
    },
    {
      id: 'assists',
      label: 'יעד בישולים',
      value: assistsTarget,
      helper: 'רף תפקודי לשחקן התקפה',
    },
    {
      id: 'goalContributions',
      label: 'יעד מעורבות',
      value: goalContributionsTarget,
      helper: 'שערים + בישולים',
    },
    {
      id: 'minutes',
      label: 'יעד דקות',
      value: minutesTarget,
      helper: 'לפי מעמד בסגל',
    },
  ].filter((card) => card.value !== EMPTY)
}

const buildDefenseTargetCards = ({
  values = {},
}) => {
  const defense = values.defense || {}
  const usage = values.usage || {}

  const minutesTarget = formatRange({
    range: usage.minutesRange,
    suffix: '%',
  })

  const lineupTarget = formatRange({
    range: usage.startsRange,
    suffix: '%',
  })

  const playerGoalsAgainstTarget = formatRange({
    range: defense.playerGoalsAgainstTargetRange,
  })

  const goalsAgainstPerGameTarget = formatTargetValue({
    value: defense.goalsAgainstPerGameTarget,
  })

  return [
    {
      id: 'minutes',
      label: 'יעד דקות',
      value: minutesTarget,
      helper: 'לפי מעמד בסגל',
    },
    {
      id: 'lineup',
      label: 'יעד הרכב',
      value: lineupTarget,
      helper: 'אחוז פתיחה בהרכב',
    },
    {
      id: 'playerGoalsAgainst',
      label: 'יעד ספיגה לפי דקות',
      value: playerGoalsAgainstTarget,
      helper: 'ספיגה צפויה ביחס לדקות',
    },
    {
      id: 'goalsAgainstPerGame',
      label: 'ספיגה למשחק',
      value: goalsAgainstPerGameTarget,
      helper: 'יעד קבוצתי למשחק',
    },
  ].filter((card) => card.value !== EMPTY)
}

const buildTargetCards = ({
  values,
  defensive,
}) => {
  if (defensive) {
    return buildDefenseTargetCards({
      values,
    })
  }

  return buildAttackTargetCards({
    values,
  })
}

const buildTargetBasis = ({
  labels = {},
}) => {
  return {
    role: labels.role || EMPTY,
    position: labels.position || EMPTY,
    teamProfile: labels.teamProfile || EMPTY,
    playerTarget: labels.playerTarget || EMPTY,
  }
}

const getPositionLayer = ({
  targets = {},
}) => {
  return (
    targets?.position?.layerKey ||
    targets?.position?.id ||
    ''
  )
}

export function buildPlayerTargetsViewModel({
  player = {},
  team = {},
  targets = {},
} = {}) {
  const values = targets?.values || {}
  const labels = targets?.labels || {}
  const positionLayer = getPositionLayer({ targets })
  const defensive = isDefensivePlayer(positionLayer)

  const actuals = buildPlayerTargetsActuals({
    player,
    team,
  })

  const targetBasis = buildTargetBasis({
    labels,
  })

  const actualCards = buildActualCards({
    actuals,
  })

  const targetCards = buildTargetCards({
    values,
    defensive,
  })

  return {
    hasTargets: targets?.hasTargets === true,
    emptyText: EMPTY,
    roleType: defensive ? 'defense' : 'attack',
    targetBasis,
    actualCards,
    targetCards,
  }
}
