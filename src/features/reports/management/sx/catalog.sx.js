// src/features/reports/management/sx/catalog.sx.js

export const catalogSx = {
  category: {
    minWidth: 0,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    bgcolor: 'background.surface',
  },

  categoryHeader: open => ({
    width: '100%',
    minHeight: 60,
    px: 1,
    py: 0.85,
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 24px',
    alignItems: 'center',
    gap: 0.75,
    bgcolor: open ? 'background.level1' : 'background.surface',
    borderBottom: open ? '1px solid' : 0,
    borderColor: 'divider',
    cursor: 'pointer',
    transition: 'background-color 160ms ease',

    '&:hover': {
      bgcolor: 'background.level1',
    },

    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.400',
      outlineOffset: -2,
    },
  }),

  categoryIcon: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'sm',
    bgcolor: 'primary.softBg',
    color: 'primary.600',

    '& svg': {
      fontSize: 18,
    },
  },

  categoryContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.15,
    textAlign: 'start',
  },

  categoryTitleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
  },

  categoryTitle: {
    minWidth: 0,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  categoryCount: {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    minWidth: 20,
    height: 20,
    px: 0.55,
    borderRadius: 999,
    bgcolor: 'neutral.softBg',
    color: 'text.secondary',
    fontSize: 10,
    fontWeight: 700,
  },

  categoryDescription: {
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  categoryArrow: open => ({
    display: 'grid',
    placeItems: 'center',
    color: 'text.secondary',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 180ms ease',

    '& svg': {
      fontSize: 20,
    },
  }),

  categoryCollapse: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    transition: 'grid-template-rows 220ms ease, opacity 160ms ease',

    '& > *': {
      minHeight: 0,
      overflow: 'hidden',
    },
  }),

  reportsList: {
    minHeight: 0,
    p: 0.6,
    bgcolor: 'background.body',
  },

  reportRow: (selected, disabled) => ({
    position: 'relative',
    minWidth: 0,
    minHeight: 50,
    px: 1,
    py: 0.65,
    display: 'grid',
    gridTemplateColumns: '4px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.75,
    borderRadius: 'sm',
    bgcolor: selected ? 'primary.softBg' : 'transparent',
    opacity: disabled ? 0.52 : 1,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background-color 150ms ease',

    '&:hover': disabled
      ? {}
      : {
          bgcolor: selected
            ? 'primary.softHoverBg'
            : 'background.level1',
        },

    '&:focus-visible': disabled
      ? {}
      : {
          outline: '2px solid',
          outlineColor: 'primary.400',
          outlineOffset: -2,
        },
  }),

  reportIndicator: selected => ({
    width: 3,
    height: selected ? 30 : 8,
    borderRadius: 999,
    bgcolor: selected ? 'primary.500' : 'neutral.300',
    transition: 'height 150ms ease, background-color 150ms ease',
  }),

  reportContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.1,
    textAlign: 'start',
  },

  reportTitle: {
    minWidth: 0,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  reportScope: {
    color: 'text.tertiary',
  },

  statusChip: {
    flexShrink: 0,
    maxWidth: 104,
    fontSize: 9.5,
    '--Chip-minHeight': '22px',
    '--Chip-paddingInline': '0.45rem',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}



