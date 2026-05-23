// src/features/hub/teamProfile/desktop/modules/games/components/details/sx/trend.sx.js

export const trendSx = {
  panel: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'primary.outlinedBorder',
    bgcolor: 'background.level2',
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  titleWrap: {
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  sub: {
    color: 'text.tertiary',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.25,
    flex: '0 0 auto',
  },

  chartScroll: {
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
  },

  chartBox: width => ({
    width,
    minWidth: width,
    color: 'primary.600',
    bgcolor: 'background.surface',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    p: 0.5,
  }),

  legend: {
    minWidth: 0,
  },

  legendText: {
    color: 'text.tertiary',
  },
}
