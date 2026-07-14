// src/features/reports/dashboard/components/sx/view.sx.js

export const viewSx = {
  main: {
    gridArea: 'view',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },

  mainBody: {
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable',
    pr: 0.25,

    '@media (max-width: 820px)': {
      height: 'auto',
      overflow: 'visible',
      pr: 0,
    },
  },

  reportContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    pb: 1,
  },

  reportHeader: {
    minWidth: 0,
    minHeight: 112,
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1.2fr) minmax(160px, 1fr) minmax(150px, 0.8fr) 64px',
    alignItems: 'center',
    gap: 2,
    px: 2,
    py: 1.5,
    bgcolor: 'background.body',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',

    '@media (max-width: 1050px)': {
      gridTemplateColumns: 'minmax(200px, 1.2fr) minmax(140px, 1fr) minmax(140px, 0.8fr) 56px',
      gap: 1.25,
      px: 1.5,
    },

    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr auto',
      gap: 1.25,
    },
  },

  reportHeaderPrimary: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
  },

  reportHeaderIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'primary.600',
    bgcolor: 'primary.softBg',
    borderRadius: 'md',

    '& svg': {
      fontSize: 24,
    },
  },

  reportHeaderBlock: {
    minWidth: 0,
  },

  reportHeaderLabel: {
    mb: 0.35,
    color: 'text.tertiary',
    fontWeight: 600,
  },

  reportHeaderTitle: {
    m: 0,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  reportHeaderValue: hasPublication => ({
    m: 0,
    fontSize: hasPublication ? 18 : 16,
    fontWeight: hasPublication ? 700 : 600,
    lineHeight: hasPublication ? 1.15 : 1.2,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  reportHeaderAvatar: {
    width: 58,
    height: 58,
    justifySelf: 'end',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',

    '@media (max-width: 1050px)': {
      width: 52,
      height: 52,
    },
  },
}
