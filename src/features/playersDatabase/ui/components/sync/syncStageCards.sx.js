// src/features/playersDatabase/ui/components/sync/syncStageCards.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const syncStageCardsSx = {
  root: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 1,
  },

  card: {
    minWidth: 0,
    flex: {
      xs: '0 0 100%',
      sm: '0 0 calc(50% - 4px)',
      md: '0 0 calc(33.333% - 6px)',
      lg: '0 0 calc(25% - 6px)',
    },
  },

  cardCompact: {
    p: 1,
  },

  content: { height: '100%' },

  header: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  marker: {
    width: 28,
    height: 28,
    flex: '0 0 auto',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    color: devPlanColors.primary,
    fontWeight: 700,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.surface,
  },

  markerCompleted: {
    color: 'success.700',
    borderColor: 'success.300',
    bgcolor: 'success.50',
  },

  markerCompact: {
    width: 24,
    height: 24,
  },

  cardActive: {
    borderColor: devPlanColors.primary,
    boxShadow: '0 8px 18px rgba(23, 76, 123, 0.18)',
  },
}
