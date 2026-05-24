// playerProfile/desktop/modules/games/components/details/sx/trend.sx.js

export const trendSx = {
  panel: {
    display: 'grid',
    gap: 1,
    p: 1,
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    minWidth: 0,
  },

  head: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  titleWrap: {
    display: 'grid',
    gap: 0.25,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
  },

  sub: {
    color: 'text.tertiary',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.25,
    flexShrink: 0,
  },

  chartScroll: {
    overflowX: 'auto',
    overflowY: 'hidden',
    minWidth: 0,
    pb: 0.5,
  },

  chartBox: width => ({
    width,
    minWidth: width,
    color: 'text.primary',
  }),

  legend: {
    borderTop: '1px solid',
    borderColor: 'divider',
    pt: 0.75,
  },

  legendText: {
    color: 'text.tertiary',
  },
}
