// features/playersDatabase/ui/pages/playerPage/sx/playerContent.actions.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerContentActionsSx = {
  actionsPanel: {
    minWidth: 0,
    minHeight: 0,
    width: 250,
    maxWidth: '100%',
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'auto auto auto auto minmax(0, 1fr) auto',
    gap: 1,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  filtersBox: {
    display: 'grid',
    gap: 0.5,
  },

  filtersLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  filtersGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  filterSeasonSelect: {
    width: '100%',
    minHeight: 34,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    borderColor: '#b9d8ef',
    fontWeight: 700,
  },

  filterChip: {
    width: '100%',
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 8,
    color: devPlanColors.primary,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primaryLight}`,
    fontSize: 11,
  },

  filterChipActive: {
    width: '100%',
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 8,
    color: '#fff',
    bgcolor: devPlanColors.tertiary,
    border: `1px solid ${devPlanColors.tertiary}`,
    fontSize: 11,
  },

  actionDivider: {
    my: 0.25,
  },

  actionsList: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  actionPrimaryButton: {
    width: '100%',
    minHeight: 38,
    justifyContent: 'flex-start',
    gap: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  actionButton: {
    width: '100%',
    minHeight: 38,
    justifyContent: 'flex-start',
    gap: 0.75,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  placeholderNote: {
    color: devPlanColors.secondary,
    textAlign: 'center',
    lineHeight: 1.4,
  },
}
