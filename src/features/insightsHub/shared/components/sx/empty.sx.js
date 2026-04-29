// features/insightsHub/shared/components/sx/empty.sx.js

export const emptySx = {
  // EmptyInsights
  emptyRoot: {
    minHeight: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 1,
  },

  boxWrap: {
    minHeight: 220,
    borderRadius: 14,
    bgcolor: 'background.level1',
    p: 2,
    display: 'grid',
    placeItems: 'center',
  },

  boxWrapText: {
    display: 'grid',
    justifyItems: 'center',
    gap: 0.75,
    textAlign: 'center'
  },

  boxWrapIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.surface',
    color: 'text.tertiary',
  },
}
