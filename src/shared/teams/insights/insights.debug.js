// src/shared/teams/insights/insights.debug.js

const emptyObject = {}

const toRow = group => {
  return {
    id: group.id,
    label: group.label,
    score: group.score,
    groupTone: group.diagnosis?.groupTone,
    alertTone: group.diagnosis?.alertTone,
    diagnosis: group.diagnosis?.label,
    players: group.sample?.players,
    checked: group.sample?.checked,
    weak: group.health?.weakCount,
    damage: group.health?.damageScore,
    tva: group.metrics?.totalTva,
  }
}

export const printTeamInsightsDebug = ({
  model = emptyObject,
  title = 'TEAM INSIGHTS',
} = {}) => {
  console.log(title)

  Object.values(model?.aspects || {}).forEach((aspect) => {
    console.log(`ASPECT / ${aspect.title || aspect.id}`)
    console.table((aspect.groups || []).map(toRow))
  })
}
