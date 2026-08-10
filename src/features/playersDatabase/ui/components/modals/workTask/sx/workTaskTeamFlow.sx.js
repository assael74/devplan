// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskTeamFlow.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const workTaskTeamFlowSx = {
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

  teamContextGrid: {
      mt: 1.5,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: 'repeat(2, minmax(0, 1fr))',
      },
      gap: 1.25,
    },

  fieldWrapCompact: {
      minWidth: 0,
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

  teamContextPreview: {
      mt: 1.5,
      px: 1.25,
      py: 0.9,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      border: `1px solid ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.primaryLight,
    },

  teamContextTitle: {
      color: devPlanColors.primaryDark,
      fontSize: 18,
      fontWeight: 700,
    },

  teamLookupContext: {
      px: 1.25,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 0.8,
      border: `1px solid ${devPlanColors.border}`,
      borderRadius: 10,
      bgcolor: devPlanColors.primaryLight,
    },

  teamLookupTitle: {
      minWidth: 0,
      flex: 1,
      color: devPlanColors.primaryDark,
      fontSize: 18,
      fontWeight: 700,
    },

  teamYearChip: {
      flex: '0 0 auto',
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiaryDark,
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

  emptyTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  emptyCaption: {
      mt: 0.25,
      color: devPlanColors.secondary,
    },

  selectedTaskLabel: {
      color: devPlanColors.secondary,
    },

  teamTaskSectionTitle: {
      mt: 1.25,
      color: devPlanColors.primaryDark,
      fontWeight: 700,
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

  teamAppearanceCard: {
      minWidth: 0,
      p: 0.8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0.65,
      borderColor: devPlanColors.border,
      borderRadius: 10,
      bgcolor: devPlanColors.surface,
      textAlign: 'left',
      '--Button-gap': '0px',
      '--Button-paddingInline': '0px',
      '&:hover': {
        borderColor: devPlanColors.tertiary,
        bgcolor: devPlanColors.tertiaryLight,
      },
      '&.Mui-disabled': {
        opacity: 0.55,
        borderColor: devPlanColors.border,
        bgcolor: devPlanColors.secondaryLight,
      },
    },

  teamAppearanceCardSelected: {
      borderWidth: 2,
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      boxShadow: `0 0 0 1px ${devPlanColors.tertiaryDark}`,
    },

  teamAppearanceLeague: {
      minWidth: 0,
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  teamAppearanceMeta: {
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.75,
    },

  teamAppearanceSeason: {
      color: devPlanColors.tertiaryDark,
      fontSize: 16,
      fontWeight: 700,
    },

  teamAppearanceLevel: {
      color: devPlanColors.secondary,
    },

  teamTaskChoiceWrap: {
      mt: 1,
    },

  teamTaskChoiceGrid: {
      mt: 0.75,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
      },
      gap: 0.75,
    },

  teamTaskChoice: {
      minHeight: 52,
      borderColor: devPlanColors.border,
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },

  teamTaskChoiceSelected: {
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiaryDark,
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

  selectedTaskTitle: {
      color: devPlanColors.primaryDark,
      fontWeight: 700,
    },
}
