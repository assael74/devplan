// teamProfile/desktop/modules/players/sx/row.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const rowSx = {
  row: {
    display: 'grid',
    gridTemplateColumns:
      '0.95fr 0.6fr 0.65fr 0.4fr 0.65fr 1.75fr 75px',
    alignItems: 'center',
    columnGap: 0.45,
    minHeight: 54,
    px: 0.75,
    py: 0.45,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level3',
    position: 'relative',
    overflow: 'hidden',
    transition:
      'transform .14s ease, box-shadow .14s ease, border-color .14s ease, background-color .14s ease',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 3,
      height: '100%',
      bgcolor: c.bg,
      opacity: 0.95,
    },

    '&:hover': {
      bgcolor: `${c.accent}66`,
      boxShadow: 'sm',
    },
  },

  rowKey: {
    '&::before': {
      bgcolor: c.accent,
    },
  },

  rowProject: {
    boxShadow: `inset 0 0 0 1px ${c.bg}18`,
  },

  rowInactive: {
    opacity: 0.76,
  },

  cell: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'start',
    gap: 0.25,
    overflow: 'hidden',
  },

  chip: {
    flexShrink: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  potentialCell: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'start',
    gap: 0.15,
    overflow: 'hidden',
  },

  potentialLabel: {
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.2,
    width: 75,
    minWidth: 0,
    overflow: 'hidden',
  },
}
