// features/playersDatabase/ui/pages/sx/league.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const leagueSx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 1.5,
    },
    py: {
      xs: 1.5,
      md: 1,
    },
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: 2,
    overflow: 'hidden',
  },

  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(760px, 1fr) auto',
    },
    gap: 2,
    alignItems: 'end',
  },

  headerCopy: {
    minWidth: 0,
    width: '100%',
    gap: 0.75,
    alignItems: 'flex-start',
  },

  pageTitle: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 44,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  titleRow: {
    minWidth: 0,
    display: 'flex',
    flexWrap: {
      xs: 'wrap',
      md: 'nowrap',
    },
    alignItems: 'center',
    gap: 1,
    justifyContent: 'flex-start',
  },

  titleRegion: {
    color: devPlanColors.tertiary,
    mr: 2
  },

  titleChip: {
    minHeight: 28,
    px: 1.2,
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    borderRadius: 999,
    bgcolor: devPlanColors.primaryLight,
    border: `1px solid ${devPlanColors.primary}`,
    color: devPlanColors.primary,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  titleChips: {
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: 1,
    pt: 1
  },

  titleChipTertiary: {
    bgcolor: devPlanColors.tertiaryLight,
    borderColor: devPlanColors.tertiary,
    color: devPlanColors.tertiary,
  },

  pageDescription: {
    maxWidth: 760,
    color: devPlanColors.secondary,
    textAlign: 'left',
  },

  actionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  actions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  primaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    minHeight: 38,
    px: 2,
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1.25,

    '& > *': {
      minWidth: 0,
    },
  },

  summaryStatCard: {
    minWidth: 0,
    minHeight: 96,
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 0.75,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
    overflow: 'hidden',
  },

  leagueStateMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  leagueStateText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.4,
  },

  leagueStateTitle: {
    color: devPlanColors.secondary,
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.15,
  },

  leagueStateValue: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 700,
  },

  leagueStateIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
  },

  leagueStateDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 0.45,
  },

  leagueStateDetail: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.45,
    px: 0.55,
    py: 0.35,
    borderRadius: 7,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    overflow: 'hidden',
  },

  leagueStateDetailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  leagueStateDetailValue: {
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 700,
  },

  contentGrid: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 270px',
    },
    gap: 2,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
      height: '100%',
    },
  },

  rankColumn: {
    width: 62,
    minWidth: 58,
    maxWidth: 68,
  },

  rankBadge: {
    minWidth: 26,
    height: 24,
    px: 0.75,
    mx: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    bgcolor: '#edf4fd',
    border: '1px solid #cfe0f6',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1,
  },

  avatarColumn: {
    width: 42,
    minWidth: 38,
    maxWidth: 44,
  },

  teamAvatar: {
    width: 26,
    height: 26,
    mx: 'auto',
    display: 'block',
    objectFit: 'contain',
    borderRadius: '50%',
  },

  leagueTable: {
    '& th:first-of-type, & td:first-of-type': {
      textAlign: 'center',
      pr: 1,
      pl: 1,
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      textAlign: 'left',
      pr: 1.5,
      pl: 1.5,
    },
  },

  teamNameColumn: {
    width: '21%',
    minWidth: 126,
  },

  teamNameHeader: {
    textAlign: 'left',
  },

  teamNameCell: {
    textAlign: 'left',
  },

  compactTableColumn: {
    width: 72,
    minWidth: 58,
  },

  priorityColumn: {
    width: 94,
    minWidth: 78,
  },

  rosterProfilesColumn: {
    width: 92,
    minWidth: 84,
    whiteSpace: 'normal',
    lineHeight: 1.15,
  },

  rosterProfilesCell: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.35,
    px: 0.75,
    py: 0.35,
    borderRadius: 999,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    color: devPlanColors.primaryDark,
    lineHeight: 1,
  },

  rosterProfilesValue: {
    minWidth: 14,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  },

  rosterProfilesDivider: {
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1,
  },

  actionColumn: {
    width: 86,
    minWidth: 86,
    maxWidth: 90,
  },

  rowActions: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
    gap: 0.5,
    width: 70,
    minWidth: 70,
  },

  tableButton: {
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






