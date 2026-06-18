// src/features/firestoreUsage/components/sx/expens.sx.js

export const expensSx = {
  card: {
    p: 2,
    borderRadius: 'lg',
    boxShadow: 'sm',
    minWidth: 0,
  },

  boxWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 2,
  },

  boxRows: {
    minHeight: 180,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
  },

  boxRowsCompact: {
    minHeight: 72,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    bgcolor: 'background.level1',
    borderRadius: 'md',
  },

  table: {
    minWidth: 920,
    '& th': {
      whiteSpace: 'nowrap',
      color: 'text.tertiary',
      fontSize: 12,
    },
    '& td': {
      whiteSpace: 'nowrap',
    },
  }
}
