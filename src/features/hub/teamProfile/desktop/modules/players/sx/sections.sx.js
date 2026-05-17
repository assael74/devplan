// teamProfile/desktop/modules/players/sx/sections.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const sectionsSx = {
  infoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    flexGrow: 1,
    overflow: 'hidden',
  },

  identityCol: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
    minWidth: 0,
    width: 250,
    overflow: 'hidden',
    flexShrink: 0,
  },

  avatarBtn: {
    position: 'relative',
    lineHeight: 0,
    borderRadius: 999,
    cursor: 'pointer',
    width: 36,
    height: 36,
    flexShrink: 0,

    '&:hover ._rowAvatarOverlay': {
      opacity: 1,
    },

    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: c.bg,
      outlineOffset: 2,
    },
  },

  spacer: {
    flex: 1,
    marginInlineStart: 'auto',
  },

  avatar: {
    width: 36,
    height: 36,
    boxShadow: `0 0 0 2px ${c.bg}22`,
  },

  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    bgcolor: 'rgba(0,0,0,0.18)',
    opacity: 0,
    transition: 'opacity 140ms ease',
    pointerEvents: 'none',
  },

  avatarStatusDot: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: 'background.surface',
    zIndex: 2,
    boxShadow: 'sm',
  },

  avatarStatusDotActive: {
    bgcolor: 'success.500',
  },

  avatarStatusDotInactive: {
    bgcolor: 'danger.500',
  },

  nameWrap: {
    display: 'grid',
    gap: 0.14,
    minWidth: 0,
    overflow: 'hidden',
    flex: 1,
  },

  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    overflow: 'hidden',
  },

  playerName: {
    fontWeight: 700,
    minWidth: 0,
    flex: '0 1 auto',
    maxWidth: '100%',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.1,
  },

  keyChip: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    marginInlineStart: 0,
    border: '1px solid',
    borderColor: 'divider'
  },

  subMetaInline: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  metaText: {
    opacity: 0.68,
    whiteSpace: 'nowrap',
    fontSize: 11,
    lineHeight: 1,
  },

  performCol: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    width: 480,
    overflow: 'hidden',
    flexWrap: 'wrap',
    flexShrink: 0,
  },

  metricChip: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    border: '1px solid',
    borderColor: 'divider'
  },

  timeRateChip: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      whiteSpace: 'nowrap',
    },
  },

  timeRateText: {
    display: 'inline',
    whiteSpace: 'nowrap',
  },

  positionsCol: {
    display: 'grid',
    gap: 0.7,
    minWidth: 0,
    width: 170,
    alignContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },

  positionsTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.3,
    minWidth: 0,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },

  positionsBottomRow: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },

  positionChip: {
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider'
  },

  positionChipClickable: {
    cursor: 'pointer',
    flexShrink: 0,
    border: '1px solid',
    borderColor: 'divider'
  },

  generalPositionChip: {
    minWidth: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  generalPositionChipClickable: {
    cursor: 'pointer',
    minWidth: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
