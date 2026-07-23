// features/playersDatabase/ui/pages/playerPage/sx/playerContent.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerContentSx = {
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

  historyPanel: {
    minWidth: 0,
    minHeight: 0,
    p: 0,
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    overflow: 'hidden',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',
  },

  historyHeader: {
    minWidth: 0,
    minHeight: 52,
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

  panelSubtitle: {
    mt: 0.15,
    color: devPlanColors.secondary,
  },

  rowsCount: {
    px: 1,
    py: 0.25,
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  placeholderBanner: {
    px: 1.25,
    py: 0.5,
    color: '#8a5a00',
    bgcolor: '#fff8e6',
    borderBottom: '1px solid #f0dfb5',
    fontSize: 11,
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

  historyTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',

    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& th[data-column="clubName"], & td[data-column="clubName"], & th[data-column="teamName"], & td[data-column="teamName"], & th[data-column="leagueName"], & td[data-column="leagueName"]': {
      textAlign: 'center',
    },
  },

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  seasonCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
  },

  currentSeasonChip: {
    minHeight: 22,
    px: 0.65,
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontSize: 10,
    fontWeight: 700,
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
