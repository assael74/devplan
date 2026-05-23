// src/features/hub/teamProfile/desktop/modules/games/components/details/sx/table.sx.js

export const tableSx = {
  table: {
    display: 'grid',
    gap: 0.5,
    minWidth: 0,
  },

  head: {
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, 1fr) 64px 64px 64px 92px 116px 58px',
    alignItems: 'center',
    gap: 0.75,
    px: 0.85,
    minWidth: 0,
  },

  headCell: align => ({
    color: 'text.tertiary',
    fontWeight: 700,
    textAlign: align || 'center',
    minWidth: 0,
  }),

  headInner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.35,
    minWidth: 0,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
  },

  headLabel: {
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  playerPanel: (open, menuOpen) => ({
    display: 'grid',
    minWidth: 0,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: open ? 'primary.outlinedBorder' : 'divider',
    bgcolor: 'background.surface',
    overflow: 'visible',
    position: 'relative',
    zIndex: menuOpen ? 1000 : open ? 40 : 1,
    transition: 'border-color .16s ease, box-shadow .16s ease',

    '&:hover': {
      boxShadow: 'sm',
    },
  }),

  row: (open, menuOpen) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, 1fr) 64px 64px 64px 92px 116px 58px',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    px: 0.85,
    py: 0.65,
    borderRadius: open ? 'md md 0 0' : 'md',
    bgcolor: open ? 'background.level1' : 'background.surface',
    cursor: 'pointer',
    outline: 'none',
    zIndex: menuOpen ? 1001 : open ? 45 : 2,
    transition: 'background-color .16s ease',

    '&:hover': {
      bgcolor: 'background.level1',
    },

    '&:focus-visible': {
      boxShadow: 'inset 0 0 0 2px var(--joy-palette-primary-outlinedBorder)',
    },
  }),

  playerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  avatar: {
    '--Avatar-size': '26px',
    flex: '0 0 auto',
  },

  playerName: {
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  centerText: {
    color: 'text.secondary',
    textAlign: 'center',
  },

  metricChip: {
    justifySelf: 'center',
    minWidth: 0,
    maxWidth: '100%',
  },

  actionsWrap: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    minWidth: 0,
    overflow: 'visible',
    zIndex: 1002,
  },

  actionsMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    insetInlineEnd: 0,
    zIndex: 1003,
    width: 220,
    maxWidth: 220,
    p: 0.5,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.popup',
    boxShadow: 'lg',
    display: 'grid',
    gap: 0.25,
  },

  actionButton: {
    justifySelf: 'center',
  },

  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 0.75,
    py: 0.65,
    borderRadius: 'sm',
    cursor: 'pointer',
    color: 'text.secondary',

    '&:hover': {
      bgcolor: 'background.level1',
      color: 'text.primary',
    },
  },

  actionText: {
    whiteSpace: 'nowrap',
  },

  trendCollapse: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows 220ms ease',
    overflow: open ? 'visible' : 'hidden',
    position: 'relative',
    zIndex: open ? 10 : 0,
  }),

  trendCollapseInner: {
    overflow: 'visible',
    minHeight: 0,
  },

  trendBody: {
    p: 0.75,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  emptyText: {
    color: 'text.tertiary',
  },
}
