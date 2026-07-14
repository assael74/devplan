// src/features/reports/dashboard/components/sx/demo.sx.js

export const demoSx = {
  previewRoot: {
    minWidth: 0,
    minHeight: 520,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
  },

  previewHeader: {
    flexShrink: 0,
    minHeight: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1.5,
    py: 0.55,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  previewHeaderMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.9,
  },

  previewHeaderIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'primary.600',
    bgcolor: 'primary.softBg',
    borderRadius: 'md',
  },

  previewHeaderText: {
    minWidth: 0,
  },

  previewTitle: {
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.1,
  },

  previewSubtitle: {
    color: 'text.tertiary',
  },

  previewDevice: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    px: 0.85,
    py: 0.45,
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'xl',
  },

  previewDeviceGroup: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    p: 0.3,
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'xl',
  },

  previewDeviceChip: {
    minWidth: 72,
    fontWeight: 700,
  },

  previewDeviceDot: {
    width: 6,
    height: 6,
    bgcolor: 'success.500',
    borderRadius: '50%',
  },

  previewDeviceText: {
    fontWeight: 600,
    color: 'text.secondary',
  },

  previewNoticeInline: {
    display: 'block',
    mt: 0.1,
    color: 'warning.700',
  },

  previewNoticeText: {
    minWidth: 0,
    color: '#C2410C',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  previewCanvas: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    p: 1.35,
    bgcolor: 'background.level1',

    '@media (max-width: 820px)': {
      p: 1,
    },
  },

  demoReportRoot: {
    width: '100%',
    maxWidth: 1120,
    minHeight: 620,
    mx: 'auto',
    overflow: 'hidden',
    bgcolor: 'background.body',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
  },

  demoReportRootMobile: {
    width: '390px',
    maxWidth: '100%',
    minHeight: 760,
    borderRadius: 'xl',
  },

  previewEmpty: {
    minHeight: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
    textAlign: 'center',
    bgcolor: 'background.body',
    border: '1px dashed',
    borderColor: 'divider',
    borderRadius: 'md',
  },

  previewEmptyIcon: {
    width: 52,
    height: 52,
    display: 'grid',
    placeItems: 'center',
    color: 'primary.600',
    bgcolor: 'primary.softBg',
    borderRadius: 'lg',

    '& svg': {
      fontSize: 26,
    },
  },

  previewEmptyTitle: {
    mt: 1.1,
    fontWeight: 700,
    color: 'text.primary',
  },

  previewEmptyText: {
    mt: 0.35,
    color: 'text.secondary',
  },
}
