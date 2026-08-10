// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskLeagueFlow.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const workTaskLeagueFlowSx = {
  stepContent: {
      width: '100%',
      maxWidth: 620,
      mx: 'auto',
      px: {
        xs: 1.5,
        md: 2.5,
      },
      py: 1.5,
      display: 'grid',
      alignContent: 'start',
    },

  stepContentWide: {
      width: '100%',
      maxWidth: 820,
      mx: 'auto',
      px: {
        xs: 1.5,
        md: 2.5,
      },
      py: 1.35,
      display: 'grid',
      alignContent: 'start',
    },

  sectionTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  sectionCaption: {
      mt: 0.5,
      color: devPlanColors.secondary,
    },

  targetStickyHeader: {
      position: 'sticky',
      top: 0,
      zIndex: 3,
      mb: 1,
      pt: 0.2,
      pb: 0.7,
      bgcolor: devPlanColors.surface,
      borderBottom: `1px solid ${devPlanColors.border}`,
    },


  fieldWrap: {
      mt: 1.25,
      display: 'grid',
      gap: 0.5,
    },

  fieldLabel: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  select: {
      width: '100%',
      minHeight: 42,
    },

  routeGrid: {
      mt: 2,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: 'repeat(2, minmax(0, 1fr))',
      },
      gap: 1,
    },

  levelGrid: {
      mt: 2,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: 'repeat(2, minmax(0, 1fr))',
      },
      gap: 0.9,
    },

  reviewHeader: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: 'minmax(0, 1fr) 150px',
      },
      alignItems: 'end',
      gap: 1.25,
    },

  seasonFilter: {
      display: 'grid',
      gap: 0.35,
    },

  seasonSelect: {
      width: '100%',
      minHeight: 34,
    },

  leagueGrid: {
      mt: 1,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        md: 'repeat(3, minmax(0, 1fr))',
      },
      gap: 0.75,
    },

  selectedTaskPreview: {
      mt: 1.25,
      px: 1.25,
      py: 0.9,
      display: 'grid',
      gap: 0.2,
      border: `1px solid ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.tertiaryLight,
    },

  selectedTaskLabel: {
      color: devPlanColors.secondary,
    },

  selectedTaskTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  emptyState: {
      gridColumn: '1 / -1',
      minHeight: 110,
      p: 2,
      display: 'grid',
      placeItems: 'center',
      alignContent: 'center',
      border: `1px dashed ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.secondaryLight,
      textAlign: 'center',
    },

  emptyTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  emptyCaption: {
      mt: 0.25,
      color: devPlanColors.secondary,
    },

  leagueTaskChoiceGrid: {
      mt: 0.75,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(3, minmax(0, 1fr))',
      },
      gap: 0.75,
    },

  leagueTaskTypeCard: {
      minWidth: 0,
      minHeight: 74,
      px: 1,
      py: 0.8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 0.25,
      borderWidth: 1.5,
      borderColor: devPlanColors.border,
      borderRadius: 10,
      bgcolor: devPlanColors.surface,
      textAlign: 'left',
      '&:hover': {
        borderColor: devPlanColors.tertiary,
        bgcolor: devPlanColors.tertiaryLight,
      },
      '&.Mui-disabled': {
        opacity: 0.58,
        bgcolor: devPlanColors.secondaryLight,
      },
    },

  leagueTaskTypeCardSelected: {
      borderWidth: 2,
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      boxShadow: `0 0 0 1px ${devPlanColors.tertiaryDark}`,
    },


  taskTypeIcon: {
      width: 34,
      height: 34,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      flexShrink: 0,
      borderRadius: '50%',
    },

  taskTypeIconExists: {
      bgcolor: '#ECFDF5',
      color: '#16A34A',
    },

  taskTypeIconMissing: {
      bgcolor: '#FEF2F2',
      color: '#DC2626',
    },

  leagueTaskTypeTitle: {
      color: devPlanColors.primaryDark,
      fontSize: 15,
      fontWeight: 700,
    },

  leagueTaskTypeMeta: {
      color: devPlanColors.secondary,
    },

  teamNotFoundState: {
      mt: 1.25,
      minHeight: 170,
      px: 2,
      py: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.5,
      border: `1px dashed ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.secondaryLight,
      textAlign: 'center',
    },

  teamAppearanceGrid: {
      mt: 0.75,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      justifyContent: 'flex-start',
      gap: 0.75,
    },
}
