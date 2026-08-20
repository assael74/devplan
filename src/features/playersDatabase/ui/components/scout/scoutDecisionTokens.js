// src/features/playersDatabase/ui/components/scout/scoutDecisionTokens.js

import { COLORS, devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const scoutDecisionTokens = {
  immediacy: {
    immediate: {
      bg: '#D8F0E1',
      border: '#4F9369',
      icon: '#145A35',
      text: '#12452D',
    },
    priority: {
      bg: '#E2F5E9',
      border: '#83C69B',
      icon: COLORS.status.success.solid,
      text: COLORS.status.success.text,
    },
    watch: {
      bg: COLORS.status.neutral.softBg,
      border: COLORS.status.neutral.solid,
      icon: devPlanColors.secondary,
      text: COLORS.status.neutral.text,
    },
    remove: {
      bg: COLORS.status.danger.softBg,
      border: '#E6B6BC',
      icon: COLORS.status.danger.solid,
      text: COLORS.status.danger.text,
    },
    unknown: {
      bg: devPlanColors.secondaryLight,
      border: devPlanColors.border,
      icon: devPlanColors.secondary,
      text: devPlanColors.primaryDark,
    },
  },

  profileStrength: {
    strong: {
      bg: '#E5F5EB',
      border: '#A7D4B8',
      icon: COLORS.status.success.solid,
      text: COLORS.status.success.text,
    },
    clear: {
      bg: COLORS.status.info.softBg,
      border: '#BFD6F6',
      icon: COLORS.status.info.solid,
      text: COLORS.status.info.text,
    },
    shallow: {
      bg: COLORS.status.warning.softBg,
      border: '#F3D89D',
      icon: COLORS.status.warning.solid,
      text: COLORS.status.warning.text,
    },
    neutral: {
      bg: COLORS.status.neutral.softBg,
      border: COLORS.status.neutral.solid,
      icon: devPlanColors.secondary,
      text: COLORS.status.neutral.text,
    },
  },
}

export function resolveProfileStrengthTone(depthPct) {
  const value = Number(depthPct)

  if (!Number.isFinite(value) || value <= 0) {
    return scoutDecisionTokens.profileStrength.neutral
  }

  if (value >= 50) return scoutDecisionTokens.profileStrength.strong
  if (value >= 20) return scoutDecisionTokens.profileStrength.clear
  return scoutDecisionTokens.profileStrength.shallow
}
