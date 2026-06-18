// src/features/firestoreUsage/sx/firestoreUsage.sx.js

export const firestoreUsagePageSx = {
  width: '100%',
  minWidth: 0,
  height: {
    xs: 'calc(100dvh - 72px)',
    md: 'calc(100dvh - 96px)',
  },
  maxHeight: {
    xs: 'calc(100dvh - 72px)',
    md: 'calc(100dvh - 96px)',
  },
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxSizing: 'border-box',
  pt: {
    xs: 0.5,
    md: 1,
  },
}

export const firestoreUsageHeaderSx = {
  flexShrink: 0,
  px: {
    xs: 1.5,
    md: 2.5,
  },
}

export const firestoreUsageScrollSx = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarGutter: 'stable',
}

export const firestoreUsageContentSx = {
  width: '100%',
  maxWidth: 1600,
  mx: 'auto',
  px: {
    xs: 1.5,
    md: 2.5,
  },
  pt: 2,

  display: 'flex',
  flexDirection: 'column',
  gap: 2,

  pb: {
    xs: 1.5,
    md: 2.5,
  },
}

export const firestoreUsagePrimaryLayoutSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    xl: 'minmax(0, 1.35fr) minmax(300px, 0.65fr)',
  },
  alignItems: 'start',
  gap: 2,
}

export const firestoreUsageMainColumnSx = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  gap: 2,
}

export const firestoreUsageAsideColumnSx = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  gap: 2,
}

export const firestoreUsageSplitLayoutSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    lg: 'repeat(2, minmax(0, 1fr))',
  },
  gap: 2,
}
