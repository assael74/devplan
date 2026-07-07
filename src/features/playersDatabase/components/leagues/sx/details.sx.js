// src/features/playersDatabase/components/leagues/sx/details.sx.js

const palette = {
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
}

export const detailsSx = {
  root: {
    height: '100%',
    minHeight: 0,
    mx: 0.35,
    mb: 0.35,
    p: 0.45,
    borderTop: `1px solid ${palette.line}`,
    bgcolor: '#f8fafc',
    borderBottom: `1px solid ${palette.line}`,
    display: 'grid',
    gridTemplateRows: '42px minmax(0, 1fr)',
    gap: 0.35,
    overflow: 'hidden',
  },

  profiles: {
    minHeight: 0,
    overflow: 'hidden',
  },

  header: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1,
  },

  title: {
    color: palette.ink,
    fontWeight: 700,
  },

  meta: {
    color: palette.muted,
    fontWeight: 700,
  },

  chipsRow: {
    minWidth: 0,
    height: 42,
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 32px',
    alignItems: 'center',
    gap: 0.75,
    overflow: 'hidden',
  },

  chips: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 1,
    alignItems: 'center',
    height: 42,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent',
    pb: 0.25,

    '&::-webkit-scrollbar': {
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

  profileChip: active => ({
    flex: '0 0 auto',
    width: 'auto',
    maxWidth: 240,
    minHeight: 28,
    px: 1,
    fontWeight: 700,
    cursor: 'pointer',
    opacity: 1,
    direction: 'rtl',
    flexDirection: 'row-reverse',
    border: active ? '1px solid rgba(21, 128, 61, 0.28)' : `1px solid ${palette.line}`,

    '& .MuiChip-startDecorator': {
      display: 'inline-flex',
      alignItems: 'center',
      color: active ? 'inherit' : palette.muted,
      opacity: 1,
    },

    '& .MuiChip-label': {
      direction: 'rtl',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }),

  chipsScrollButton: {
    width: 30,
    minWidth: 28,
    height: 24,
    borderRadius: '999px',
    opacity: 0.82,
    color: '#2563eb',
    bgcolor: '#eef6ff',
    border: '1px solid #bfdbfe',
    boxShadow: 'none',

    '&:hover': {
      opacity: 1,
      bgcolor: '#dbeafe',
    },
  },

  tooltip: {
    maxWidth: 320,
    textAlign: 'left',
    display: 'grid',
    gap: 0.5,
    p: 0.25,
  },

  tooltipTitle: {
    fontWeight: 700,
    color: palette.ink,
  },

  tooltipLine: {
    fontWeight: 700,
    color: palette.ink,
    lineHeight: 1.55,
  },
}
