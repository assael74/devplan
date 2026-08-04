// teamProfile/desktop/modules/players/sx/row.sx.js

export const rowSx = {
  row: {
    display: 'grid',
    gridTemplateColumns: '0.95fr 0.6fr 0.45fr 0.65fr 0.55fr 1.45fr 75px',
    alignItems: 'center',
    columnGap: 0.45,
    minHeight: 54,
    px: 0.75,
    py: 0.45,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease, background-color .14s ease',

    '&:hover': {
      bgcolor: 'background.level1',
      borderColor: 'neutral.300',
      boxShadow: 'none',
    },
  },

  rowKey: {
    borderColor: 'primary.outlinedBorder',
  },

  rowPerformanceView: {
    gridTemplateColumns: {
      xs: '1fr',
      md: '0.55fr 0.45fr 0.65fr 1.5fr 1.45fr 75px',
    },
  },

  rowSelectionMode: {
    gridTemplateColumns: '36px 0.95fr 0.6fr 0.45fr 0.65fr 0.55fr 1.45fr 75px',
  },

  rowPerformanceSelectionMode: {
    gridTemplateColumns: {
      xs: '36px 1fr',
      md: '36px 0.55fr 0.45fr 0.65fr 1.5fr 1.45fr 75px',
    },
  },

  rowSelectable: {
    cursor: 'pointer',
    userSelect: 'none',
  },

  rowSelected: {
    borderColor: 'primary.outlinedBorder',
    bgcolor: 'primary.softBg',
    boxShadow: 'inset 0 0 0 1px var(--joy-palette-primary-outlinedBorder)',

    '&:hover': {
      bgcolor: 'primary.softHoverBg',
    },
  },

  rowProject: {
    boxShadow: 'none',
  },

  rowInactive: {
    opacity: 0.76,
  },

  selectionCell: {
    display: 'grid',
    placeItems: 'center',
    minWidth: 0,
  },

  cell: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'start',
    gap: 0.25,
    overflow: 'hidden',
  },

  chip: {
    flexShrink: 0,
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  potentialCell: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'start',
    gap: 0.15,
    overflow: 'hidden',
  },

  potentialLabel: {
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.2,
    width: 75,
    minWidth: 0,
    overflow: 'hidden',
  },

  actionsPlaceholder: {
    width: 75,
    minWidth: 0,
  },
}
