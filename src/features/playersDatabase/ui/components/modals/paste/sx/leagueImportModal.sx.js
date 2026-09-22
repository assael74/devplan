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
    maxWidth: 680,
    alignSelf: 'center',
    justifySelf: 'center',
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

}
