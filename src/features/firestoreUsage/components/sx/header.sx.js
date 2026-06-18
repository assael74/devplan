// src/features/firestoreUsage/components/sx/header.sx.js

export const headerSx = {
  root: {
    display: 'flex',
    alignItems: {
      xs: 'flex-start',
      md: 'center',
    },
    justifyContent: 'space-between',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    gap: 1.25,
  },

  boxHead: {
    width: 36,
    height: 36,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.softColor',
    flexShrink: 0,
  },

  boxWrap: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
  },

  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: {
      xs: 1,
      md: 2,
    },
  }
}
