// src/features/playersDatabase/components/hero/hero.sx.js

export const heroSx = {
  root: {
    mb: 0.5,
    p: {
      xs: 0.75,
      md: 0.85,
    },
    borderRadius: '8px',
    bgcolor: '#24313f',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 20px rgba(18, 31, 45, 0.12)',
  },

  top: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(280px, 1fr) auto',
    },
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 0.75,
  },

  eyebrow: {
    color: '#9edbd4',
    fontWeight: 700,
    letterSpacing: 0,
    fontSize: 11,
  },

  title: {
    color: '#fff',
    fontWeight: 700,
    fontSize: {
      xs: 20,
      md: 24,
    },
    lineHeight: 1.05,
  },

  kpiGrid: {
    display: 'flex',
    flexWrap: {
      xs: 'wrap',
      md: 'nowrap',
    },
    justifyContent: 'flex-start',
    gap: 0.4,
  },

  kpi: {
    minHeight: 38,
    width: {
      xs: 'calc(50% - 4px)',
      md: 136,
    },
    px: 0.8,
    py: 0.55,
    borderRadius: '7px',
    bgcolor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: 0.65,
    alignItems: 'center',
  },

  kpiText: {
    minWidth: 0,
  },

  kpiLabel: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 11,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  kpiValue: {
    color: '#fff',
    fontSize: {
      xs: 18,
      md: 20,
    },
    fontWeight: 700,
    lineHeight: 1,
  },

  kpiNote: {
    color: 'rgba(255, 255, 255, 0.54)',
    fontSize: 9.5,
    lineHeight: 1.05,
    mt: 0.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
