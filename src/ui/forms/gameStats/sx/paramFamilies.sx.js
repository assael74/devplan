// src/ui/forms/gameStats/sx/paramFamilies.sx.js

import { alpha } from '@mui/system'
import { COLORS, devPlanColors } from '../../../core/theme/Colors.js'

const families = {
  passes: 'passing',
  progressivePasses: 'progression',
  keyPasses: 'keyPassing',
  crosses: 'crossing',
  dribbles: 'control',
  foulsDrawn: 'control',
  shots: 'finishing',
  xG: 'finishing',
  tackles: 'defending',
  keyTackles: 'defending',
  interceptions: 'defending',
  personalPressures: 'defending',
  ballClearances: 'defending',
}

function createTone(color, tint) {
  return {
    bg: alpha(color, tint),
    selectedBg: alpha(color, tint + 0.015),
    hoverBg: alpha(color, tint + 0.03),
    border: alpha(color, 0.16),
    selectedBorder: alpha(color, 0.3),
    text: devPlanColors.text,
  }
}

const tones = {
  passing: createTone(devPlanColors.tertiary, 0.035),
  progression: createTone(devPlanColors.tertiary, 0.05),
  keyPassing: createTone(devPlanColors.tertiary, 0.065),
  crossing: createTone(devPlanColors.tertiary, 0.045),
  control: createTone(devPlanColors.petrol, 0.035),
  finishing: createTone(COLORS.status.warning.solid, 0.035),
  defending: createTone(COLORS.status.success.solid, 0.035),
  general: createTone(devPlanColors.secondary, 0.025),
}

export function getParamFamilyTone(group) {
  return tones[families[group] || 'general']
}
