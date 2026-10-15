// src/features/playersDatabase/ui/components/page/sx/pageHeader.sx.js

export const pageHeaderSurfaceSx = {
  bgcolor: '#DCEAF4',
  borderBottom: '2px solid #9DBFD4',
  borderRadius: 10,
  boxShadow: '0 6px 16px rgba(23, 59, 87, 0.08)',
  boxSizing: 'border-box',
  minHeight: 100,
  px: { xs: 1.5, md: 2 },
  py: 1,
}

export const pageHeaderTitleSx = {
  fontSize: { xs: 34, md: 44 },
  lineHeight: 1.05,
  fontWeight: 700,
}

export const pageHeaderMediaSx = {
  width: { xs: 42, md: 52 },
  height: { xs: 42, md: 52 },
  flexShrink: 0,
}

export const pageHeaderFavoriteSx = {
  width: 34,
  height: 34,
  minWidth: 34,
  minHeight: 34,
  '--Icon-fontSize': '25px',
}

export const pageHeaderContextChipSx = {
  minHeight: 30,
  px: 1.25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: 'nowrap',
}

export const pageHeaderSx = {
  header: {
    ...pageHeaderSurfaceSx,
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

    '& > :first-child': {
      minHeight: 24,
    },

    '& > :last-child': {
      minHeight: { xs: 42, md: 52 },
      display: 'flex',
      alignItems: 'center',
    },
  },

  actions: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
}
