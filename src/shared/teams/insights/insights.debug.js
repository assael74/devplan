// src/shared/teams/insights/insights.debug.js

const emptyObject = {}

const toRow = group => {
  return {
    id: group.id,
    label: group.label,
    score: group.score,
    scoreLabel: group.scoreLabel,
    color: group.diagnosis?.color,
    displayTone: group.diagnosis?.displayTone,
    qualityTone: group.diagnosis?.qualityTone,
    riskTone: group.diagnosis?.riskTone,
    diagnosisId: group.diagnosis?.id,
    diagnosis: group.diagnosis?.label,
    players: group.sample?.players,
    checked: group.sample?.checked,
    weak: group.health?.weakCount,
    damage: group.health?.damageScore,
    weakTva: group.health?.weakWeightedTva,
    tva: group.metrics?.totalTva,
  }
}

const toRecommendationRow = item => {
  return {
    id: item.id,
    typeId: item.typeId,
    title: item.title,
    tone: item.tone,
    priority: item.priority,
    aspect: item.source?.aspectId,
    mode: item.source?.mode,
    group: item.source?.groupLabel,
    score: item.metrics?.score,
    weak: item.metrics?.weakCount,
    damage: item.metrics?.damageScore,
    tva: item.metrics?.totalTva,
  }
}

const printAspect = aspect => {
  if (!aspect) return

  console.log(`ASPECT / ${aspect.title || aspect.id}`)
  console.table((aspect.groups || []).map(toRow))
}

const printModeAspect = aspect => {
  const modes = aspect?.modes || emptyObject

  Object.values(modes).forEach(mode => {
    console.log(`ASPECT / ${aspect.title || aspect.id} / ${mode.modeLabel || mode.mode || mode.id}`)
    console.table((mode.groups || []).map(toRow))
  })
}

const printRecommendations = model => {
  const items = model?.recommendations?.items || []

  console.log('RECOMMENDATIONS')
  console.table(items.map(toRecommendationRow))
}

export const printTeamInsightsDebug = ({ model = emptyObject, title = 'TEAM INSIGHTS' } = {}) => {
  console.log(title)

  Object.values(model?.aspects || {}).forEach(aspect => {
    if (aspect?.modes) {
      printModeAspect(aspect)
      return
    }

    printAspect(aspect)
  })

  printRecommendations(model)
}
