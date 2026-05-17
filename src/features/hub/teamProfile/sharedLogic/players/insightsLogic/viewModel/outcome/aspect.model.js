// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/outcome/aspect.model.js

import {
  OUTCOME_EMPTY_STATUS,
  OUTCOME_READY_STATUS,
} from './constants.js'

import {
  buildOutcomeGroup,
} from './group.model.js'

const emptyArray = []

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const getStatus = groups => {
  const hasChecked = groups.some(group => group.sample.checked > 0)

  return hasChecked
    ? OUTCOME_READY_STATUS
    : OUTCOME_EMPTY_STATUS
}

const buildSummary = groups => {
  const checkedGroups = groups.filter(group => group.sample.checked > 0)
  const dangerGroups = groups.filter(group => group.diagnosis.color === 'danger')
  const alertGroups = groups.filter(group => {
    return ['danger', 'warning'].includes(group.diagnosis.color)
  })

  const scoreGroups = checkedGroups.filter(group => group.score !== null)
  const totalScore = scoreGroups.reduce((sum, group) => {
    return sum + toNum(group.score)
  }, 0)

  return {
    groups: groups.length,
    checkedGroups: checkedGroups.length,
    alertGroups: alertGroups.length,
    dangerGroups: dangerGroups.length,
    avgScore: scoreGroups.length
      ? Number((totalScore / scoreGroups.length).toFixed(2))
      : null,
    totalDamage: Number(groups.reduce((sum, group) => {
      return sum + toNum(group.health.damageScore)
    }, 0).toFixed(2)),
  }
}

export const buildOutcomeAspect = ({
  aspect,
  items = emptyArray,
  perfMap,
}) => {
  const groups = items.map(item => {
    return buildOutcomeGroup({
      item,
      players: item.players,
      perfMap,
    })
  })

  return {
    id: aspect.id,
    title: aspect.title,
    icon: aspect.icon,
    status: getStatus(groups),
    groups,
    summary: buildSummary(groups),
  }
}
