// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueActionsPanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueActionsPanelSx = {
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

  priorityFiltersRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.75,
  },

  sidePanelDivider: {
    my: 0.15,
    borderColor: devPlanColors.border,
  },

  actionsRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '3fr repeat(3, 0.75fr)',
    gap: 0.5,
    alignItems: 'stretch',
  },

  sideLoadButton: {
    minWidth: 0,
    minHeight: 38,
    px: 0.75,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,
    fontSize: 11.5,
    fontWeight: 700,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },

    '&.Mui-disabled': {
      bgcolor: devPlanColors.secondaryLight,
      color: devPlanColors.secondary,
    },
  },

  sideLinkButton: {
    width: '100%',
    minWidth: 0,
    minHeight: 38,
    color: devPlanColors.primary,
    bgcolor: '#fff',
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
  sideReportButton: {
    width: '100%',
    minWidth: 0,
    minHeight: 38,
    color: devPlanColors.tertiaryDark,
    bgcolor: devPlanColors.tertiaryLight,
    borderColor: devPlanColors.tertiary,

    '&:hover': {
      bgcolor: '#dcebff',
      borderColor: devPlanColors.tertiaryDark,
    },
  },

  sideDeleteButton: {
    width: '100%',
    minWidth: 0,
    minHeight: 38,
    color: '#9a1b1b',
    bgcolor: '#fff',
    borderColor: '#f1b6b6',

    '&:hover': {
      bgcolor: '#fff1f1',
      borderColor: '#d84a4a',
    },
  },

  taskSection: {
    minHeight: 0,
    flex: 1,
    mt: 0.25,
    pt: 1,
    borderTop: '2px solid #d6e2eb',
    overflow: 'hidden',
  },

}
