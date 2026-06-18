// src/features/firestoreUsage/components/sx/kpi.sx.js

export const kpiSx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
      xl: 'repeat(6, minmax(0, 1fr))',
    },
    gap: 1,
  },

  card: color => ({
    minWidth: 0,
    minHeight: 96,
    p: 1.5,
    borderRadius: 'lg',
    boxShadow: 'sm',
    position: 'relative',
    overflow: 'hidden',

    '&::after': {
      content: '""',
      position: 'absolute',
      width: 72,
      height: 72,
      borderRadius: '50%',
      top: -28,
      right: -28,
      bgcolor: `${color}.softBg`,
      opacity: 0.75,
    },
  }),

  cardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  value: {
    direction: 'ltr',
    textAlign: 'left',
    fontWeight: 900,
    lineHeight: 1,
    fontSize: {
      xs: 28,
      md: 30,
    },
  },

  valueRow: {
    mt: 'auto',
    pt: 1.25,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 1,
  },

  statusChip: {
    order: 2,
    flexShrink: 0,
    mb: 0.25,
    fontWeight: 700,
  },
}
