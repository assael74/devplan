// ui/domains/tags/tags.sx.js

export const tagsSx = {
  root: {
    display: 'grid',
    gap: 0.75,
    width: '100%',
    minWidth: 0,
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  title: {
    opacity: 0.82,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  counter: {
    opacity: 0.72,
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },

  chipsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.65,
    alignItems: 'center',
    alignContent: 'flex-start',
    minHeight: 34,
    minWidth: 0,
  },

  empty: {
    opacity: 0.62,
    fontSize: 12,
    fontStyle: 'italic',
  },

  chip: (color, readonly, variant = 'solid') => {
    const isSoft = variant === 'soft'

    return {
      borderRadius: 999,
      fontSize: 12,
      lineHeight: 1.1,
      fontWeight: 700,
      px: 1,
      py: 0.42,
      minHeight: 26,
      userSelect: 'none',
      border: '1px solid',
      borderColor: isSoft ? `${color}55` : 'transparent',
      bgcolor: isSoft ? `${color}22` : color,
      color: isSoft ? color : '#fff',
      boxShadow: isSoft ? 'xs' : 'sm',
      cursor: readonly ? 'default' : 'pointer',
      transition:
        'filter 120ms ease, transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',

      '& .MuiChip-label': {
        px: 0.15,
      },

      '& .MuiChip-startDecorator, & .MuiChip-endDecorator': {
        color: isSoft ? color : '#fff',
        opacity: 0.92,
      },

      ...(readonly
        ? {
            opacity: 0.94,
          }
        : {
            '&:hover': {
              filter: isSoft ? 'brightness(0.98)' : 'brightness(0.94)',
              transform: 'translateY(-1px)',
              boxShadow: 'md',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }),
    }
  },

  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    width: '100%',
  },

  autocomplete: {
    flex: 1,
    minWidth: 160,
    width: '100%',

    '& .MuiInput-root': {
      borderRadius: 'md',
      bgcolor: 'background.surface',
      boxShadow: 'sm',
    },
  },

  listbox: {
    maxHeight: 320,
    overflow: 'auto',
    p: 0.5,
  },

  groupWrap: {
    py: 0.4,
  },

  groupHeader: {
    px: 1,
    py: 0.55,
    fontWeight: 800,
    fontSize: 12,
    opacity: 0.8,
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
    pt: 0.25,
  },

  optionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1,
    py: 0.7,
    borderRadius: 'md',
    cursor: 'pointer',
    transition: 'background-color 120ms ease, transform 120ms ease',

    '&:hover': {
      bgcolor: 'neutral.softBg',
    },

    '&[aria-selected="true"]': {
      bgcolor: 'neutral.softBg',
      fontWeight: 700,
    },

    '&:active': {
      transform: 'scale(0.99)',
    },
  },

  optionMeta: {
    opacity: 0.62,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
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
