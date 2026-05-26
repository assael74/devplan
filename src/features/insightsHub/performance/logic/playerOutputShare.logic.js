// features/insightsHub/performance/logic/playerOutputShare.logic.js

import {
  buildPlayerExplicitTargets,
} from '../../../../shared/players/targets/index.js'

import {
  formatRange,
} from './performanceModel.format.js'

const roleOptions = [
  { id: 'key', label: 'שחקן מוביל' },
  { id: 'core', label: 'שחקן מרכזי' },
  { id: 'rotation', label: 'רוטציה' },
]

const positionOptions = [
  { id: 'attack', label: 'התקפה' },
  { id: 'atMidfield', label: 'קישור התקפי' },
  { id: 'midfield', label: 'קישור' },
  { id: 'defense', label: 'הגנה' },
]

const formatMinMax = range => {
  const min = range?.min || 0
  const max = range?.max || 0

  return `${min}–${max}`
}

const buildTarget = ({ role, position, teamGoalsForTarget, teamProfileId }) => {
  return buildPlayerExplicitTargets({
    role: {
      id: role.id,
      label: role.label,
    },
    position: {
      layerKey: position.id,
      layerLabel: position.label,
    },
    roleTarget: {},
    positionTarget: {},
    teamTargets: {
      targetProfileId: teamProfileId,
      forecastTargets: {
        goalsFor: teamGoalsForTarget,
        goalsAgainst: 0,
      },
    },
  })
}

const buildRow = ({ role, position, teamGoalsForTarget, teamProfileId }) => {
  const result = buildTarget({
    role,
    position,
    teamGoalsForTarget,
    teamProfileId,
  })

  const attack = result?.attack || {}

  return {
    id: `${role.id}-${position.id}`,
    role: role.label,
    position: position.label,
    goalsShare: formatRange(attack.goalsShareRange),
    assistsShare: formatRange(attack.assistsShareRange),
    contributionShare: formatRange(attack.contributionShareRange),
    goals: formatMinMax(attack.goalsTargetRange),
    assists: formatMinMax(attack.assistsTargetRange),
    contributions: formatMinMax(attack.goalContributionsTargetRange),
  }
}

const buildRows = ({ teamGoalsForTarget = 80, teamProfileId = 'midHigh' } = {}) => {
  return roleOptions.flatMap(role => {
    return positionOptions.map(position => {
      return buildRow({
        role,
        position,
        teamGoalsForTarget,
        teamProfileId,
      })
    })
  })
}

export const buildPlayerOutputShareBlock = (block = {}) => {
  return {
    title: block.title || 'דוגמה לחלוקה מספרית',
    subtitle: block.subtitle || '',
    columns: [
      { id: 'role', label: 'מעמד' },
      { id: 'position', label: 'עמדה' },
      { id: 'goalsShare', label: 'אחוז שערים' },
      { id: 'assistsShare', label: 'אחוז בישולים' },
      { id: 'contributionShare', label: 'מעורבות' },
      { id: 'goals', label: 'יעד שערים' },
      { id: 'assists', label: 'יעד בישולים' },
      { id: 'contributions', label: 'יעד מעורבות' },
    ],
    rows: buildRows({
      teamGoalsForTarget: block.teamGoalsForTarget,
      teamProfileId: block.teamProfileId,
    }),
  }
}
