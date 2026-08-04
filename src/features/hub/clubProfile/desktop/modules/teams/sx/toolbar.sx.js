// hub/clubProfile/desktop/modules/teams/sx/toolbar.sx.js

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.45,
    p: 0.65,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.65,
    minWidth: 0,
    flexWrap: 'nowrap',
  },

  searchInput: {
    minWidth: 260,
    maxWidth: 430,
    flex: '1 1 360px',
    bgcolor: 'background.surface',
    borderRadius: 8,
    minHeight: 30,
    fontSize: 12,
  },

  filterChip: {
    cursor: 'pointer',
    fontWeight: 700,
    flexShrink: 0,
    minHeight: 28,
    border: '1px solid',
    borderColor: 'divider',
    transition: 'background-color .14s ease, border-color .14s ease',
    '&:hover': {
      borderColor: 'neutral.400',
    },
  },

  resetBut: {
    cursor: 'pointer',
    fontWeight: 700,
    flexShrink: 0,
    minHeight: 28,
    border: '1px solid',
    borderColor: 'divider',
    '&[aria-disabled="true"], &:disabled': {
      opacity: 0.45,
    },
  },

  summaryRow: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    pt: 0.35,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  resultChip: {
    flexShrink: 0,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  summaryItems: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    overflow: 'hidden',
  },

  summaryItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
  },

  summaryText: {
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
    '& strong': {
      color: 'text.secondary',
      fontWeight: 800,
    },
  },

  select: {
    minWidth: 200,
    flexShrink: 0,
    bgcolor: 'background.surface',
  },
}
