// src/features/playersDatabase/ui/pages/teamPage/sx/teamActionsPanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamActionsPanelSx = {
  actionDivider: {
    my: 0.75,
    borderColor: '#dbe5f4',
  },

  actionsSection: {
    width: '100%',
    display: 'grid',
    gap: 0.65,
    p: 0.75,
    borderRadius: 9,
    bgcolor: '#f8fbff',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  sectionLabel: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 800,
  },

  tasksSection: {
    width: '100%',
    minHeight: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    gap: 0.5,
  },

  actionsRow: {
    width: '100%',
    display: 'grid',
    gap: 0.5,
  },

  primaryActionsRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 42px',
    gap: 0.5,

    '& button': {
      width: '100%',
      minWidth: 0,
    },
  },

  secondaryActionsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.5,

    '& button': {
      width: '100%',
      minWidth: 0,
    },
  },

  primaryActionButton: {
    minWidth: 0,
    px: 0.75,
    bgcolor: devPlanColors.primary,
    color: '#fff',
    fontSize: 11.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',

    '& .MuiButton-startDecorator': {
      flexShrink: 0,
    },

    '& svg': {
      color: '#fff',
    },

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },

    '&.Mui-disabled': {
      bgcolor: devPlanColors.secondaryLight,
      color: devPlanColors.secondary,

      '& svg': {
        color: devPlanColors.secondary,
      },
    },
  },

  secondaryIconButton: {
    color: devPlanColors.tertiaryDark,
    bgcolor: devPlanColors.tertiaryLight,
    borderColor: devPlanColors.tertiary,

    '&:hover': {
      bgcolor: '#dcebff',
      borderColor: devPlanColors.tertiaryDark,
    },
  },

  dangerIconButton: {
    color: '#9a1b1b',
    bgcolor: '#fff',
    borderColor: '#f1b6b6',

    '&:hover': {
      bgcolor: '#fff1f1',
      borderColor: '#d84a4a',
    },
  },
}
