// features/insightsHub/performance/components/sx/modal.sx.js

const placementSx = {
  left: {
    top: '10%',
    right: { xs: 12, md: 56 },
    transform: 'translateY(-50%)',
  },

  right: {
    bottom: { xs: 72, md: 92 },
    right: { xs: 12, md: 36 },
  },

  topWide: {
    top: { xs: 72, md: 86 },
    left: '5%',
    transform: 'translateX(-50%)',
  },

  center: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}

const variantSx = {
  text: {
    width: 'min(620px, calc(100vw - 32px))',
    maxHeight: 'min(72dvh, 640px)',
  },

  content: {
    width: 'min(720px, calc(100vw - 32px))',
    maxHeight: 'min(76dvh, 680px)',
  },

  table: {
    width: 'min(1080px, calc(100vw - 280px))',
    maxHeight: 'min(82dvh, 760px)',
  },

  profiles: {
    width: 'min(980px, calc(100vw - 280px))',
    maxHeight: 'min(84dvh, 780px)',
  },
}

const getPlacementSx = placement => {
  return placementSx[placement] || placementSx.center
}

const getVariantSx = variant => {
  return variantSx[variant] || variantSx.content
}

export const modalSx = {
  root: {
    backdropFilter: 'blur(6px)',
  },

  dialog: ({ placement, variant }) => ({
    ...getPlacementSx(placement),
    ...getVariantSx(variant),
    position: 'fixed',
    m: 0,
    overflow: 'hidden',
    borderRadius: 28,
    p: { xs: 2, md: 2.5 },
    bgcolor: 'background.surface',
    boxShadow: 'lg',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 2,
  }),

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1.5,
  },

  titleWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
  },

  kicker: {
    color: 'primary.plainColor',
    fontWeight: 700,
  },

  title: {
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },

  content: {
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.5,
  },

  text: {
    color: 'text.secondary',
    lineHeight: 1.9,
  },
}
