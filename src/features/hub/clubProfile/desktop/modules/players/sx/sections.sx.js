// hub/clubProfile/desktop/modules/players/sx/sections.sx.js

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
    width: 280,
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

  subMetaInline: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  metaText: {
    opacity: 0.68,
    whiteSpace: 'nowrap',
    fontSize: 11,
    lineHeight: 1.1,
  },

  performCol: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    width: 230,
    overflow: 'hidden',
    flexWrap: 'nowrap',
    flexShrink: 0,
  },

  timeRateChip: {
    flexShrink: 0,
    whiteSpace: 'nowrap',

    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      whiteSpace: 'nowrap',
    },
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
}
