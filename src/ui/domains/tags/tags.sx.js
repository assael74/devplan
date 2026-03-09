// ui/domains/tags/tags.sx.js
export const tagsSx = {
  root: {
    display: 'grid',
    gap: 0.75,
    width: '100%',
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  title: {
    opacity: 0.75,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  counter: {
    opacity: 0.6,
    fontSize: 12,
    flexShrink: 0,
  },

  chipsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.6,
    alignItems: 'center',
    minHeight: 30,
  },

  empty: {
    opacity: 0.55,
    fontSize: 12,
  },

  chip: (color, readonly) => ({
    borderRadius: 999,
    fontSize: 12,
    lineHeight: 1,
    px: 1,
    userSelect: 'none',
    bgcolor: color,
    cursor: readonly ? 'default' : 'pointer',
    transition: 'filter 120ms ease, transform 120ms ease',
    ...(readonly
      ? { opacity: 0.9 }
      : {
          '&:hover': { filter: 'brightness(0.98)' },
          '&:active': { transform: 'scale(0.98)' },
        }),
  }),

  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  autocomplete: {
    flex: 1,
    minWidth: 160,
    width: '100%',
  },

  // Autocomplete popup/listbox polish for sticky group header
  listbox: {
    maxHeight: 320,
    overflow: 'auto',
    // אם תרצה דק: אפשר להחליף למחלקה גלובלית אצלך
  },

  groupWrap: {
    py: 0.5,
  },

  groupHeader: {
    px: 1,
    py: 0.5,
    fontWeight: 700,
    opacity: 0.75,
    bgcolor: 'background.popup',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  groupChildren: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  optionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1,
    py: 0.6,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background-color 120ms ease, transform 120ms ease',
    '&:hover': {
      bgcolor: 'neutral.softBg',
    },
    '&[aria-selected="true"]': {
      bgcolor: 'neutral.softBg',
      fontWeight: 600,
    },
    '&:active': {
      transform: 'scale(0.99)',
    },
  },

  optionMeta: {
    opacity: 0.6,
    flexShrink: 0,
  },

  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flex: 1,
    minWidth: 160,
    maxWidth: 340,
  },

  input: {
    flex: 1,
  },
}
