import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerScoutingLevelsModalSx = {
  trigger: {
    width: 24,
    minWidth: 24,
    height: 24,
    minHeight: 24,
    p: 0.35,
    color: devPlanColors.secondary,
    bgcolor: devPlanColors.secondaryLight,
    '&:hover': {
      color: devPlanColors.primary,
      bgcolor: devPlanColors.primaryLight,
    },
  },

  content: {
    display: 'grid',
    gap: 1.25,
  },

  section: {
    display: 'grid',
    gap: 0.7,
    p: 1,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 800,
  },

  sectionDescription: {
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1.4,
  },

  levels: {
    display: 'grid',
    gap: 0.45,
  },

  level: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.8,
    py: 0.55,
    borderRadius: 7,
    bgcolor: devPlanColors.secondaryLight,
  },

  levelMain: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  levelIcon: { display: 'inline-flex', flexShrink: 0, color: 'inherit', '& svg': { fontSize: 15, color: 'inherit' } },
  levelLabel: {
    color: 'inherit',
    fontSize: 12,
    fontWeight: 800,
  },

  levelThreshold: {
    color: 'inherit',
    opacity: 0.78,
    fontSize: 11.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  immediate: {
    color: COLORS.status.danger.text,
    bgcolor: COLORS.status.danger.softBg,
  },

  priority: {
    color: COLORS.status.warning.text,
    bgcolor: COLORS.status.warning.softBg,
  },

  watch: {
    color: COLORS.entity.domain.base.subText,
    bgcolor: COLORS.entity.domain.disabled.bg,
  },

  reasonable: {
    color: COLORS.entity.domain.base.subText,
    bgcolor: COLORS.entity.domain.disabled.bg,
  },

  curious: {
    color: COLORS.status.warning.text,
    bgcolor: COLORS.status.warning.softBg,
  },

  interesting: {
    color: devPlanColors.tertiaryDark,
    bgcolor: devPlanColors.tertiaryLight,
  },

  superInteresting: {
    color: devPlanColors.petrolDark,
    bgcolor: devPlanColors.petrolLight,
  },

  note: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1.4,
  },

  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
  },

  sectionHeadingIcon: { color: devPlanColors.primary, display: 'inline-flex', '& svg': { fontSize: 16 } },
}
