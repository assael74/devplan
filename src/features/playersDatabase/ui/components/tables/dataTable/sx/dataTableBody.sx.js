// features/playersDatabase/ui/components/tables/dataTable/sx/dataTableBody.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

function expandedRow(open) {
  return {
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
  }
}

function expandedCell(open) {
  return {
    height: open ? 'auto' : 0,
    minHeight: 0,
    p: '0 !important',
    borderTop: '0 !important',
    borderBottom: '0 !important',
    overflow: 'hidden',
  }
}

function expandedCollapse(open) {
  return {
    maxHeight: open ? 220 : 0,
    opacity: open ? 1 : 0,
    overflow: 'hidden',
    pointerEvents: open ? 'auto' : 'none',
    transition: [
      'max-height 220ms ease',
      'opacity 180ms ease',
    ].join(', '),
  }
}

function expandedContent(open) {
  return {
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
  }
}

export const dataTableBodySx = {
  expandedRow,
  expandedCell,
  expandedCollapse,
  expandedContent,

  emptyText: {
    py: 2,
    textAlign: 'center',
    color: devPlanColors.secondary,
  },
}
