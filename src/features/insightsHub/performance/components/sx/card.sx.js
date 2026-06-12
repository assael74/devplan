// features/insightsHub/performance/components/sx/card.sx.js

const highlightColors = {
  danger: {
    color: '#B42318',
  },

  warning: {
    color: '#B54708',
  },

  team: {
    color: '#175CD3',
  },

  player: {
    color: '#6941C6',
  },

  role: {
    color: '#027A48',
  },

  position: {
    color: '#C11574',
  },

  rating: {
    color: '#0B5CAD',
  },

  impact: {
    color: '#E11D48',
  },

  success: {
    color: '#027A48',
  },

  profile: {
    color: '#3538CD',
  },

  tablePosition: {
    color: '#C2410C',
  },

  numericTargets: {
    color: '#0F766E',
  },

  question: {
    color: '#7C3AED',
  },

  anchor: {
    color: '#111827',
  },

  delta: {
    color: '#BE123C',
  },

  numericTargetsStrong: {
    color: '#0F766E',
    fontStyle: 'italic',
    bgcolor: 'rgba(15, 118, 110, 0.10)',
    borderRadius: 8,
    px: 0.6,
  },

  playerTargetsStrong: {
    fontStyle: 'italic',
    bgcolor: 'rgba(15, 118, 110, 0.10)',
    borderRadius: 8,
    px: 0.6,
  },

  successStrong: {
    fontStyle: 'italic',
    bgcolor: 'rgba(15, 118, 110, 0.24)',
    borderRadius: 8,
    px: 0.6,
  },

  dangerStrong: {
    fontStyle: 'italic',
    bgcolor: 'rgba(180, 35, 24, 0.18)',
    borderRadius: 8,
    px: 0.6,
  },
}

export const cardSx = {
  stepWrap: {
    minHeight: { xs: 'calc(100dvh - 220px)', md: 'calc(100dvh - 240px)' },
    display: 'grid',
    alignItems: 'center',
    scrollMarginTop: 0,
  },

  card: {
    position: 'relative',
    maxHeight: 'calc(100dvh - 178px)',
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 30,
    p: { xs: 2.25, md: 4 },
    display: 'grid',
    gridTemplateRows: 'auto auto auto auto',
    gap: 2,
    bgcolor: 'background.surface',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
  },

  cardGlow: {
    position: 'absolute',
    insetInlineEnd: -80,
    top: -90,
    width: 260,
    height: 260,
    borderRadius: '50%',
    bgcolor: 'primary.softBg',
    opacity: 0.55,
    filter: 'blur(18px)',
    pointerEvents: 'none',
  },

  visualMark: {
    position: 'absolute',
    insetInlineEnd: { xs: 18, md: 34 },
    bottom: { xs: 18, md: 28 },
    width: { xs: 72, md: 112 },
    height: { xs: 72, md: 112 },
    borderRadius: 28,
    display: { xs: 'none', md: 'grid' },
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.plainColor',
    opacity: 0.55,
    pointerEvents: 'none',
  },

  mainText: {
    position: 'relative',
    maxWidth: 760,
    mx: 'auto',
    fontSize: { xs: 20, md: 26 },
    lineHeight: { xs: 1.58, md: 1.54 },
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'text.primary',
    zIndex: 1,
  },

  highlightText: tone => ({
    ...highlightColors[tone],
    fontWeight: 700,
    px: 0.25,
  }),

  modalAction: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    maxWidth: 760,
    width: '100%',
    mx: 'auto',
    pt: 0.25,
    zIndex: 1,
  },

  infoButton: {
    width: 'fit-content',
    px: 1.5,
    py: 0.8,
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'primary.outlinedBorder',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)',
    transition:
      'transform .16s ease, box-shadow .16s ease, border-color .16s ease',

    '&:hover': {
      transform: 'translateY(-1px)',
      borderColor: 'primary.solidBg',
      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.14)',
    },

    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 7px 18px rgba(15, 23, 42, 0.10)',
    },
  },

  textBreak: {
    display: 'block',
    height: 8,
  },

  inlineIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: '-0.13em',
    ml: 0.45,

    '& svg': {
      fontSize: 22,
    },
  },
}
