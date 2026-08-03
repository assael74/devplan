// src/features/reports/dbSearch/renderer/teamsList/teamsList.sx.js

export const teamsListSx = {
  root: ({ device = 'desktop' } = {}) => ({
    width: '100%',
    minWidth: 0,
    minHeight: '100%',
    px: device === 'mobile' ? 0 : 0.5,
  }),

  content: {
    display: 'grid',
    gap: 1.5,
    minWidth: 0,
  },

  filters: {
    p: 1.25,
    minWidth: 0,
    bgcolor: '#fff',
    borderColor: 'var(--db-search-primary-light)',
    borderRadius: 'md',
  },

  filtersRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 0.6,
    minWidth: 0,
    overflow: 'hidden',
  },

  filtersMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
    pt: 0.75,
  },

  filterControl: {
    minWidth: 104,
    flex: '1 1 104px',

    '& button': {
      borderColor: 'var(--db-search-tertiary)',
    },
  },

  searchInput: {
    minWidth: 150,
    flex: '1.3 1 150px',
    '--Input-focusedHighlight': 'var(--db-search-tertiary)',
  },

  localFilterNote: {
    color: 'var(--db-search-secondary)',
    marginInlineStart: 'auto',
    whiteSpace: 'nowrap',
    display: 'none',
  },

  sortIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 10,
    height: 10,
    ml: 0.35,
    fontSize: 8,
    lineHeight: 1,
    opacity: 0.82,
    verticalAlign: 'middle',
  },

  tableWrap: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    borderColor: 'var(--db-search-primary-light)',
    borderRadius: 'md',
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  table: ({ isPdf = false } = {}) => ({
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',

    '& thead th': {
      px: 0.75,
      bgcolor: 'var(--db-search-primary)',
      color: '#fff',
      borderColor: 'var(--db-search-primary-dark)',
      fontSize: isPdf ? 10 : 11,
      lineHeight: 1.15,
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      verticalAlign: 'middle',
    },

    '& tbody td': {
      px: 0.75,
      minWidth: 0,
      maxWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
    },

    '& th[data-align="center"], & td[data-align="center"]': {
      textAlign: 'center',
    },

    '& th[data-align="right"], & td[data-align="right"]': {
      textAlign: 'right',
    },

    '& th[data-align="left"], & td[data-align="left"]': {
      textAlign: 'left',
    },

    '& td[data-align="center"] > *': {
      marginInline: 'auto',
    },

    '& tbody tr:hover': {
      bgcolor: 'var(--db-search-tertiary-light)',
    },

    '& th[data-sortable="true"]': {
      cursor: 'pointer',
      userSelect: 'none',
    },
  }),

  teamCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.75,
    minWidth: 0,
    overflow: 'hidden',

    '& .MuiTypography-root': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  leagueCell: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    minWidth: 0,
    overflow: 'hidden',
  },

  clubLevelChip: {
    minWidth: 28,
    height: 18,
    px: 0.6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    bgcolor: '#F3F4F6',
    color: '#4B5563',
    fontSize: 10,
    fontWeight: 750,
    lineHeight: 1,
    letterSpacing: 0,
  },

  empty: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 220,
    p: 2,
  },
}
