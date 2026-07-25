// features/playersDatabase/ui/pages/playerPage/sx/playerPage.stats.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const playerPageStatsSx = {
  statsSection: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1.25,
    alignItems: 'stretch',
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  playerKpiCard: {
    minWidth: 0,
    minHeight: 106,
    maxHeight: 118,
    p: 1.25,
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: 0.75,
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    boxShadow: '0 8px 22px rgba(11, 31, 77, 0.05)',
    overflow: 'hidden',
  },

  playerKpiMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  playerKpiText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.5,
  },

  playerKpiTitle: {
    color: devPlanColors.secondary,
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.15,
  },

  playerKpiValue: {
    color: devPlanColors.primaryDark,
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 700,
  },

  placeholderValue: {
    color: devPlanColors.secondary,
  },

  playerKpiIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
  },

  playerKpiDetails: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  playerKpiDetail: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    px: 0.65,
    py: 0.35,
    borderRadius: 7,
    bgcolor: '#f6f9fc',
    border: '1px solid #e4edf6',
    overflow: 'hidden',
  },

  playerKpiDetailLabel: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 11,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  playerKpiDetailValue: {
    flexShrink: 0,
    maxWidth: '62%',
    color: devPlanColors.primaryDark,
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
