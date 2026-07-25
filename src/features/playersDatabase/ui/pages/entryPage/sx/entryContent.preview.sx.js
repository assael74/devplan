// src/features/playersDatabase/ui/pages/entryPage/sx/entryContent.preview.sx.js

export const entryContentPreviewSx = {
  previewGraphic: {
    position: 'relative',
    width: 390,
    height: 170,
    minWidth: 0,
    minHeight: 0,
    flexShrink: 0,
    display: {
      xs: 'none',
      md: 'block',
    },
  },

  previewCircle: {
    position: 'absolute',
    left: 76,
    top: 0,
    width: 170,
    height: 170,
    borderRadius: '50%',
    border: '1px solid #d9e6f8',
    background: `
      radial-gradient(
        circle at 50% 50%,
        rgba(36, 108, 214, 0.14),
        rgba(255, 255, 255, 0) 68%
      )
    `,
  },

  previewChartCard: {
    position: 'absolute',
    left: 230,
    top: 12,
    width: 126,
    height: 72,
    p: 1.25,
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  previewLineCard: {
    position: 'absolute',
    left: 212,
    top: 96,
    width: 144,
    height: 62,
    p: 1.25,
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  previewPlayerCard: {
    position: 'absolute',
    left: 0,
    top: 54,
    width: 196,
    height: 74,
    p: 1.25,
    display: 'grid',
    gridTemplateColumns: '42px minmax(0, 1fr)',
    gap: 1,
    alignItems: 'center',
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  previewChartBars: {
    height: 42,
    display: 'flex',
    gap: 0.7,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  previewChartBar: {
    width: 10,
    borderRadius: 2,
    bgcolor: '#8fb4ea',
  },

  previewLine: {
    height: 32,
    borderRadius: 8,
    borderBottom: '3px solid #6aa5ef',
  },

  previewPlayerAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    bgcolor: '#dce8f7',
  },

  previewPlayerContent: {
    minWidth: 0,
  },

  previewPlayerTitle: {
    width: 88,
    maxWidth: '100%',
    height: 8,
    borderRadius: 4,
    bgcolor: '#d7e2f1',
  },

  previewPlayerText: {
    width: 124,
    maxWidth: '100%',
    height: 8,
    borderRadius: 4,
    bgcolor: '#e7edf6',
  },

  previewPlayerScore: {
    color: '#0c7a43',
    fontWeight: 700,
  }
}
