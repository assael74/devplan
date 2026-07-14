export const collapseBoxSx = {
  root: {
    width: '100%',
    minWidth: 0,
  },

  header: (open, disabled = false) => ({
    mt: 0.75,
    px: 1.25,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    color: open ? 'text.primary' : 'text.secondary',
    bgcolor: open ? 'background.level1' : 'transparent',
    borderTopLeftRadius: 'var(--joy-radius-sm)',
    borderTopRightRadius: 'var(--joy-radius-sm)',
    borderBottomLeftRadius: open ? 0 : 'var(--joy-radius-sm)',
    borderBottomRightRadius: open ? 0 : 'var(--joy-radius-sm)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    opacity: disabled ? 0.55 : 1,
    transition: 'background-color .16s ease, color .16s ease',
    '&:hover': {
      bgcolor: disabled ? open ? 'background.level1' : 'transparent' : 'background.level1',
      color: disabled ? (open ? 'text.primary' : 'text.secondary') : 'text.primary',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.400',
      outlineOffset: 2,
    },
  }),

  headerLeft: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: 1,
  },

  headerText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.15,
  },

  title: {
    minWidth: 0,
    fontWeight: 700,
  },

  subtitle: {
    minWidth: 0,
    color: 'text.tertiary',
    fontSize: '0.8rem',
  },

  indicator: open => ({
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

  content: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    transition: 'grid-template-rows .22s ease, opacity .16s ease',
  }),

  inner: {
    minHeight: 0,
    overflow: 'hidden',
    px: 0.1,
  },
}
