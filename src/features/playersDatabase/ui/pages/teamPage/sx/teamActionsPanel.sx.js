// src/features/playersDatabase/ui/pages/teamPage/sx/teamActionsPanel.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamActionsPanelSx = {
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
    fontSize: 0,

    '&::before': {
      content: '"מעבר בין עונות"',
      fontSize: 12,
    },
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

  teamNavigationBox: {
    display: 'grid',
    gap: 0.5,
    p: 1,
    borderRadius: 8,
    bgcolor: devPlanColors.tertiaryLight,
    border: `1px solid ${devPlanColors.tertiary}`,
  },

  teamNavigationLabel: {
    color: devPlanColors.tertiary,
    fontWeight: 700,
  },

  teamNavigationControls: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 0,
    alignItems: 'center',

    '& > span': {
      display: 'none',
    },
  },

  teamNavigationButton: {
    display: 'none',
    minWidth: 34,
    minHeight: 34,
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    borderColor: '#b9d8ef',

    '&:hover': {
      bgcolor: '#dcebff',
      borderColor: devPlanColors.primary,
    },

    '&.Mui-disabled': {
      color: '#9aa8b7',
      bgcolor: '#f4f7fb',
      borderColor: '#dde6ef',
    },
  },

  teamNavigationSelect: {
    width: '100%',
    minWidth: 0,
    minHeight: 34,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    borderColor: '#b9d8ef',
    fontWeight: 700,
  },

  teamNavigationListbox: {
    maxHeight: 260,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${devPlanColors.tertiary} transparent`,

    '&::-webkit-scrollbar': {
      width: 6,
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      bgcolor: devPlanColors.tertiary,
    },
  },

  teamNavigationValue: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
    justifyItems: 'start',
    textAlign: 'left',
  },

  teamNavigationValuePrimary: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  teamNavigationValueSecondary: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  teamNavigationOption: {
    minHeight: 48,
    py: 0.6,
    alignItems: 'center',
  },

  teamNavigationOptionContent: {
    minWidth: 0,
    width: '100%',
    display: 'grid',
    gap: 0.2,
    justifyItems: 'start',
    textAlign: 'left',
  },

  teamNavigationOptionPrimary: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.2,
  },

  teamNavigationOptionSecondary: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 600,
    lineHeight: 1.2,
  },

  actionFiltersRow: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1.75fr)',
    justifyItems: 'stretch',
    gap: 0.75,
    p: 0.75,
    borderRadius: 8,
    bgcolor: '#f8fbff',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  actionFilterChip: {
    width: '100%',
    maxWidth: 'none',
    minHeight: 30,
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 8,
    color: devPlanColors.primary,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.primary}`,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    overflow: 'hidden',

    '& .MuiChip-label': {
      flex: 1,
      textAlign: 'center',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 0,

      '&::before': {
        content: '"רק פרופיל"',
        fontSize: 11,
      },
    },

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.5,
    },

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  actionFilterChipActive: {
    width: '100%',
    maxWidth: 'none',
    minHeight: 30,
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 8,
    color: '#fff',
    bgcolor: devPlanColors.primary,
    border: `1px solid ${devPlanColors.primaryDark}`,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    overflow: 'hidden',

    '& .MuiChip-label': {
      flex: 1,
      textAlign: 'center',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 0,

      '&::before': {
        content: '"רק פרופיל"',
        fontSize: 11,
      },
    },

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.5,
    },

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      borderColor: devPlanColors.primaryDark,
    },
  },

  profileFilterSelect: {
    width: '100%',
    minWidth: 0,
    minHeight: 30,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    border: `1px solid ${devPlanColors.primary}`,
    fontWeight: 700,

    '& .MuiSelect-indicator': {
      display: 'none',
    },
  },

  profileFilterValue: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 28px',
    gap: 0.5,
    alignItems: 'center',
  },

  profileFilterValuePrimary: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  profileFilterValueCount: {
    minWidth: 24,
    px: 0.5,
    borderRadius: 999,
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.5,
    textAlign: 'center',
    justifySelf: 'center',
  },

  profileFilterListbox: {
    width: 132,
    minWidth: '132px !important',
    maxWidth: 132,
    overflowX: 'hidden',
  },

  profileFilterOption: {
    minHeight: 38,
    py: 0.45,

    '&:hover': {
      bgcolor: '#eaf4ff',
    },

    '&[aria-selected="true"]': {
      bgcolor: '#dcecf8',
    },
  },

  profileFilterOptionContent: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 24px',
    gap: 0.6,
    alignItems: 'center',
  },

  profileFilterOptionLabel: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  profileFilterOptionCount: {
    width: 24,
    height: 24,
    minWidth: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primaryDark,
    bgcolor: '#dcecf8',
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    justifySelf: 'center',
  },

  actionDivider: {
    my: 0.15,
    borderColor: '#dbe5f4',
  },

  actionsRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.5,

    '& > :first-child': {
      gridColumn: '1 / -1',
    },

    '& > *': {
      minWidth: 0,
    },

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
