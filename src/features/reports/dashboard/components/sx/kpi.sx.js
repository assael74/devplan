// src/features/reports/dashboard/components/sx/kpi.sx.js

export const kpiSx = {
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    overflow: 'hidden',
    bgcolor: 'background.body',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',

    '@media (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },

    '@media (max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },

  card: index => ({
    minWidth: 0,
    minHeight: 118,
    display: 'flex',
    flexDirection: 'column',
    px: 1.5,
    py: 1.25,
    borderInlineStart: index ? '1px solid' : 'none',
    borderColor: 'divider',

    '@media (max-width: 900px)': {
      borderInlineStart: index % 2 ? '1px solid' : 'none',
      borderTop: index > 1 ? '1px solid' : 'none',
      borderColor: 'divider',
    },

    '@media (max-width: 560px)': {
      minHeight: 104,
      borderInlineStart: 'none',
      borderTop: index ? '1px solid' : 'none',
    },
  }),

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  cardLabel: {
    fontWeight: 600,
    color: 'text.secondary',
  },

  cardIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'primary.600',
    bgcolor: 'primary.softBg',
    borderRadius: 'md',
  },

  cardValue: {
    m: 0,
    mt: 0.8,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  cardNote: {
    mt: 'auto',
    pt: 0.75,
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
