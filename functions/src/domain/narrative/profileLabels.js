// C:\projects\devplan\functions\src\domain\narrative\profileLabels.js

const PROFILE_LABELS = Object.freeze({
  clear_scorer: 'הסקורר המובהק',
  killer_efficiency: 'ניצול מצבים קטלני',
  last_station: 'התחנה האחרונה',
  back_threat: 'האיום מאחור',
  promoted_talent: 'הכישרון המוקפץ',
  single_engine: 'מקור תפוקה מרכזי',
  lineup_banker: 'באנקר הרכב',
  pro_anchor: 'העוגן המקצועי',
  secondary_threat: 'האיום המשני',
  underused_prospect: 'שחקן איכותי שלא מקבל הזדמנות',
  blocked_top_team: 'שחקן איכותי שלא מצליח לפרוץ',
})

function clean(value) {
  return String(value || '').trim()
}

function resolveProfileLabel(profile = {}) {
  const explicitLabel = clean(profile.profileLabel)
  if (explicitLabel) return explicitLabel

  const profileId = clean(profile.profileId)
  return PROFILE_LABELS[profileId] || ''
}

module.exports = { resolveProfileLabel }
