// src/features/reports/management/sx/preview.sx.js

export const previewSx = {
  previewArea: {
    minWidth: 0,
    minHeight: 0,
    p: { xs: 1, md: 2 },
    overflow: 'auto',
    overscrollBehavior: 'contain',
    bgcolor: 'neutral.100',
  },

  previewFrame: {
    width: 'fit-content',
    minWidth: '100%',
    minHeight: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  reportContainer: {
    width: 'min(1120px, 100%)',
    minWidth: 0,
    flexShrink: 0,
  },

  emptyPreview: {
    width: 'min(680px, 100%)',
    minHeight: 240,
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    textAlign: 'center',
    borderRadius: 'lg',
    bgcolor: 'background.surface',
  },
}



