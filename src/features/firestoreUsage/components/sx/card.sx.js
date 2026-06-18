// src/features/firestoreUsage/components/sx/card.sx.js

export const cardSx = {
  card: {
    p: 2,
    borderRadius: 'lg',
    boxShadow: 'sm',
    minWidth: 0,
  },

  boxWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    mb: 2,
  },

  boxRows: {
    minHeight: 180,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
  },

  boxGrid: clickable => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: '150px minmax(0, 1fr) 95px',
    },
    alignItems: 'center',
    gap: 1,
    p: clickable ? 0.75 : 0,
    mx: clickable ? -0.75 : 0,
    borderRadius: 'md',
    cursor: clickable ? 'pointer' : 'default',
    '&:hover': clickable
      ? {
          bgcolor: 'background.level1',
        }
      : undefined,
    '&:focus-visible': clickable
      ? {
          outline: '2px solid',
          outlineColor: 'primary.outlinedBorder',
        }
      : undefined,
  }),

  typo: {
    textAlign: { xs: 'right', sm: 'left', },
    fontWeight: 700,
  }
}
