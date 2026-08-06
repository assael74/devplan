// features/playersDatabase/ui/pages/leaguePage/sx/leagueContent.actions.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueContentActionsSx = {
  insightsPanel: {
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
    },

  insightsList: {
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      pr: 0.5,
    },

  actionSelectorsRow: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: 0.75,
    },

  actionSeasonBox: {
      display: 'grid',
      gap: 0.5,
      p: 1,
      borderRadius: 8,
      bgcolor: devPlanColors.tertiaryLight,
      border: `1px solid ${devPlanColors.tertiary}`,
    },

  actionSeasonLabel: {
      color: devPlanColors.tertiary,
      fontWeight: 700,
    },

  actionSeasonSelect: {
      width: '100%',
      minHeight: 34,
      bgcolor: '#fff',
      color: devPlanColors.primaryDark,
      borderColor: '#b9d8ef',
      fontWeight: 700,
    },

  actionSeasonValue: {
      minWidth: 0,
      width: '100%',
      display: 'grid',
      gap: 0.15,
      justifyItems: 'start',
      textAlign: 'left',
    },

  actionSeasonValuePrimary: {
      minWidth: 0,
      color: devPlanColors.primaryDark,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

  actionSeasonValueSecondary: {
      minWidth: 0,
      color: devPlanColors.secondary,
      fontSize: 10,
      fontWeight: 500,
      lineHeight: 1.15,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

  actionSeasonOption: {
      minHeight: 52,
      py: 0.75,
      alignItems: 'center',
    },

  actionSeasonOptionContent: {
      minWidth: 0,
      width: '100%',
      display: 'grid',
      gap: 0.25,
      justifyItems: 'start',
      textAlign: 'left',
    },

  actionSeasonOptionPrimary: {
      color: devPlanColors.primaryDark,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.25,
    },

  actionSeasonOptionSecondary: {
      color: devPlanColors.secondary,
      fontSize: 10.5,
      fontWeight: 500,
      lineHeight: 1.2,
    },

  performanceMetricBox: {
      display: 'grid',
      gap: 0.65,
      p: 1,
      borderRadius: 8,
      bgcolor: '#f7fbfe',
      border: '1px solid #cfe0ec',
    },

  performanceMetricLabel: {
      color: devPlanColors.primary,
      fontWeight: 700,
    },

  performanceMetricOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 0.5,
    },

  performanceMetricButton: selected => ({
      minWidth: 0,
      minHeight: 32,
      px: 0.6,
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: 'normal',
      lineHeight: 1.15,
      color: selected ? '#fff' : devPlanColors.primary,
      bgcolor: selected ? devPlanColors.primary : '#fff',
      borderColor: selected ? devPlanColors.primary : '#b9d8ef',

      '&:hover': {
        bgcolor: selected ? devPlanColors.primaryDark : devPlanColors.tertiaryLight,
        borderColor: selected ? devPlanColors.primaryDark : devPlanColors.tertiary,
      },
    }),

  priorityFiltersRow: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 0.75,
    },

  sidePanelDivider: {
      my: 0.25,
      borderColor: '#dbe5f4',
    },

  sideLoadButton: {
      width: '100%',
      minHeight: 42,
      justifyContent: 'flex-start',
      px: 1.5,
      bgcolor: devPlanColors.primary,
      color: '#fff',

      '& .MuiButton-startDecorator': {
        mr: 0.75,
      },

      '&:hover': {
        bgcolor: devPlanColors.primaryDark,
      },
    },

  sideReportButton: {
      width: '100%',
      minHeight: 42,
      justifyContent: 'flex-start',
      px: 1.5,
      bgcolor: '#eef7ff',
      color: '#0b5cad',
      borderColor: '#8ec5ff',

      '& .MuiButton-startDecorator': {
        mr: 0.75,
      },

      '&:hover': {
        bgcolor: '#dcebff',
        borderColor: '#4f9cea',
      },
    },

  sideDeleteButton: {
      width: '100%',
      minHeight: 42,
      justifyContent: 'flex-start',
      px: 1.5,
      bgcolor: '#fff',
      color: '#9a1b1b',
      borderColor: '#f1b6b6',

      '& .MuiButton-startDecorator': {
        mr: 0.75,
      },

      '&:hover': {
        bgcolor: '#fff1f1',
        borderColor: '#d84a4a',
      },
    },
}
