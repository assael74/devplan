// features/playersDatabase/ui/components/tables/tables.expanded.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const pdbTableExpandedSx = {
  expandedRow: open => ({
    height: open ? 'auto' : 0,
    visibility: open ? 'visible' : 'hidden',

    '& > td': {
      height: open ? 'auto' : 0,
      minHeight: 0,
      p: '0 !important',
      borderTop: '0 !important',
      borderBottom: '0 !important',
      lineHeight: 0,
      bgcolor: '#f8fbff',
    },
  }),

  expandedCell: open => ({
    height: open ? 'auto' : 0,
    minHeight: 0,
    p: '0 !important',
    borderTop: '0 !important',
    borderBottom: '0 !important',
    overflow: 'hidden',
  }),

  expandedCollapse: open => ({
    maxHeight: open ? 220 : 0,
    opacity: open ? 1 : 0,
    overflow: 'hidden',
    pointerEvents: open ? 'auto' : 'none',
    transition: [
      'max-height 220ms ease',
      'opacity 180ms ease',
    ].join(', '),
  }),

  expandedContent: open => ({
    px: open ? 1.25 : 0,
    py: open ? 1 : 0,
    lineHeight: open ? 'normal' : 0,
    borderTop: open
      ? `1px solid ${devPlanColors.primaryLight}`
      : '1px solid transparent',
    transform: open
      ? 'translateY(0)'
      : 'translateY(-6px)',
    transition: [
      'padding 220ms ease',
      'transform 220ms ease',
      'border-color 160ms ease',
    ].join(', '),
  }),
}
