// src/shared/teams/insights/insights.diagnosis.js

import {
  DEFAULT_RISK_RULES,
  TEAM_INSIGHTS_THRESHOLDS,
  TEAM_QUALITY_TONES,
  TEAM_RISK_TONES,
  TEAM_ROLE_RISK_RULES,
} from './insights.config.js'

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const getRiskRules = roleId => {
  return TEAM_ROLE_RISK_RULES[roleId] || DEFAULT_RISK_RULES
}

const getCountRiskLevel = ({
  roleId,
  weakCount,
}) => {
  const rules = getRiskRules(roleId)
  const count = toNum(weakCount)

  if (rules.danger !== undefined && count >= rules.danger) return 'danger'
  if (rules.warning !== undefined && count >= rules.warning) return 'warning'
  if (rules.info !== undefined && count >= rules.info) return 'info'

  return 'none'
}

const getDamageRiskLevel = damageScore => {
  const damage = toNum(damageScore)

  if (damage >= TEAM_INSIGHTS_THRESHOLDS.severeDamageScore) return 'danger'
  if (damage >= TEAM_INSIGHTS_THRESHOLDS.highDamageScore) return 'warning'
  if (damage >= TEAM_INSIGHTS_THRESHOLDS.warningDamageScore) return 'info'

  return 'none'
}

const riskRank = {
  none: 0,
  info: 1,
  warning: 2,
  danger: 3,
}

const maxRisk = (...levels) => {
  return levels.reduce((best, level) => {
    return riskRank[level] > riskRank[best] ? level : best
  }, 'none')
}

const getRiskLevel = ({
  roleId,
  weakCount,
  damageScore,
}) => {
  return maxRisk(
    getCountRiskLevel({
      roleId,
      weakCount,
    }),
    getDamageRiskLevel(damageScore)
  )
}

const getQualityLevel = ({
  score,
  totalTva,
  checked,
}) => {
  if (!checked || score === null) return 'noSample'

  if (
    score >= TEAM_INSIGHTS_THRESHOLDS.strongScoreFrom &&
    totalTva >= TEAM_INSIGHTS_THRESHOLDS.positiveTvaFrom
  ) {
    return 'strong'
  }

  if (
    score >= TEAM_INSIGHTS_THRESHOLDS.okScoreFrom &&
    totalTva >= TEAM_INSIGHTS_THRESHOLDS.negativeTvaBelow
  ) {
    return 'ok'
  }

  if (
    score < TEAM_INSIGHTS_THRESHOLDS.weakScoreBelow &&
    totalTva < TEAM_INSIGHTS_THRESHOLDS.negativeTvaBelow
  ) {
    return 'bad'
  }

  if (totalTva < TEAM_INSIGHTS_THRESHOLDS.negativeTvaBelow) {
    return 'weak'
  }

  return 'limited'
}

const getDiagnosisId = ({
  qualityLevel,
  riskLevel,
}) => {
  if (qualityLevel === 'noSample') return 'noSample'

  if (qualityLevel === 'strong' && riskLevel !== 'none') {
    return 'strongRisk'
  }

  if (qualityLevel === 'ok' && riskLevel !== 'none') {
    return 'okRisk'
  }

  if (qualityLevel === 'bad') return 'groupCollapse'
  if (qualityLevel === 'weak') return 'groupWeak'
  if (qualityLevel === 'limited' && riskLevel !== 'none') return 'limitedRisk'
  if (qualityLevel === 'limited') return 'limitedImpact'

  return 'stable'
}

const getLabel = id => {
  const labels = {
    noSample: 'אין מדגם',
    strongRisk: 'מקבץ חזק עם סיכון פנימי',
    okRisk: 'תקין עם שחקנים לבדיקה',
    limitedRisk: 'השפעה מוגבלת עם סיכון',
    groupCollapse: 'קריסת מקבץ',
    groupWeak: 'מקבץ פוגע בתפקוד',
    limitedImpact: 'השפעה מוגבלת',
    stable: 'מקבץ יציב',
  }

  return labels[id] || 'אבחנה'
}

const getText = ({
  id,
  weakCount,
  checked,
  totalTva,
  damageScore,
}) => {
  if (id === 'noSample') {
    return 'אין מספיק נתוני סקורינג כדי לאבחן את המקבץ.'
  }

  if (id === 'strongRisk') {
    return `המקבץ חזק במדד הכולל, אך ${weakCount}/${checked} שחקנים נמצאים מתחת לציפייה.`
  }

  if (id === 'okRisk') {
    return `המקבץ עומד בציפייה, אך ${weakCount}/${checked} שחקנים דורשים בדיקה.`
  }

  if (id === 'limitedRisk') {
    return `ההשפעה הכוללת מוגבלת ויש ${weakCount}/${checked} שחקנים מתחת לציפייה.`
  }

  if (id === 'groupCollapse') {
    return `המקבץ מייצר נזק משמעותי: נזק ${damageScore}, TVA ${totalTva}.`
  }

  if (id === 'groupWeak') {
    return 'המקבץ מתחת לציפייה ומשפיע שלילית על התפקוד הקבוצתי.'
  }

  if (id === 'limitedImpact') {
    return 'המקבץ מאוזן יחסית, אך לא מייצר השפעה חיובית מספקת.'
  }

  return 'המקבץ עומד בציפייה ללא סיכון משמעותי.'
}

export const buildTeamGroupDiagnosis = ({
  roleId,
  score,
  totalTva,
  weakCount,
  checked,
  damageScore,
} = {}) => {
  const qualityLevel = getQualityLevel({
    score,
    totalTva,
    checked,
  })

  const riskLevel = getRiskLevel({
    roleId,
    weakCount,
    damageScore,
  })

  const id = getDiagnosisId({
    qualityLevel,
    riskLevel,
  })

  const qualityTone = TEAM_QUALITY_TONES[qualityLevel] || 'neutral'
  const riskTone = TEAM_RISK_TONES[riskLevel] || 'neutral'

  return {
    id,
    label: getLabel(id),
    text: getText({
      id,
      weakCount,
      checked,
      totalTva,
      damageScore,
    }),

    color: riskTone,
    groupTone: riskTone,

    qualityTone,
    riskTone,

    qualityLevel,
    riskLevel,

    hasRisk: riskLevel !== 'none',

    reason: {
      score,
      totalTva,
      weakCount,
      checked,
      damageScore,
    },
  }
}
