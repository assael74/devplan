// hub/clubProfile/desktop/modules/players/sx/list.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const listSx = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minHeight: 58,
    px: 0.8,
    py: 0.55,
    borderRadius: 10,
    border: '1px solid',
    borderColor: 'neutral.300',
    bgcolor: 'background.surface',
    position: 'relative',
    overflow: 'hidden',
    transition: 'box-shadow .14s ease, border-color .14s ease, background-color .14s ease',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 9,
      right: 0,
      width: 3,
      height: 'calc(100% - 18px)',
      borderRadius: '999px 0 0 999px',
      bgcolor: 'divider',
      opacity: 0.9,
    },

    '&:hover': {
      bgcolor: 'background.level1',
      borderColor: 'neutral.400',
      boxShadow: 'sm',
    },
  },

  rowKey: {
    '&::before': {
      bgcolor: c.accent,
    },
  },

  divider: {
    opacity: 0.65,
  },

  dividerSoft: {
    opacity: 0.4,
  },

  ratingCol: {
    minWidth: 0,
    width: 112,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'grid',
    gap: 0.25,
  },

  ratingTitle: {
    fontWeight: 600,
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  ratingValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  ratingNumber: {
    fontWeight: 800,
    color: 'text.secondary',
    flexShrink: 0,
  },

  statusCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.35,
    minWidth: 0,
    width: 96,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
  },

  statusChip: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  emptyState: {
    display: 'grid',
    gap: 0.5,
    justifyItems: 'center',
    p: 2.5,
    borderRadius: 12,
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },
}
