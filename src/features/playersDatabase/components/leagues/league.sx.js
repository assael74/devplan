const palette = {
  panel: '#ffffff',
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
  blue: '#2563eb',
  blueSoft: '#e8f1ff',
  green: '#15803d',
  red: '#b42318',
  redSoft: '#ffe9e7',
}

export const leagueSx = {
  board: {
    mb: 1.5,
    bgcolor: palette.panel,
    border: `1px solid ${palette.line}`,
    borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(22, 34, 51, 0.07)',
    overflow: 'hidden',
  },

  boardTop: {
    p: 1.5,
    borderBottom: `1px solid ${palette.line}`,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      lg: 'row',
    },
    justifyContent: 'space-between',
    alignItems: {
      xs: 'stretch',
      lg: 'center',
    },
    gap: 1.5,
  },

  title: {
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    mt: 0.25,
  },

  navControls: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    justifyContent: {
      xs: 'space-between',
      lg: 'flex-start',
    },
  },

  error: {
    mt: 1,
    mx: 1.5,
    p: 1,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },

  emptyState: {
    minHeight: {
      xs: 260,
      xl: 'calc(100vh - 330px)',
    },
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: 1,
    p: 3,
    textAlign: 'center',
    bgcolor: '#fbfcfd',
  },

  emptyTitle: {
    fontWeight: 700,
  },

  emptyText: {
    maxWidth: 520,
    color: palette.muted,
    lineHeight: 1.6,
  },

  stage: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '280px minmax(0, 1fr)',
    },
    minHeight: 0,
    p: 1,
    gap: 1,
    bgcolor: '#f6f8fa',
  },

  list: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0.5,
    maxHeight: {
      xs: 160,
      xl: 'calc(100vh - 292px)',
    },
    overflow: 'auto',
  },

  listItem: {
    justifyContent: 'flex-start',
    minHeight: 56,
    borderRadius: '8px',
    textAlign: 'left',
    whiteSpace: 'normal',
    border: '1px solid transparent',
    flex: '0 0 auto',

    '&.isSelected': {
      bgcolor: '#e8f1ff',
      color: palette.ink,
      borderColor: '#b8d3ff',
      boxShadow: 'none',
    },

    '&.isSelected *': {
      color: `${palette.ink} !important`,
    },

    '&.isSelected:hover': {
      bgcolor: '#dceaff',
    },

    '&.MuiButton-plain': {
      color: palette.ink,
    },

    '&.MuiButton-plain:hover': {
      bgcolor: '#f1f5f9',
    },
  },

  listText: {
    minWidth: 0,
    width: '100%',
  },

  listTitle: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  listMeta: {
    color: palette.muted,
    mt: 0.25,
  },

  tablePanel: {
    minWidth: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    bgcolor: '#ffffff',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: {
      xs: 460,
      xl: 'calc(100vh - 280px)',
    },
  },

  detailBody: {
    p: 1,
    bgcolor: '#f6f8fa',
    minHeight: {
      xs: 260,
      xl: 'calc(100vh - 300px)',
    },
  },

  managementGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) minmax(360px, 0.78fr)',
    },
    gap: 1,
    mb: 1,
  },

  managementWrap: {
    overflow: 'auto',
    minHeight: {
      xs: 410,
      xl: 'calc(100vh - 340px)',
    },
    p: 1,
    bgcolor: '#ffffff',
  },

  infoPanel: {
    bgcolor: '#ffffff',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 1.25,
    minWidth: 0,
  },

  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  },

  inlineActions: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  editGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  infoItem: {
    minHeight: 58,
    borderRadius: '8px',
    border: `1px solid ${palette.line}`,
    bgcolor: '#fbfcfd',
    p: 1,
    minWidth: 0,
  },

  infoLabel: {
    color: palette.muted,
    fontWeight: 700,
    mb: 0.45,
  },

  infoValue: {
    color: palette.ink,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  seasonList: {
    display: 'grid',
    gap: 0.75,
  },

  seasonItem: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) auto',
    },
    gap: 1,
    alignItems: 'center',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#fbfcfd',
    p: 1,
  },

  seasonItemActive: {
    bgcolor: palette.blueSoft,
    borderColor: '#b8d3ff',
  },

  seasonTitle: {
    fontWeight: 700,
  },

  seasonMeta: {
    color: palette.muted,
    mt: 0.25,
  },

  seasonStats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  addSeasonBox: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.2fr 1fr 1fr auto',
    },
    gap: 0.75,
    alignItems: 'center',
    mt: 1,
    pt: 1,
    borderTop: `1px solid ${palette.line}`,
  },

  inlineError: {
    mt: 1,
    p: 0.85,
    borderRadius: '8px',
    bgcolor: palette.redSoft,
    color: palette.red,
    fontWeight: 700,
  },

  metaBar: {
    p: 1.5,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'auto minmax(0, 1fr)',
    },
    gap: 1,
    alignItems: 'center',
    borderBottom: `1px solid ${palette.line}`,
  },

  sectionTitle: {
    fontWeight: 700,
  },

  leagueInfo: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: {
      xs: 'flex-start',
      lg: 'flex-end',
    },
    gap: 0.6,
  },

  birthChip: {
    fontWeight: 900,
    border: '1px solid #f4c36a',
  },

  chips: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',

    '& > .MuiChip-root': {
      display: 'none',
    },

    '& > div:nth-of-type(1)': {
      order: 1,
    },

    '& > div:nth-of-type(1) .MuiTypography-root:first-of-type': {
      display: 'none',
    },

    '& > .MuiButton-root': {
      order: 2,
    },

    '& > div:nth-of-type(2)': {
      order: 3,
    },

    '& > div:nth-of-type(3)': {
      order: 4,
    },
  },

  filterGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    p: 0.25,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',

    '& .MuiInput-root ~ .MuiButton-root': {
      display: 'none',
    },
  },

  filterLabel: {
    color: palette.muted,
    fontWeight: 700,
    fontSize: 10.5,
    px: 0.35,
  },

  filterBtn: {
    minHeight: 25,
    px: 0.8,
    fontSize: 11.5,
    fontWeight: 700,
  },

  resetBtn: {
    minWidth: 28,
    minHeight: 28,
    px: 0,
    order: 2,
  },

  filterInput: {
    width: 78,
    minHeight: 25,

    '& input': {
      py: 0.25,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 800,
    },
  },

  tableWrap: {
    overflow: 'auto',
    maxHeight: {
      xs: '70vh',
      xl: 'calc(100vh - 225px)',
    },
    minHeight: {
      xs: 410,
      xl: 'calc(100vh - 340px)',
    },
    p: 1,
    bgcolor: '#ffffff',
    position: 'relative',
  },

  table: {
    minWidth: 920,
    width: '100%',
    height: 'auto',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    overflow: 'clip',

    '& th, & td': {
      p: 1.15,
      borderBottom: `1px solid ${palette.line}`,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 13,
    },

    '& th': {
      bgcolor: '#0f1d4d',
      color: '#fff',
      fontWeight: 700,
      position: 'sticky',
      top: -1,
      zIndex: 2,
      boxShadow: `0 1px 0 ${palette.line}`,
    },

    '& th:nth-of-type(1), & td:nth-of-type(1)': {
      width: 54,
    },

    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      textAlign: 'left',
      width: 390,
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      width: 78,
    },

    '& th:nth-of-type(n+4), & td:nth-of-type(n+4)': {
      width: 62,
    },

    '& tbody tr:nth-of-type(even) td': {
      bgcolor: '#f6f8fa',
    },

    '& tbody tr.isExpanded td': {
      bgcolor: '#f8fbff',
      borderBottom: `3px solid ${palette.blue}`,
    },

    '& tbody tr.isPlaceholder td': {
      color: palette.muted,
    },

    '& tbody tr.isScoutDetails td': {
      p: 0,
      bgcolor: '#fbfcfd',
      whiteSpace: 'normal',
      overflow: 'visible',
      borderBottom: `2px solid ${palette.line}`,
    },

    '& tbody tr:first-of-type td': {
      borderTop: `2px solid ${palette.green}`,
    },

    '& td:first-of-type': {
      fontWeight: 700,
      color: '#0f1d4d',
    },
  },

  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  teamIcon: {
    width: 22,
    height: 22,
    borderRadius: '7px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    bgcolor: '#eef5ff',
    color: palette.blue,
    fontSize: 11,
    fontWeight: 700,
  },

  teamName: {
    minWidth: 0,
    flex: '1 1 auto',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  expandBtn: {
    minWidth: 26,
    minHeight: 26,
    px: 0,
    flex: '0 0 auto',
    fontWeight: 700,
  },

  narrativeMini: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 15,
    height: 15,
    borderRadius: '50%',
    bgcolor: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: 700,
    ml: 0.35,
  },

  narrativePanel: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '320px minmax(0, 1fr)',
    },
    gap: 0.55,
    p: 0.75,
    pt: 1,
    borderTop: `3px solid ${palette.blue}`,
    bgcolor: '#fbfcfd',
    boxShadow: 'inset 0 8px 0 rgba(15, 29, 77, 0.04)',
  },

  narrativeSummary: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '280px minmax(0, 1fr)',
    },
    gap: 0.75,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 0.75,
    minWidth: 0,
  },

  diagnosisPanel: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.5,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 0.6,
  },

  summaryMain: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 0.35,
  },

  summaryTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  narrativeIcon: {
    width: 24,
    height: 24,
    borderRadius: '7px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    bgcolor: '#ecfdf3',
    color: palette.green,
    fontSize: 11,
    fontWeight: 700,
  },

  narrativeLabel: {
    color: palette.muted,
    fontWeight: 700,
    mb: 0.35,
    fontSize: 11,
  },

  narrativeText: {
    color: palette.ink,
    fontWeight: 700,
    mb: 0.55,
    fontSize: 12,
  },

  narrativeChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.35,

    '& .MuiChip-root': {
      minHeight: 22,
      fontSize: 11,
    },
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 0.4,
  },

  metricList: {
    display: 'grid',
    gap: 0.25,
  },

  metricItem: {
    minHeight: 44,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#f8fafc',
    p: 0.55,
    minWidth: 0,
  },

  metricRow: {
    minHeight: 28,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.5,
    border: `1px solid ${palette.line}`,
    borderRadius: '7px',
    bgcolor: '#f8fafc',
    px: 0.55,
    py: 0.35,
    minWidth: 0,
  },

  metricNumbers: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: 0.35,
    minWidth: 0,
  },

  metricLabel: {
    color: palette.muted,
    fontWeight: 700,
    mb: 0.15,
    fontSize: 10.5,
  },

  metricValue: {
    color: palette.ink,
    fontWeight: 700,
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metricCompare: {
    color: palette.muted,
    fontSize: 10.5,
    fontWeight: 700,
    mt: 0.1,
  },

  searchList: {
    display: 'grid',
    gap: 0.3,
  },

  workList: {
    minWidth: 0,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 0.5,
  },

  searchBlock: {
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    p: 0.75,
    minWidth: 0,
  },

  searchHeader: {
    display: 'none',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.45,
  },

  searchHint: {
    color: palette.muted,
    fontSize: 10.5,
    fontWeight: 700,
  },

  searchItem: {
    minWidth: 0,
    minHeight: 42,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(260px, 1.05fr) minmax(280px, 1.25fr) 120px',
    },
    alignItems: 'center',
    gap: 0.55,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#f8fafc',
    p: 0.45,
  },

  searchProfile: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  searchProfileText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  searchText: {
    minWidth: 0,
  },

  searchTitle: {
    minWidth: 0,
    fontWeight: 700,
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  searchDesc: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 1.35,
    whiteSpace: 'normal',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  paramList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.3,

    '& .MuiChip-root': {
      minHeight: 21,
      fontSize: 10.5,
    },
  },

  interestCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    minWidth: 0,
  },

  hiddenTable: {
    display: 'none',
  },
}
