// src/features/firestoreUsage/components/sx/header.sx.js

export const headerSx = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1,
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
  },

  boxHead: {
    width: 32,
    height: 32,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.softBg',
    color: 'primary.softColor',
    flexShrink: 0,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
  },
}
