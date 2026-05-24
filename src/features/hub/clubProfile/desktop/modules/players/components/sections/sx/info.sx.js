// clubProfile/desktop/modules/players/components/sections/sx/info.sx.js

export const infoSx = {
  root: {
    minWidth: 0,
    flex: '1 1 260px',
    overflow: 'hidden',
  },

  identityCol: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.9,
    minWidth: 0,
    overflow: 'hidden',
  },

  avatarBox: {
    position: 'relative',
    width: 38,
    height: 38,
    flexShrink: 0,
  },

  avatar: {
    width: 38,
    height: 38,
    border: '1px solid',
    borderColor: 'divider',
  },

  avatarStatusDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: 'background.level3',
  },

  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    pointerEvents: 'none',
  },

  nameWrap: {
    display: 'grid',
    gap: 0.2,
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },

  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    overflow: 'hidden',
  },

  nameButton: {
    minHeight: 20,
    minWidth: 0,
    px: 0.5,
    py: 0,
    justifyContent: 'flex-start',
    fontWeight: 700,
    color: 'text.primary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '&:hover': {
      bgcolor: 'transparent',
      color: 'primary.plainColor',
    },
  },

  roleChip: {
    flexShrink: 0,
    maxWidth: 126,
    mt: 0.2,
    ml: 2,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  subMetaInline: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    minWidth: 0,
    overflow: 'hidden',
  },

  teamButton: {
    minHeight: 18,
    minWidth: 0,
    px: 0.5,
    py: 0,
    color: 'text.secondary',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '&:hover': {
      bgcolor: 'transparent',
      color: 'primary.plainColor',
    },
  },

  metaText: {
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
}
