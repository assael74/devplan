// teamProfile/sharedUi/insights/teamGames/sections/sx/target.sx.js

import { coloredCard } from './shared.sx.js'

export const targetSx = {
  metricCard: (color = 'neutral') =>
    coloredCard({
      minHeight: 82,
      borderRadius: 14,
      padding: 1.2,
      gap: 0.75,
      color,
    }),

  gridThree: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1,
  },

  metricTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  metricTitle: {
    fontWeight: 700,
    opacity: 0.78,
  },

  metricValue: {
    fontWeight: 700,
    fontSize: 22,
    lineHeight: 1,
  },

  metricSub: {
    opacity: 0.72,
    lineHeight: 1.3,
  },
}
