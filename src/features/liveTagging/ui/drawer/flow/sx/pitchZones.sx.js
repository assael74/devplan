// src/features/liveTagging/ui/drawer/flow/sx/pitchZones.sx.js

const rowBg = [
  'rgba(255,255,255,0.16)',
  'rgba(255,255,255,0.20)',
  'rgba(255,255,255,0.24)',
  'rgba(255,255,255,0.28)',
  'rgba(255,255,255,0.32)',
  'rgba(255,255,255,0.36)',
]

export const pitchZonesSx = {
  pitchWrap: {
    bgcolor: '#14532d',
    border: '1px solid',
    borderColor: '#3fa65b',
    borderRadius: 'xl',
    p: 1,
    display: 'grid',
    gap: 0.75,
    boxShadow: 'md',
    backgroundImage:
      'linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  },

  pitchEdgeLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: 700,
  },

  pitchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.65,
  },

  zoneButton: ({ side, rowIndex }) => ({
    minHeight: {
      xs: 58,
      sm: 68,
    },
    borderRadius: 'md',
    border: '1px solid',
    borderColor:
      side === 'negative'
        ? 'rgba(248,113,113,0.75)'
        : 'rgba(134,239,172,0.75)',
    bgcolor: rowBg[rowIndex] || rowBg[0],
    color: 'common.white',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.16)',

    '&:hover': {
      bgcolor:
        side === 'negative'
          ? 'rgba(211,47,47,0.55)'
          : 'rgba(46,125,50,0.62)',
      borderColor: 'rgba(255,255,255,0.78)',
    },

    '&:active': {
      transform: 'scale(0.98)',
    },
  }),

  zoneNumber: {
    fontWeight: 700,
    color: 'common.white',
    fontSize: {
      xs: 20,
      sm: 24,
    },
  },
}
