// features/playersDatabase/ui/pages/teamPage/sx/teamContent.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamContentSx = {
  contentGrid: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 270px',
    },
    gap: 1.25,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
      height: '100%',
    },
  },

  tableWrap: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    border: 0,
    borderRadius: 0,
  },

  playersTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',

    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& th[data-column="fullName"], & td[data-column="fullName"]': {
      textAlign: 'left',
    },
  },

  indexColumn: {
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    px: 0.5,
    textAlign: 'center',
  },

  avatarColumn: {
    width: 44,
    minWidth: 44,
    maxWidth: 44,
    px: 0.5,
    textAlign: 'center',
  },

  playerNameColumn: {
    width: '18%',
    textAlign: 'left !important',
  },

  playerNameHeader: {
    textAlign: 'left !important',
    pl: 1.5,
  },

  playerNameCell: {
    textAlign: 'left !important',
    pl: 1.5,
  },

  layerColumn: {
    width: 98,
    minWidth: 98,
    textAlign: 'center',
  },

  positionColumn: {
    width: 108,
    minWidth: 108,
    textAlign: 'center',
  },

  statColumn: {
    width: 54,
    textAlign: 'center',
  },

  minutesColumn: {
    width: 58,
    textAlign: 'center',
  },

  profileColumn: {
    width: '17%',
  },

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },

  profileTooltip: {
    minWidth: 190,
    display: 'grid',
    gap: 0.45,
    py: 0.25,
  },

  profileTooltipTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
  },

  profileTooltipMeta: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
  },

  profileTooltipItem: {
    position: 'relative',
    pl: 2.5,
    color: '#fff',
    fontSize: 11,

    '&::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0.5,
      top: '50%',
      width: 5,
      height: 5,
      borderRadius: '50%',
      bgcolor: devPlanColors.tertiary,
      transform: 'translateY(-50%)',
    },
  },

  profileTooltipList: {
    display: 'grid',
    gap: 0.75,
  },

  reliabilityColumn: {
    width: 76,
    textAlign: 'center',
  },

  priorityColumn: {
    width: 96,
    textAlign: 'center',
  },

  actionsColumn: {
    width: 82,
    textAlign: 'center',
  },

  roleChip: {
    minWidth: 74,
    maxWidth: '100%',
    justifyContent: 'center',
    px: 0.75,
    minHeight: 26,
    borderRadius: 7,
    cursor: 'pointer',
    color: devPlanColors.primaryDark,
    bgcolor: '#f1f6fb',
    border: '1px solid #d7e5f2',
    fontSize: 11,
    fontWeight: 600,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: '#9bc7e8',
    },
  },

  roleChipSelected: {
    color: devPlanColors.primaryDark,
    bgcolor: devPlanColors.tertiaryLight,
    borderColor: devPlanColors.tertiary,
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(47, 134, 199, 0.16)',

    '&:hover': {
      color: '#fff',
      bgcolor: devPlanColors.tertiary,
      borderColor: devPlanColors.tertiary,
    },
  },

  playerAvatar: {
    width: 28,
    height: 28,
    display: 'block',
    mx: 'auto',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },

  playersPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: '44px minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  playersHeader: {
    minWidth: 0,
    minHeight: 44,
    px: 1.25,
    py: 0.75,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #dbe5f4',
    bgcolor: '#fff',
  },

  panelTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  playersCount: {
    px: 1,
    py: 0.25,
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  rowActions: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 0.5,
  },

  tableIconButton: {
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
    p: 0,
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  tableButton: {
    minWidth: 0,
    minHeight: 28,
    maxWidth: '100%',
    px: 1,
    overflow: 'hidden',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primaryLight,
    bgcolor: '#fff',
    whiteSpace: 'nowrap',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  actionsPanel: {
    minWidth: 0,
    minHeight: 0,
    width: 250,
    maxWidth: '100%',
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'auto auto auto auto minmax(0, 1fr)',
    gap: 1,
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
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

  actionFiltersRow: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    justifyItems: 'stretch',
    gap: 0.75,
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
    border: `1px solid ${devPlanColors.primaryLight}`,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',

    '& .MuiChip-label': {
      flex: 1,
      textAlign: 'center',
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
    border: `1px solid ${devPlanColors.primary}`,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',

    '& .MuiChip-label': {
      flex: 1,
      textAlign: 'center',
    },

    '& .MuiChip-startDecorator': {
      marginInlineEnd: 0.5,
    },

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      borderColor: devPlanColors.primaryDark,
    },
  },

  actionFilterChipDisabled: {
    width: '100%',
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 8,
    color: devPlanColors.secondary,
    bgcolor: '#f5f7f9',
    border: '1px solid #dfe7ef',
    fontSize: 11,
    fontWeight: 700,
  },

  actionDivider: {
    my: 0.25,
    borderColor: '#dbe5f4',
  },

  primaryActionButton: {
    width: 'calc(100% - 10px)',
    minHeight: 36,
    px: 1.25,
    gap: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },

    '& .MuiButton-startDecorator': {
      marginInlineEnd: 0.5,
    },
  },

  secondaryActionButton: {
    width: 'calc(100% - 10px)',
    minHeight: 36,
    px: 1.25,
    gap: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },

    '& .MuiButton-startDecorator': {
      marginInlineEnd: 0.5,
    },
  },

  dangerActionButton: {
    width: 'calc(100% - 10px)',
    minHeight: 36,
    px: 1.25,
    gap: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    bgcolor: '#fff',
    color: '#9A1B1B',
    borderColor: '#F1B6B6',

    '&:hover': {
      bgcolor: '#FDECEC',
      borderColor: '#C92A2A',
    },

    '&.Mui-disabled': {
      color: '#9AA7B2',
      borderColor: '#DCE4EA',
      bgcolor: '#F7FAFC',
    },

    '& .MuiButton-startDecorator': {
      marginInlineEnd: 0.5,
    },
  },

  actionsList: {
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    alignItems: 'center',
    pr: 0,
  },

  actionItem: {
    display: 'grid',
    gap: 0.35,
  },

  actionDescription: {
    px: 0.5,
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1.25,
  }
}
