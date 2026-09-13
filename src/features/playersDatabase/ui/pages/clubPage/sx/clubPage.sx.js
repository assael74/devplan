import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { pageCoreLayoutSx } from '../../../components/page/sx/pageCoreLayout.sx.js'

export const clubPageSx = {
  ...pageCoreLayoutSx,
  pageTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
  },

  stateBox: {
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.75,
    color: devPlanColors.secondary,
  },

  details: {
    minHeight: 160,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.75,
  },

  clubId: {
    color: devPlanColors.secondary,
  },

  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 1,
  },

  metricCard: {
    p: 1,
    borderColor: devPlanColors.border,
    boxShadow: 'none',
  },

  metricLabel: {
    color: devPlanColors.secondary,
    fontWeight: 800,
    fontSize: 11,
  },

  signal: {
    display: 'inline-flex',
    px: 0.75,
    py: 0.35,
    borderRadius: 8,
    bgcolor: '#FFF0DB',
    color: '#8A4E00',
    fontSize: 12,
    fontWeight: 700,
  },

  seasonTable: {
    '& th': {
      color: devPlanColors.secondary,
      fontSize: 11,
      textAlign: 'right',
    },
    '& td': {
      textAlign: 'right',
    },
  },

  developmentRow: {
    p: 0.85,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.8,
    alignItems: 'center',
    borderBottom: `1px solid ${devPlanColors.border}`,
  },

  seasonRow: isLinked => ({
    cursor: isLinked ? 'pointer' : 'default',
  }),
}
