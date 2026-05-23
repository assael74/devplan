// teamProfile/desktop/modules/players/sections/sx/identity.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const identitySx = {
  root: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.7,
    overflow: 'hidden',
  },

  avatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
    boxShadow: `0 0 0 2px ${c.bg}22`,
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

  text: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    gap: 0.25,
    overflow: 'hidden',
  },

  name: {
    minWidth: 0,
    fontWeight: 700,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  meta: {
    minWidth: 0,
    fontSize: 11,
    lineHeight: 1,
    opacity: 0.68,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
