import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { pageCoreLayoutSx } from '../../../components/page/sx/pageCoreLayout.sx.js'

export const clubsPageSx = {
  ...pageCoreLayoutSx,
  pageTitle: {
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 34,
      md: 44,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  headerActionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'center',
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

  panelContent: {
    flex: 1,
    minHeight: 0,
    p: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    bgcolor: '#F4F7FA',
  },

  filterChipGroup: {
    flexWrap: 'wrap',
    gap: 0.5,
    justifyContent: 'center',
  },

  filterChip: {
    '--Chip-minHeight': '28px',
    '--Chip-paddingInline': '8px',
    cursor: 'pointer',
    fontSize: 11,
  },

  clubLevelFilterChip: {
    '--Chip-minHeight': '26px',
    '--Chip-paddingInline': '8px',
    minWidth: 34,
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 800,

    '& .MuiChip-label': {
      width: '100%',
      textAlign: 'center',
    },
  },

  leaguePathFilterChip: {
    '--Chip-minHeight': '30px',
    '--Chip-paddingInline': '9px',
    width: 'fit-content',
    maxWidth: '100%',
    mx: 'auto',
    justifyContent: 'center',
    cursor: 'pointer',
    fontWeight: 700,
  },

  clubsMainColumn: {
    gridTemplateRows: 'minmax(0, 1fr)',
  },

  clubsPanel: {
    height: '100%',
    minHeight: 0,
  },

  tableWrap: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'auto',
    border: 0,
    borderRadius: 0,
  },

  table: {
    tableLayout: 'fixed',
    width: '100%',
    minWidth: 900,
    '& th': {
      bgcolor: '#F4F7FA',
      color: devPlanColors.secondary,
      fontSize: 11,
      fontWeight: 700,
      textAlign: 'right',
      whiteSpace: 'normal',
      borderBottom: `1px solid ${devPlanColors.border}`,
      verticalAlign: 'middle',
    },
    // The table inherits RTL direction, so visual right alignment is left in
    // the cell's CSS alignment context.
    '& th:nth-of-type(1), & th:nth-of-type(2)': {
      textAlign: 'left',
    },
    '& th:not(:first-of-type)': {
      textAlign: 'center',
    },
    '& td': {
      py: 1.05,
      textAlign: 'right',
      verticalAlign: 'middle',
      borderBottom: `1px solid ${devPlanColors.border}`,
    },
    '& th:nth-of-type(1)': {
      width: '21%',
    },
    '& th:nth-of-type(2)': {
      width: '12%',
    },
    '& th:nth-of-type(3)': {
      width: '7%',
      textAlign: 'center',
    },
    '& th:nth-of-type(4)': {
      width: '6%',
      textAlign: 'center',
    },
    '& th:nth-of-type(5), & th:nth-of-type(6)': {
      width: '11%',
      textAlign: 'center',
    },
    '& th:nth-of-type(7), & th:nth-of-type(8)': {
      width: '10%',
      textAlign: 'center',
    },
    '& th:nth-of-type(9)': {
      width: '6%',
      textAlign: 'center',
    },
    '& td:nth-of-type(n+3)': {
      textAlign: 'center',
    },
    '& td.ageGroupCell': {
      textAlign: 'left',
    },
    '& td.leagueLevelCell': {
      textAlign: 'center',
    },
    '& tbody tr:hover td': {
      bgcolor: '#F8FBFD',
    },
    '& tbody tr[data-club-start="true"] td': {
      borderTop: `7px solid ${devPlanColors.body}`,
    },
    '& tbody tr[data-club-start="true"]:first-of-type td': {
      borderTopWidth: 0,
    },
    '& tbody tr[data-club-start="true"] td:first-of-type': {
      bgcolor: '#FBFCFD',
    },
  },

  emptyClubRow: {
    color: devPlanColors.secondary,
  },

  teamIdentityRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
    whiteSpace: 'nowrap',
  },

  birthYearChip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 20,
    px: 0.7,
    borderRadius: 10,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 800,
  },

  leagueLevelChip: level => {
    const palette = {
      1: {
        bgcolor: '#1F6B45',
        color: '#FFFFFF',
      },
      2: {
        bgcolor: '#DDF1E5',
        color: '#28734E',
      },
      3: {
        bgcolor: '#FFF0DB',
        color: '#A95A00',
      },
      4: {
        bgcolor: '#FDE3E2',
        color: '#B42318',
      },
    }
    const tone = palette[Number(level)] || {
      bgcolor: devPlanColors.secondaryLight,
      color: devPlanColors.secondary,
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 27,
      minHeight: 22,
      px: 0.65,
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 800,
      ...tone,
    }
  },

  numeric: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 650,
    textAlign: 'center',
  },

  numericStrong: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 800,
    textAlign: 'center',
  },

  goalMetric: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.4,
    whiteSpace: 'nowrap',
  },

  goalTotal: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1,
  },

  goalRate: {
    color: devPlanColors.tertiaryDark,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
  },

  scoutCountActive: {
    minWidth: 30,
    height: 25,
    px: 0.75,
    mx: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    bgcolor: '#E8F4F4',
    color: '#1C6E73',
    fontSize: 12,
    fontWeight: 800,
  },

  scoutCountEmpty: {
    minWidth: 30,
    height: 25,
    px: 0.75,
    mx: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 700,
  },

  sideTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    alignSelf: 'stretch',
  },

  sideSubtitle: {
    mt: 0.25,
    color: devPlanColors.secondary,
    lineHeight: 1.5,
    alignSelf: 'stretch',
  },

  filterLabel: {
    mb: 0.45,
    color: devPlanColors.secondary,
    fontWeight: 700,
    alignSelf: 'stretch',
  },

  filterControl: {
    width: '100%',
    bgcolor: devPlanColors.surface,
  },

  sideSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  switchTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 650,
  },

  resetButton: {
    width: '86%',
    maxWidth: 220,
    mx: 'auto',
  },

  stateBox: {
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.75,
    color: devPlanColors.secondary,
  },

  collection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    p: 1.25,
  },

  collectionItem: {
    contentVisibility: 'auto',
    containIntrinsicSize: '74px',
    overflow: 'hidden',
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
    transition: 'box-shadow 180ms ease, border-color 180ms ease',
  },

  collectionItemOpen: {
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
    borderColor: devPlanColors.petrol,
    boxShadow: `0 8px 20px ${devPlanColors.primaryDark}40`,
  },

  collectionSummaryHeader: {
    p: 0.4,
  },

  collectionSummaryHeaderOpen: {
    position: 'sticky',
    top: 0,
    zIndex: 3,
    bgcolor: devPlanColors.petrolLight,
    borderBottom: `2px solid ${devPlanColors.petrol}`,
    boxShadow: `0 8px 12px -5px ${devPlanColors.primaryDark}99`,
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: 1,
      right: 0,
      bottom: -10,
      left: 0,
      height: 10,
      pointerEvents: 'none',
      background: `linear-gradient(to bottom, ${devPlanColors.primaryDark}33, transparent)`,
    },
  },

  collectionContent: {
    overflow: 'hidden',
  },

  summaryRow: {
    p: 0,
    display: 'flex',
    flex: '0 0 100%',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    gap: 0,
    alignItems: 'stretch',
    boxShadow: 'none',
    '& > *': {
      minWidth: 0,
      alignSelf: 'stretch',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },
    '& > :nth-of-type(1)': {
      flex: '0 0 25%',
      width: '25%',
      maxWidth: '25%',
    },
    '& > :nth-of-type(2)': {
      flex: '0 0 40%',
      width: '40%',
      maxWidth: '40%',
    },
    '& > :nth-of-type(n+3)': {
      flex: '0 0 10%',
      width: '10%',
      maxWidth: '10%',
    },
    '& > :nth-of-type(3), & > :nth-of-type(4)': {
      paddingInlineStart: 0,
    },
    '& > :nth-of-type(5)': {
      flex: '0 0 15%',
      width: '15%',
      maxWidth: '15%',
    },
    '& > * + *': {
      minHeight: 48,
      borderInlineStart: `1px solid ${devPlanColors.border}`,
      paddingInlineStart: 1.25,
    },
    '@media (max-width: 900px)': {
      flexWrap: 'wrap',
      '& > :nth-of-type(n)': {
        flex: '0 0 50%',
        maxWidth: '50%',
      },
      '& > * + *': {
        minHeight: 0,
        borderInlineStart: 0,
        paddingInlineStart: 0,
      },
    },
  },

  summaryHeader: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    pr: 1.25,
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    gap: 0,
    '& > :first-of-type': {
      flex: '1 1 auto',
      width: 'auto',
      minWidth: 0,
      maxWidth: 'none',
      overflow: 'hidden',
    },
    '& > :last-child': {
      flex: '0 0 auto',
      width: 'auto',
      minWidth: 0,
      maxWidth: 'none',
      overflow: 'hidden',
      justifyContent: 'center',
      gap: 0,
    },
  },

  summaryIdentity: {
    minWidth: 0,
  },

  summaryAreaBox: {
    minHeight: 42,
    display: 'grid',
    placeItems: 'center',
  },

  summaryAreaContentBox: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    '& > *': {
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      overflow: 'hidden',
    },
  },

  summaryClubAreaContentBox: {
    minHeight: 50,
    pb: 1,
    boxSizing: 'border-box',
  },

  summaryClubIdentityContent: {
    pl: 0.8,
    pr: 0.5,
    height: '100%',
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    '& > :first-of-type': {
      width: 36,
      height: 36,
    },
    '& [aria-label^="רמת מועדון"]': {
      left: -4,
      bottom: -4,
      minWidth: 18,
      height: 18,
      px: 0.25,
      pt: 0.2,
      borderRadius: 9,
      fontSize: 8,
    },
  },

  summaryLeaguePathContent: {
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      justifyContent: 'center',
    },
  },

  summaryAreaPlaceholder: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  summaryActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.5,
  },

  leaguePathMetric: {
    width: '100%',
    minWidth: 0,
    px: 0,
  },

  expanded: {
    mx: 0,
    mt: 0,
    height: 320,
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    p: 1.5,
    pt: 1.75,
    bgcolor: '#FBFCFD',
  },

  clubSeasonPicker: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  clubSeasonPickerChip: {
    minHeight: 28,
    fontWeight: 700,
  },

  seasonContent: {
    '& + &': {
      mt: 1,
      pt: 1,
      borderTop: `1px solid ${devPlanColors.border}`,
    },
  },

  expandedSeasonTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
  },

  expandedSeasonTitleGroup: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.65,
  },

  expandedSeasonHeader: {
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  expandedSeasonActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
  },

  expandedSeasonClubButton: {
    minHeight: 30,
    px: 0.9,
    fontSize: 12,
  },

  secondaryLeaguePath: {
    mt: 0.65,
  },

  secondaryLeaguePathButton: {
    px: 0,
    minHeight: 24,
    color: devPlanColors.tertiaryDark,
    fontSize: 11,
    fontWeight: 700,
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    },
  },

  secondaryLeaguePathContent: {
    mt: 0.45,
    px: 0.75,
    py: 0.55,
    borderInlineStart: `2px solid ${devPlanColors.border}`,
    bgcolor: '#F4F7FA',
  },

  teamTableSection: {
    '& + &': {
      mt: 1.25,
    },
  },

  teamTableTitle: {
    mt: 0.9,
    color: devPlanColors.primaryDark,
    fontWeight: 800,
  },

  expandedTableWrap: {
    height: 'auto',
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 8,
  },

  expandedTable: {
    mt: 0,
    '& th': {
      color: devPlanColors.secondary,
      fontSize: 10,
      textAlign: 'right',
    },
    '& td': {
      fontSize: 12,
      textAlign: 'center',
    },
    '& tbody tr:hover': {
      bgcolor: 'transparent !important',
    },
    '& tbody tr[data-full-width-message="true"] td, & tbody tr[data-full-width-message="true"]:hover td': {
      bgcolor: '#F1F3F5 !important',
    },
    '& tbody tr[data-full-width-message="true"] td > *': {
      fontSize: 9,
      textAlign: 'left',
    },
  },

  teamTableTeamColumn: {
    textAlign: 'right !important',
  },

  teamTableTeamHeader: {
    textAlign: 'left !important',
  },

  teamTableHeader: {
    textAlign: 'center !important',
  },

  teamTableLeagueColumn: {
  },

  teamTableNumericColumn: {
  },

  teamTablePriorityColumn: {
  },

  teamTableActionColumn: {
  },

  teamTableIdentity: {
    minWidth: 0,
    minHeight: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.55,
    cursor: 'pointer',
  },

  missingTeamTableIdentity: {
    cursor: 'default',
  },

  teamTableLogo: {
    flex: '0 0 auto',
    width: 25,
    height: 25,
    objectFit: 'contain',
    borderRadius: '50%',
  },

  teamTableBirthYear: {
    flex: '0 0 auto',
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 700,
  },

  expandedFooter: {
    mt: 1.1,
    display: 'flex',
    gap: 0.5,
    justifyContent: 'flex-start',
  },

  clubDocumentMenuButton: {
    minWidth: 20,
    minHeight: 20,
    p: 0,
  },
}
