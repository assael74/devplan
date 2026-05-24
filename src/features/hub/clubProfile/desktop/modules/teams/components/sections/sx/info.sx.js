// clubProfile/desktop/modules/teams/components/sections/sx/info.sx.js

export const infoSx = {
  root: {
    minWidth: 0,
    flex: '1 1 250px',
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

  subMetaInline: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    minWidth: 0,
    overflow: 'hidden',
  },

  yearText: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  metaText: {
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}
