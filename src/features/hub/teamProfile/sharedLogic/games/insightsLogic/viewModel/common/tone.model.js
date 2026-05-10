// teamProfile/sharedLogic/games/insightsLogic/viewModel/common/tone.model.js

const toneColor = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
  neutral: 'neutral',
}

export function normalizeTone(value, fallback = 'neutral') {
  if (toneColor[value]) return toneColor[value]

  return fallback
}

export function resolveInsightColor({
  takeaway,
  insight,
  brief,
}) {
  if (toneColor[takeaway?.tone]) return toneColor[takeaway.tone]
  if (toneColor[insight?.color]) return toneColor[insight.color]
  if (toneColor[brief?.tone]) return toneColor[brief.tone]

  return 'neutral'
}
