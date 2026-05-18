// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/ui/outcomeCards.ui.js

const ltr = '\u200E'

const joyColors = [
  'success',
  'warning',
  'danger',
  'primary',
  'neutral',
]

export const toJoyColor = color => {
  if (joyColors.includes(color)) return color
  if (color === 'info') return 'primary'

  return 'neutral'
}

export const getGroupTone = group => {
  return group?.diagnosis?.displayTone ||
    group?.diagnosis?.color ||
    group?.diagnosis?.groupTone ||
    group?.diagnosis?.riskTone ||
    group?.diagnosis?.qualityTone ||
    group?.scoreTone ||
    'neutral'
}

export const getGroupJoyTone = group => {
  return toJoyColor(getGroupTone(group))
}

export const getQualityJoyTone = group => {
  return toJoyColor(group?.diagnosis?.qualityTone || getGroupTone(group))
}

export const formatSigned = (value, digits = 2) => {
  const n = Number(value)

  if (!Number.isFinite(n) || n === 0) return `${ltr}0`

  const abs = Math.abs(n).toFixed(digits)

  return n > 0
    ? `${ltr}+${abs}`
    : `${ltr}-${abs}`
}

export const getGroupScoreValue = group => {
  return group?.scoreLabel || '-'
}

export const getGroupDamageValue = group => {
  return (
    group?.health?.weakWeightedTvaLabel ||
    group?.health?.weakWeightedTva ||
    0
  )
}

export const getWeakSampleValue = group => {
  return `${group?.health?.weakCount || 0}/${group?.sample?.players || 0}`
}
