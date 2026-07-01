// src/features/playersDatabase/components/leagues/page/players/sx/teamPlayers.sx.js

const palette = {
  ink: '#17202a',
  muted: '#64717f',
  line: '#d8e0e7',
  blue: '#2563eb',
}

export const delPlayersSx = {
  dialog: {
    width: 'min(720px, calc(100vw - 40px))',
    maxHeight: 'min(680px, calc(100dvh - 56px))',
    p: 2,
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto auto minmax(0, 1fr) auto',
    gap: 1.25,
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  summary: {
    width: 150,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    p: 1,
  },

  preview: {
    minHeight: 0,
    overflow: 'auto',
    borderRadius: '8px',

    '& th, & td': {
      fontSize: 12,
      whiteSpace: 'nowrap',
    },
  },

  confirm: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) 120px',
    },
    alignItems: 'center',
    gap: 0.75,

    '& .MuiInput-root': {
      minWidth: 0,
    },
  },

  footer: {
    borderTop: `1px solid ${palette.line}`,
    pt: 1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'minmax(0, 1fr) auto',
    },
    alignItems: 'center',
    gap: 1,
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,

    '& .MuiButton-root': {
      minHeight: 32,
      flexShrink: 0,
    },
  },
}

export const teamPlayersSx = {
  root: {
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: '30px auto minmax(0, 1fr)',
    gap: 0.35,
    p: 0,
    borderRadius: '8px',
    overflow: 'hidden',
  },

  actionBar: {
    minHeight: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 0.75,
    px: 0.25,

    '& .MuiButton-root': {
      minHeight: 26,
      fontSize: 12,
      fontWeight: 700,
    },
  },

  viewChip: {
    minHeight: 24,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  delBar: {
    minHeight: 42,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1,
    border: '1px solid #f2a3a3',
    borderRadius: '8px',
    bgcolor: '#fff1f1',
    color: '#7f1d1d',

    '& .MuiButton-root': {
      minHeight: 26,
      fontSize: 12,
      fontWeight: 700,
    },
  },

  delMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: 12,
    fontWeight: 700,
    ml: 'auto',
  },

  delCount: {
    px: 1,
    py: 0.35,
    borderRadius: 999,
    bgcolor: '#f5f7fa',
    color: palette.ink,
    fontSize: 12,
    fontWeight: 700,
  },

  spacer: {
    flex: 1,
  },

  tableWrap: {
    minHeight: 0,
    overflow: 'auto',
    borderRadius: '8px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',

    '&::-webkit-scrollbar': {
      width: 4,
      height: 4,
      backgroundColor: 'transparent',
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
      borderRadius: 999,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  },

  table: {
    minWidth: 1144,
    width: '100%',
    tableLayout: 'fixed',

    '& th, & td': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 12,
      px: 0.65,
    },

    '& th': {
      fontWeight: 700,
    },

    '& th:nth-of-type(1), & td:nth-of-type(1)': {
      textAlign: 'center',
    },

    '& td.serialCell': {
      boxSizing: 'border-box',
      paddingRight: '6px !important',
      paddingLeft: '6px !important',
      fontWeight: 700,
      color: '#0f172a',
    },

    '& th:nth-of-type(2), & td:nth-of-type(2)': {
      textAlign: 'right',
    },

    '& th:nth-of-type(3), & td:nth-of-type(3)': {
      textAlign: 'center',
    },

    '& th:nth-of-type(4), & td:nth-of-type(4)': {
      textAlign: 'center',
    },

    '& th:nth-of-type(5), & td:nth-of-type(5)': {
      textAlign: 'center',
    },

    '& th:nth-of-type(6), & td:nth-of-type(6)': {
      textAlign: 'right',
    },

    '& th:nth-of-type(7), & td:nth-of-type(7)': {
      textAlign: 'center',
    },

    '& th:nth-of-type(8), & td:nth-of-type(8)': {
      textAlign: 'center',
    },

    '& th:nth-of-type(n+9), & td:nth-of-type(n+9)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(1), &.isDeleteMode td:nth-of-type(1)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(2), &.isDeleteMode td:nth-of-type(2)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(3), &.isDeleteMode td:nth-of-type(3)': {
      textAlign: 'right',
    },

    '&.isDeleteMode th:nth-of-type(4), &.isDeleteMode td:nth-of-type(4)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(5), &.isDeleteMode td:nth-of-type(5)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(6), &.isDeleteMode td:nth-of-type(6)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(7), &.isDeleteMode td:nth-of-type(7)': {
      textAlign: 'right',
    },

    '&.isDeleteMode th:nth-of-type(8), &.isDeleteMode td:nth-of-type(8)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(9), &.isDeleteMode td:nth-of-type(9)': {
      textAlign: 'center',
    },

    '&.isDeleteMode th:nth-of-type(n+10), &.isDeleteMode td:nth-of-type(n+10)': {
      textAlign: 'center',
    },
  },

  emptyState: {
    minHeight: 88,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: 0.35,
    color: palette.muted,
    textAlign: 'center',
  },

  emptyTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: palette.ink,
  },

  emptySub: {
    maxWidth: 520,
    fontSize: 12,
    fontWeight: 600,
    color: palette.muted,
    whiteSpace: 'normal',
    lineHeight: 1.5,
  },

  loadFullRow: {
    minHeight: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    px: 1,
    borderTop: `1px solid ${palette.line}`,
    bgcolor: '#f8fafc',
  },

  loadFullText: {
    fontSize: 12,
    fontWeight: 700,
    color: palette.muted,
  },

  layerSelect: {
    width: 76,
    minHeight: 24,
    mx: 'auto',
    fontSize: 11,
    justifyContent: 'center',

    '& .MuiSelect-button': {
      justifyContent: 'center',
    },
  },

  positionSelect: {
    width: 88,
    minHeight: 24,
    mx: 'auto',
    fontSize: 11,
    justifyContent: 'center',

    '& .MuiSelect-button': {
      justifyContent: 'center',
    },
  },

  confirmButton: {
    width: 24,
    minWidth: 24,
    height: 22,
    minHeight: 22,
    borderRadius: '7px',
    mx: 'auto',
  },

  scoutChip: {
    maxWidth: '100%',
    minHeight: 20,
    mx: 'auto',
    fontSize: 11,
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  reliabilityChip: {
    maxWidth: '100%',
    minHeight: 20,
    mx: 'auto',
    fontSize: 11,
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  layerOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    fontSize: 12,
  },

  layerIcon: {
    width: 18,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    '& svg': {
      fontSize: 16,
    },
  },

}
