// src/features/playersDatabase/ui/components/playerMeta/sx/playerNameLink.sx.js

export const playerNameLinkSx = {
  root: {
    display: 'flex',
    width: '100%',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.5,
    minWidth: 0,
  },

  name: {
    flex: '0 1 auto',
    minWidth: 0,
    fontWeight: 600,
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  nameWithExternalLink: {
    maxWidth: 'calc(100% - 30px)',
  },

  avatar: {
    width: 26,
    height: 26,
    flex: '0 0 auto',
  },

  link: {
    flex: '0 0 auto',
  },

  nameLink: {
    color: 'primary.700',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}
