// // teamProfile/sharedLogic/players/moduleLogic/row/row.targets.js

import {
  buildPlayerTargetsState,
  buildPlayerTargetsViewModel,
  formatPlayerTargetRange,
  formatPlayerTargetRangeObj,
  formatPlayerTargetValue,
} from '../../../../../../../shared/players/targets/index.js'

const emptyTargets = {
  hasTargets: false,
  labels: {},
  usage: {},
  attack: {},
  defense: {},
  teamSeason: {},
  mainItems: [],
  viewModel: null,
  source: null,
}

const isDisplayValue = value => {
  return value !== null && value !== undefined && value !== '' && value !== '—'
}

const makeItem = ({
  id,
  label,
  value,
  icon,
  tone = 'neutral',
}) => {
  if (!isDisplayValue(value)) return null

  return {
    id,
    label,
    value,
    icon,
    tone,
  }
}

const buildUsageItems = values => {
  const usage = values?.usage || {}

  return [
    makeItem({
      id: 'minutes',
      label: 'דקות',
      value: formatPlayerTargetRange(usage.minutesRange, '%'),
      icon: 'playTimeRate',
      tone: 'neutral',
    }),
    makeItem({
      id: 'starts',
      label: 'הרכב',
      value: formatPlayerTargetRange(usage.startsRange, '%'),
      icon: 'isStart',
      tone: 'neutral',
    }),
  ].filter(Boolean)
}

const buildAttackItems = values => {
  const attack = values?.attack || {}

  return [
    makeItem({
      id: 'goals',
      label: 'שערים',
      value: formatPlayerTargetRangeObj(attack.goalsTargetRange),
      icon: 'goal',
    }),
    makeItem({
      id: 'assists',
      label: 'בישולים',
      value: formatPlayerTargetRangeObj(attack.assistsTargetRange),
      icon: 'assists',
    }),
  ].filter(Boolean)
}

const buildDefenseItems = values => {
  const defense = values?.defense || {}

  if (defense.isDefensivePosition !== true) return []

  return [
    makeItem({
      id: 'goalsAgainst',
      label: 'ספיגה',
      value: formatPlayerTargetRangeObj(defense.playerGoalsAgainstTargetRange),
      icon: 'defense',
    }),
  ].filter(Boolean)
}

const buildMainItems = targets => {
  const values = targets?.values || {}

  return [
    ...buildAttackItems(values),
    ...buildDefenseItems(values),
  ]
}

export const buildPlayerRowTargets = ({ row, team } = {}) => {
  const player = row?.player || row || {}

  const state = buildPlayerTargetsState({
    player,
    team,
  })

  if (!state?.hasTargets) {
    return {
      ...emptyTargets,
      source: state || null,
    }
  }

  const viewModel = buildPlayerTargetsViewModel({
    player,
    team,
    targets: state,
  })

  return {
    hasTargets: true,

    labels: state.labels || {},

    usage: state.values?.usage || {},
    attack: state.values?.attack || {},
    defense: state.values?.defense || {},
    teamSeason: state.values?.teamSeason || {},

    mainItems: buildMainItems(state),
    viewModel,
    source: state,
  }
}
