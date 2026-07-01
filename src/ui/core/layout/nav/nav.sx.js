// src/ui/core/layout/nav/nav.sx.js

export const navSx = {
  root: {
    height: '100%',
    minHeight: 0,
    py: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  section: {
    minWidth: 0,
  },

  title: {
    px: 1.25,
    pt: 1.25,
    pb: 0.75,
    color: 'text.tertiary',
    fontWeight: 700,
  },

  divider: {
    my: 1,
    opacity: 0.6,
  },

  collapseHeader: open => ({
    mx: 0.75,
    mt: 0.75,
    px: 1.25,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    color: open ? 'text.primary' : 'text.secondary',
    bgcolor: open ? 'background.level1' : 'transparent',
    borderRadius: 'md',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color .16s ease, color .16s ease',
    '&:hover': {
      bgcolor: 'background.level1',
      color: 'text.primary',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.400',
      outlineOffset: 2,
    },
  }),

  collapseTitle: {
    minWidth: 0,
    fontWeight: 700,
  },

  collapseIndicator: open => ({
    width: 22,
    height: 22,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: open ? 'primary.500' : 'text.tertiary',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform .2s ease, color .16s ease',
    '& svg': {
      width: 20,
      height: 20,
    },
  }),

  collapseContent: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    transition: 'grid-template-rows .22s ease, opacity .16s ease',
  }),

  collapseInner: {
    minHeight: 0,
    overflow: 'hidden',
  },

  navItem: (active, collapsed) => ({
    variant: active ? 'soft' : 'plain',
    sx: {
      position: 'relative',
      mx: 0.75,
      my: 0.25,
      borderRadius: 'md',
      justifyContent: collapsed ? 'center' : 'space-between',
      ...(active && {
        bgcolor: 'primary.softBg',
        color: 'primary.softColor',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 6,
          bottom: 6,
          width: 4,
          borderRadius: 999,
          bgcolor: 'primary.500',
        },
      }),
    },
  }),

  navBox: collapsed => ({
    sx: {
      width: '100%',
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      justifyContent: collapsed ? 'center' : 'flex-start',
    },
  }),

  navContent: {
    minWidth: 0,
  },

  navLabelRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  navIcon: {
    width: 22,
    height: 22,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
}
