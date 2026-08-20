// src/features/playersDatabase/ui/pages/playerPage/sx/playerActionsPanel.sx.js

import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerActionsPanelSx = {
  recommendedBox: {
    display: 'grid',
    gap: 0.8,
    p: 0.9,
    borderRadius: 8,
    bgcolor: COLORS.status.success.softBg,
    border: `1px solid ${COLORS.status.success.solid}55`,
  },

  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  sectionIcon: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    bgcolor: COLORS.status.success.softBg,
    color: COLORS.status.success.text,
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  sectionSubtitle: {
    color: devPlanColors.secondary,
  },

  recommendedList: {
    display: 'grid',
    gap: 0.5,
  },

  primaryRecommendedButton: {
    justifyContent: 'flex-start',
    bgcolor: COLORS.status.success.text,
    color: '#fff',
    fontWeight: 700,

    '&:hover': {
      bgcolor: '#064E3B',
    },
  },

  secondaryRecommendedButton: {
    justifyContent: 'flex-start',
    color: COLORS.status.success.text,
    borderColor: `${COLORS.status.success.solid}88`,
    bgcolor: '#fff',
    fontWeight: 700,
  },

  emptyRecommended: {
    color: devPlanColors.secondary,
    lineHeight: 1.45,
  },

  divider: {
    my: 0.15,
    borderColor: devPlanColors.border,
  },

  editableBox: {
    display: 'grid',
    gap: 0.55,
    p: 0.8,
    borderRadius: 8,
    bgcolor: devPlanColors.tertiaryLight,
    border: `1px solid ${devPlanColors.border}`,
  },

  editableLabel: {
    color: devPlanColors.tertiaryDark,
    fontWeight: 700,
  },

  editableText: {
    color: devPlanColors.secondary,
    lineHeight: 1.45,
  },

  actionList: {
    display: 'grid',
    gap: 0.25,
  },

  actionButton: {
    justifyContent: 'flex-start',
    color: devPlanColors.primary,
    fontWeight: 700,
  },
}
