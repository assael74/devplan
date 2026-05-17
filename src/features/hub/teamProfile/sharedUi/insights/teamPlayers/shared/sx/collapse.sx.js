// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/sx/collapse.sx.js

export const collapseSx = {
  panel: tone => ({
    position: 'relative',
    bgcolor: 'background.surface',
    overflow: 'hidden',
    borderRight: '3px solid',
    borderRightColor: `${tone}.300`,
    borderRadius: 'sm'
  }),

  head: open => ({
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1,
    py: 0.8,
    minWidth: 0,
    transition: 'background-color 160ms ease',
    bgcolor: 'background.level2',

    '&:hover': {
      bgcolor: open ? 'background.level2' : 'background.level1',
    },
  }),

  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  icon: tone => ({
    width: 24,
    height: 24,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
    color: `${tone}.600`,
    flex: '0 0 auto',
    boxShadow: 'md',
  }),

  text: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  sub: {
    color: 'text.tertiary',
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  toggle: open => ({
    width: 26,
    height: 26,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    color: 'text.secondary',
    bgcolor: open ? 'background.level1' : 'transparent',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: '160ms ease',
  }),

  collapse: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows 220ms ease',
  }),

  collapseInner: {
    overflow: 'hidden',
    minHeight: 0,
  },

  body: {
    borderTop: '1px solid',
    borderColor: 'divider',
    px: 1,
    py: 1,
    pb: 1.25,
    display: 'grid',
    gap: 1,
    bgcolor: 'background.level1',
  },
}
