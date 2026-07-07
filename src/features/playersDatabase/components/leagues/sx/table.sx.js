// src/features/playersDatabase/components/leagues/sx/table.sx.js

const palette = {
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
  blue: '#2563eb',
  green: '#15803d',
  blueSoft: '#eef6ff',
  blueLine: '#3b82f6',
}

export const tableSx = {
  wrap: {
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
    border: `1px solid ${palette.line}`,
    borderRadius: '0 0 8px 8px',
  },

  table: {
    minWidth: 1070,
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
      width: 330,
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      width: 78,
    },

    '& th:nth-of-type(4), & td:nth-of-type(4), & th:nth-of-type(5), & td:nth-of-type(5)': {
      width: 132,
    },

    '& th:nth-of-type(6), & td:nth-of-type(6), & th:nth-of-type(7), & td:nth-of-type(7)': {
      width: 92,
    },

    '& th:nth-of-type(8), & td:nth-of-type(8)': {
      width: 82,
    },

    '& th:nth-of-type(9), & td:nth-of-type(9)': {
      width: 170,
    },

    '& th:nth-of-type(10), & td:nth-of-type(10), & th:nth-of-type(11), & td:nth-of-type(11)': {
      width: 48,
      px: 0.45,
    },

    '& tbody tr:nth-of-type(even) td': {
      bgcolor: '#f6f8fa',
    },

    '& tbody tr.isExpanded td': {
      bgcolor: '#e8eef7',
      borderTop: `1px solid ${palette.line}`,
      borderBottom: `1px solid ${palette.line}`,
      boxShadow: 'none',
      fontWeight: 700,
    },

    '& tbody tr.isExpanded td:first-of-type': {
      boxShadow: 'none',
    },

    '& tbody tr.isExpanded + tr.isScoutDetails td': {
      bgcolor: '#ffffff',
      borderBottom: `1px solid ${palette.line}`,
    },

    '& tbody tr.isPlaceholder td': {
      color: palette.muted,
    },

    '& tbody tr.isScoutDetails td': {
      p: 0,
      bgcolor: '#ffffff',
      whiteSpace: 'normal',
      overflow: 'visible',
      borderBottom: 0,
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
    flex: '0 1 auto',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  teamNameLink: {
    color: palette.ink,
    textDecorationColor: palette.blue,

    '&:hover': {
      color: palette.blue,
    },
  },

  playersCountChip: {
    flex: '0 0 auto',
    minHeight: 20,
    fontSize: 10.5,
    fontWeight: 700,
    direction: 'rtl',
  },

  matchIcon: {
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

  teamIconBtn: slot => ({
    position: 'relative',
    width: 22,
    height: 22,
    border: 0,
    borderRadius: '7px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    bgcolor: slot > 1 ? '#fff4dc' : '#eef5ff',
    color: slot > 1 ? '#8a4b00' : palette.blue,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    p: 0,

    '&:hover': {
      bgcolor: slot > 1 ? '#ffe7b3' : '#dbeafe',
    },
  }),

  teamSlotBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 15,
    height: 15,
    px: 0.25,
    borderRadius: '999px',
    bgcolor: '#f59e0b',
    color: '#fff',
    border: '1px solid #fff',
    fontSize: 10,
    lineHeight: '13px',
    fontWeight: 700,
    textAlign: 'center',
  },

  matchCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  matchChip: {
    minWidth: 0,
    maxWidth: 150,
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  perfChip: {
    minWidth: 74,
    justifyContent: 'center',
    direction: 'ltr',
    unicodeBidi: 'isolate',
    fontWeight: 700,
  },

  expandBtn: {
    minWidth: 28,
    minHeight: 28,
    px: 0,
    flex: '0 0 auto',
    fontWeight: 700,
    borderRadius: '8px',
    bgcolor: '#f7fafc',
    border: `1px solid ${palette.line}`,

    '&:hover': {
      bgcolor: '#edf3f8',
    },
  },

  rowActionsBtn: {
    minWidth: 28,
    minHeight: 28,
    px: 0,
    flex: '0 0 auto',
    borderRadius: '8px',
    bgcolor: '#f7fafc',
    border: `1px solid ${palette.line}`,

    '&:hover': {
      bgcolor: '#edf3f8',
    },
  },

  edgeCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  toggleIcon: open => ({
    width: 22,
    height: 22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '6px',
    color: open ? '#0f1d4d' : palette.green,
    bgcolor: open ? '#ffffff' : '#e9f8ef',
    transform: 'none',
    transition: '160ms ease',
  }),

  collapse: open => ({
    height: open ? 380 : 0,
    overflow: 'hidden',
    transition: 'height 220ms ease',
    bgcolor: '#ffffff',
  }),

  collapseInner: {
    overflow: 'hidden',
    minHeight: 0,
    height: 380,
    px: 0.55,
    pb: 0.55,
    borderTop: `1px solid ${palette.line}`,
  },

  teamLinkDialog: {
    width: 'min(480px, calc(100vw - 40px))',
    p: 2,
    borderRadius: '10px',
    display: 'grid',
    gap: 1.25,
  },

  teamLinkHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  teamLinkMeta: {
    color: palette.muted,
    fontWeight: 700,
  },

  teamLinkIdentity: {
    minWidth: 0,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#f7fafc',
    px: 1,
    py: 0.75,
  },

  teamLinkLabel: {
    mb: 0.35,
    color: palette.muted,
    fontWeight: 700,
  },

  teamLinkValue: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
  },

  teamLinkError: {
    p: 0.75,
    borderRadius: '8px',
    bgcolor: '#ffe9e7',
    color: '#b42318',
    fontWeight: 700,
  },

  teamLinkActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 1,
  },
}
