// features/playersDatabase/ui/components/tables/tables.expanded.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const pdbTableExpandedSx = {
  expandedRow: {
    '& td': {
      p: 0,
      borderTop: 0,
      bgcolor: '#f8fbff',
    },
  },

  expandedCell: {
    p: '0 !important',
    borderTop: '0 !important',
  },

  expandedCollapse: open => ({
    maxHeight: open ? 220 : 0,
    opacity: open ? 1 : 0,
    overflow: 'hidden',
    transition: 'max-height 220ms ease, opacity 180ms ease',
  }),

  expandedContent: {
    px: 1.25,
    py: 1,
    borderTop: '1px solid #dbe5f4',
  },
}
