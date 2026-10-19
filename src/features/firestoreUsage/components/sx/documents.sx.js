// src/features/firestoreUsage/components/sx/documents.sx.js

export const documentsSx = {
  card: {
    p: 1.5,
    minWidth: 0,
    gap: 1,
    borderRadius: 'lg',
    boxShadow: 'sm',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
  },

  select: {
    minHeight: 28,
    fontSize: 11,
  },

  scroll: {
    minWidth: 0,
    maxHeight: 280,
    overflow: 'auto',
  },

  table: {
    width: '100%',
    tableLayout: 'fixed',
    fontSize: 11,
    '--TableCell-paddingX': '6px',
    '--TableCell-paddingY': '6px',

    '& th': {
      fontSize: 11,
      color: 'text.tertiary',
      overflowWrap: 'anywhere',
    },

    '& td': {
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    },

    '& td:first-of-type': {
      overflow: 'hidden',
    },

    '& td .MuiTypography-root': {
      fontSize: 11,
    },
  },
}
