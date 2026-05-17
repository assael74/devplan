// TEAMPROFILE/sharedLogic/players/insightsLogic/viewModel/outcome/diagnosis.model.js

import {
  OUTCOME_THRESHOLDS,
} from './constants.js'

export const DIAGNOSIS_META = {
  systemCollapse: {
    label: 'קריסת מקבץ',
    color: 'danger',
    text: 'הרבה שחקנים במקבץ נמצאים מתחת לציפייה והנזק המצטבר גבוה.',
  },

  blackHole: {
    label: 'חור שחור',
    color: 'danger',
    text: 'מעט שחקנים מייצרים נזק גבוה ביחס למקבץ כולו.',
  },

  rotationFitness: {
    label: 'בעיית רוטציה / כושר',
    color: 'warning',
    text: 'יש מספר רחב של שחקנים מתחת לציפייה, אך הנזק המצטבר עדיין מוגבל.',
  },

  stable: {
    label: 'מקבץ יציב',
    color: 'success',
    text: 'רוחב הבעיה ועומק הנזק נמצאים בטווח סביר.',
  },

  noSample: {
    label: 'אין מדגם',
    color: 'neutral',
    text: 'אין מספיק נתוני ביצוע כדי לאבחן את המקבץ.',
  },
}

const getDiagnosisId = ({
  checked,
  weakRate,
  damageScore,
}) => {
  if (!checked) return 'noSample'

  const highWidth = weakRate >= OUTCOME_THRESHOLDS.highWeakRatePct
  const highDepth = damageScore >= OUTCOME_THRESHOLDS.highDamageScore

  if (highWidth && highDepth) return 'systemCollapse'
  if (!highWidth && highDepth) return 'blackHole'
  if (highWidth && !highDepth) return 'rotationFitness'

  return 'stable'
}

export const buildDiagnosis = ({
  checked,
  weakRate,
  damageScore,
}) => {
  const id = getDiagnosisId({
    checked,
    weakRate,
    damageScore,
  })

  const meta = DIAGNOSIS_META[id]

  return {
    id,
    label: meta.label,
    text: meta.text,
    color: meta.color,

    widthLevel:
      id === 'systemCollapse' || id === 'rotationFitness'
        ? 'high'
        : checked
          ? 'low'
          : 'none',

    depthLevel:
      id === 'systemCollapse' || id === 'blackHole'
        ? 'high'
        : checked
          ? 'low'
          : 'none',
  }
}
