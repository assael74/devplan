export const gcfSx = {
  root: (layout) => ({
    display: 'grid',
    gap: layout?.shellGap || 2,
    minWidth: 0,
  }),

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  block: (cols, gap = 1) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    gap,
    minWidth: 0,
    alignItems: 'start',
    '& > *': {
      minWidth: 0,
    },
  }),

  rowCard: (isValid = false) => ({
    display: 'grid',
    gap: 1,
    p: 0.5,
    px: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: isValid ? 'success.outlinedBorder' : 'divider',
    bgcolor: isValid ? 'success.softBg' : 'background.level1',
    transition: 'background-color 160ms ease, border-color 160ms ease',
  }),

  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  rowActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },
}
