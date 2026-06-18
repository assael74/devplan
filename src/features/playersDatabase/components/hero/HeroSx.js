// src/features/playersDatabase/components/hero/hero.sx.js

export const heroSx = {
  root: {
    mb: 1,
    p: {
      xs: 1.25,
      md: 1.5,
    },
    borderRadius: '10px',
    bgcolor: '#24313f',
    color: '#fff',
    display: 'grid',
    gap: 1,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(18, 31, 45, 0.18)',
  },

  top: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    justifyContent: 'space-between',
    alignItems: {
      xs: 'stretch',
      md: 'flex-start',
    },
    gap: 1,
  },

  eyebrow: {
    color: '#9edbd4',
    fontWeight: 700,
    letterSpacing: 0,
    fontSize: 12,
  },

  title: {
    color: '#fff',
    fontWeight: 700,
    fontSize: {
      xs: 24,
      md: 30,
    },
    lineHeight: 1.15,
  },

  subtitle: {
    color: 'rgba(255, 255, 255, 0.74)',
    maxWidth: 760,
    lineHeight: 1.45,
    fontSize: 13,
    mt: 0.25,
  },

  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    justifyContent: {
      xs: 'stretch',
      md: 'flex-start',
    },
    alignItems: 'flex-start',

    '& button': {
      minWidth: {
        xs: 'calc(50% - 4px)',
        sm: 'auto',
      },
      minHeight: 36,
      px: 1.25,
      py: 0.5,
      borderRadius: '8px',
    },
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  kpi: {
    minHeight: 68,
    p: 1,
    borderRadius: '8px',
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },

  kpiLabel: {
    color: 'rgba(255, 255, 255, 0.68)',
    fontSize: 12,
  },

  kpiValue: {
    color: '#fff',
    fontSize: {
      xs: 20,
      md: 24,
    },
    fontWeight: 700,
    lineHeight: 1.1,
    mt: 0.35,
  },

  kpiNote: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: 11,
    mt: 0.35,
  },
}
