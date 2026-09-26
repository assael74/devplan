import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const leagueImportModalSx = {
  seasonStatusField: {
    width: '100%',
    alignSelf: 'start',
    p: {
      xs: 1,
      md: 1.5,
    },
  },

  stepTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  stepDescription: {
    mt: 0.5,
    color: devPlanColors.secondary,
  },

  seasonStatusGroup: {
    mt: 1.25,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1,
  },

  seasonStatusOptionSelected: {
    boxShadow: '0 8px 18px rgba(16, 43, 64, 0.16)',
  },

  syncPanel: {
    width: '100%',
    maxWidth: 760,
    p: {
      xs: 2,
      md: 3,
    },
    display: 'grid',
    gap: 1.5,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 14,
    bgcolor: devPlanColors.surface,
    boxShadow: '0 8px 22px rgba(16, 43, 64, 0.08)',
  },

  syncStepArea: {
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'start',
    px: {
      xs: 0,
      md: 1,
    },
    pb: 1,
  },

  syncHeading: {
    display: 'grid',
    gap: 0.45,
  },

  syncDescription: {
    color: devPlanColors.secondary,
  },

  syncScope: {
    display: 'grid',
    gap: 0.5,
  },

  syncScopeHint: {
    color: devPlanColors.secondary,
  },

  syncError: {
    p: 1,
    borderRadius: 8,
    bgcolor: 'rgba(198, 40, 40, 0.08)',
  },

  syncRetryButton: {
    justifySelf: 'start',
  },

  syncHeader: {
    display: 'grid',
    gap: 0.5,
  },

  syncTitle: {
    color: devPlanColors.primaryDark,
  },

  syncStep: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    gap: 1.25,
    alignItems: 'center',
    p: 1.25,
    borderRadius: 10,
    bgcolor: devPlanColors.secondaryLight,
  },

  syncStepNumber: {
    width: 32,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    bgcolor: devPlanColors.surface,
    color: devPlanColors.primary,
    fontWeight: 700,
    border: `1px solid ${devPlanColors.border}`,
  },

  syncStepContent: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
  },

  syncComplete: {
    p: 1.5,
    display: 'grid',
    gap: 0.35,
    borderRadius: 10,
    bgcolor: devPlanColors.secondaryLight,
  },

  structuralReview: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 1.5,
    alignItems: 'center',
    p: 1.5,
    borderRadius: 10,
    bgcolor: devPlanColors.secondaryLight,
    border: `1px solid ${devPlanColors.border}`,
  },

  structuralReviewContent: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
  },

}