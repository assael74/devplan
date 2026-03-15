// hub/teamProfile/modules/players/sx/teamPlayers.list.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const teamPlayersListSx = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minHeight: 52,
    px: 0.75,
    py: 0.45,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
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

  ratingCol: {
    minWidth: 0,
    width: 90,
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
    width: 110,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
  },

  statusChip: {
    flexShrink: 0,
  },

  endActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.25,
    width: 72,
    flexShrink: 0,
    whiteSpace: 'nowrap',
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
