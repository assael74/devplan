// src/features/playersDatabase/ui/components/modals/paste/sx/leagueImportModal.sx.js

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
    height: 'auto',
    flex: '0 0 auto',
    minHeight: '100%',
    boxSizing: 'border-box',
    maxWidth: 'none',
    p: {
      xs: 2,
      md: 3,
    },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 14,
    bgcolor: devPlanColors.surface,
    boxShadow: '0 8px 22px rgba(16, 43, 64, 0.08)',
  },

  syncStepArea: {
    height: '100%',
    flex: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarGutter: 'stable',
    display: 'flex',
    flexDirection: 'column',
    px: {
      xs: 0,
      md: 1,
    },
    pb: 0,
  },

  syncContent: {
    display: 'flex',
    flexDirection: 'column',
  },

  syncHeading: {
    display: 'grid',
    gap: 0.45,
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

  syncProgress: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    gap: 1.25,
    alignItems: 'center',
    p: 1.5,
    minHeight: 64,
    boxSizing: 'border-box',
    flexShrink: 0,
    mt: 'auto',
    borderRadius: 10,
    bgcolor: devPlanColors.secondaryLight,
  },

  syncStatusNotice: {
    mt: 'auto',
    p: 1.5,
    minHeight: 64,
    boxSizing: 'border-box',
    flexShrink: 0,
  },

  syncStatusContent: {
    width: '100%',
    minWidth: 0,
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
