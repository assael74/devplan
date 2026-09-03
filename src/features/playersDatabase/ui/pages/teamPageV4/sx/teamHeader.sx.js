// src/features/playersDatabase/ui/pages/teamPage/sx/teamHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamHeaderSx = {
  pageTitle: {
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 44,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
  },

  teamLogo: {
    width: 42,
    height: 42,
    flex: '0 0 auto',
    objectFit: 'contain',
    border: `1px solid ${devPlanColors.primary}`,
    borderRadius: '50%',
    p: 0.25,
  },

  contextChip: {
    minHeight: 34,
    px: 1.4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  birthYearChip: {
    bgcolor: devPlanColors.tertiary,
    color: '#fff',
    borderColor: devPlanColors.primary,
    fontSize: 15,
    boxShadow: '0 6px 16px rgba(47, 134, 199, 0.20)',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  headerActionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  primaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
