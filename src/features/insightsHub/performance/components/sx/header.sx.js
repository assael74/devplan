// features/insightsHub/performance/components/sx/header.sx.js

export const headerSx = {
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1.5,
    zIndex: 1,
  },

  titleWrap: {
    display: 'grid',
    gap: 0.65,
    minWidth: 0,
  },

  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  icon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.plainColor',
  },

  metaText: {
    color: 'text.tertiary',
    fontWeight: 700,
  },

  title: {
    fontWeight: 700,
    letterSpacing: '-0.04em',
    fontSize: { xs: 24, md: 32 },
    lineHeight: 1.15,
  },

  backButton: {
    flexShrink: 0,
  },
}
