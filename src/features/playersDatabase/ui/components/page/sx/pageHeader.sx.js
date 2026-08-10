// src/features/playersDatabase/ui/components/page/sx/pageHeader.sx.js

export const pageHeaderSx = {
  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 2,
    alignItems: 'end',
  },

  copy: {
    minWidth: 0,
    width: '100%',
    gap: 0.75,
    alignItems: 'flex-start',
  },

  actions: {
    minWidth: 0,
  },
}
