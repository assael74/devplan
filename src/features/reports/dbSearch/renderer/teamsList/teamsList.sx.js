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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  filterControl: {
    minWidth: 140,
    flex: '1 1 140px',

    '& button': {
      borderColor: 'var(--db-search-tertiary)',
    },
  },

  searchInput: {
    minWidth: 180,
    flex: '1.4 1 180px',
    '--Input-focusedHighlight': 'var(--db-search-tertiary)',
  },

  localFilterNote: {
    color: 'var(--db-search-secondary)',
    marginInlineStart: 'auto',
    whiteSpace: 'nowrap',
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

  empty: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 220,
    p: 2,
  },
}
