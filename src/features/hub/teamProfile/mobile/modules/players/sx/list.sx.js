// teamProfile/mobile/modules/players/sx/list.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const listSx = {
  row: {
    display: 'grid',
    gap: 0.65,
    minWidth: 0,
    px: 0.85,
    py: 0.75,
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
      bgcolor: `${c.accent}22`,
      boxShadow: 'sm',
    },
  },

  rowTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
    minWidth: 0,
  },

  rowBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  ratingCol: {
    minWidth: 0,
    width: 88,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
  },

  ratingTitle: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  statusCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.35,
    minWidth: 0,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
  },

  endActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.25,
    flexShrink: 0,
    marginInlineStart: 'auto',
  },

  emptyState: {
    display: 'grid',
    gap: 0.5,
    justifyItems: 'center',
    p: 2.5,
    borderRadius: 16,
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },
}
