// clubProfile/desktop/modules/teams/components/sections/sx/league.sx.js

export const leagueSx = {
  root: {
    width: 236,
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    alignItems: 'center',
    gap: 0.35,
    overflow: 'hidden',
    flexShrink: 0,
  },

  metric: (tone = 'neutral') => ({
    minWidth: 0,
    display: 'grid',
    justifyItems: 'center',
    gap: 0.15,
    px: 0.45,
    py: 0.3,
    borderRadius: 8,
    bgcolor: tone === 'neutral' ? 'background.level1' : `${tone}.softBg`,
    color: tone === 'neutral' ? 'text.secondary' : `${tone}.softColor`,
    border: '1px solid',
    borderColor: 'divider',
  }),

  metricText: {
    display: 'grid',
    justifyItems: 'center',
    gap: 0.05,
    lineHeight: 1.05,
    minWidth: 0,
    '& span': {
      color: 'text.tertiary',
      fontSize: 10,
      whiteSpace: 'nowrap',
    },
    '& strong': {
      color: 'text.primary',
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: 'nowrap',
    },
  },

  emptyText: {
    color: 'text.tertiary',
    fontWeight: 600,
    px: 0.5,
    whiteSpace: 'nowrap',
  },
}
