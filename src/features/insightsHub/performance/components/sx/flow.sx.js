// features/insightsHub/performance/components/sx/flow.sx.js

const toneMap = {
  team: {
    color: '#175CD3',
    bg: 'rgba(23, 92, 211, 0.08)',
    border: 'rgba(23, 92, 211, 0.26)',
  },

  numeric: {
    color: '#0F766E',
    bg: 'rgba(15, 118, 110, 0.16)',
    border: 'rgba(15, 118, 110, 0.34)',
  },

  player: {
    color: '#6941C6',
    bg: 'rgba(105, 65, 198, 0.08)',
    border: 'rgba(105, 65, 198, 0.26)',
  },

  metrics: {
    color: '#0B5CAD',
    bg: 'rgba(11, 92, 173, 0.08)',
    border: 'rgba(11, 92, 173, 0.26)',
  },

  profile: {
    color: '#3538CD',
    bg: 'rgba(53, 56, 205, 0.10)',
    border: 'rgba(53, 56, 205, 0.30)',
  },
}

const getTone = tone => {
  return toneMap[tone] || toneMap.metrics
}

export const flowSx = {
  root: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: 1.5,
    maxWidth: 760,
    width: '100%',
    mx: 'auto',
    minHeight: 0,
  },

  actions: {
    display: 'flex',
    justifyContent: 'center',
  },

  flowButton: {
    borderRadius: 999,
    px: 2.4,
    py: 1,
    fontWeight: 700,
    boxShadow: '0 12px 26px rgba(15, 23, 42, 0.14)',
  },

  flowScroll: {
    maxHeight: { xs: '42dvh', md: '46dvh' },
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.5,
    pb: 1,
    pt: 3,
  },

  flow: {
    display: 'grid',
    gap: 0,
    maxWidth: 680,
    mx: 'auto',
  },

  itemWrap: {
    display: 'grid',
    justifyItems: 'center',
  },

  row: count => ({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: count > 1
      ? { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }
      : '1fr',
    gap: 1,
    alignItems: 'stretch',
  }),

  card: (tone, state = {}) => {
    const c = getTone(tone)
    const visible = Boolean(state.visible)
    const active = Boolean(state.active)

    return {
      position: 'relative',
      width: '100%',
      minHeight: 96,
      display: 'grid',
      gridTemplateColumns: '44px minmax(0, 1fr)',
      gap: 1.25,
      alignItems: 'center',
      p: { xs: 1.25, md: 1.35 },
      borderRadius: 22,
      border: '1px solid',
      borderColor: active ? c.color : c.border,
      bgcolor: c.bg,
      opacity: visible ? 1 : 0.18,
      filter: visible ? 'none' : 'grayscale(0.75)',
      transform: active ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: active
        ? '0 18px 40px rgba(15, 23, 42, 0.14)'
        : '0 14px 34px rgba(15, 23, 42, 0.07)',
      transition:
        'opacity .28s ease, transform .28s ease, box-shadow .28s ease, border-color .28s ease, filter .28s ease',
    }
  },

  numBadge: (tone, state = {}) => {
    const c = getTone(tone)
    const active = Boolean(state.active)

    return {
      position: 'absolute',
      insetInlineStart: 12,
      top: -13,
      width: 26,
      height: 26,
      borderRadius: 999,
      display: 'grid',
      placeItems: 'center',
      bgcolor: active ? c.color : 'background.surface',
      color: active ? 'common.white' : c.color,
      border: '1px solid',
      borderColor: c.border,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.10)',
    }
  },

  icon: tone => {
    const c = getTone(tone)

    return {
      width: 42,
      height: 42,
      borderRadius: 15,
      display: 'grid',
      placeItems: 'center',
      bgcolor: 'background.surface',
      border: '1px solid',
      borderColor: c.border,
      color: c.color,
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
    }
  },

  body: {
    display: 'grid',
    gap: 0.45,
    minWidth: 0,
  },

  label: {
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },

  sub: {
    color: 'text.secondary',
    lineHeight: 1.45,
    fontWeight: 600,
  },

  connector: visible => ({
    width: 2,
    height: 22,
    my: 0.4,
    borderRadius: 999,
    bgcolor: visible ? 'primary.solidBg' : 'divider',
    opacity: visible ? 0.9 : 0.35,
    transition: 'opacity .25s ease, background-color .25s ease',
  }),
}
