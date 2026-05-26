// features/insightsHub/performance/components/sx/panels.sx.js

export const panelsSx = {
  tabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  tab: active => ({
    fontWeight: 700,
    borderColor: active ? 'primary.outlinedBorder' : 'divider',
  }),

  text: {
    color: 'text.secondary',
    lineHeight: 1.8,
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },
}
