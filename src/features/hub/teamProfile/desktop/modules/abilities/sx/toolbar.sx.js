// teamProfile/modules/abilities/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.75,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
  },

  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 0.75,
    minWidth: 0,
  },

  summaryMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
    p: 0.75,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
  },

  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 'sm',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.surface',
    color: 'text.secondary',
    flexShrink: 0,
  },

  summaryLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.1,
  },

  summaryValue: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  insightsBtn: {
    bgcolor: c.accent,
    color: c.textAcc,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c.accent,
      color: c.textAcc,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    minHeight: 34,
  },

  indicatorsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
    flex: 1,
  },
}
