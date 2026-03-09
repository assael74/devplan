// src/ui/video/driveVideoPlayer.sx.js
const dialogBase = (isAnalysis) => ({
  width: '100%',
  p: 0,
  borderRadius: 'lg',
  overflow: 'hidden',
  width: isAnalysis ? 'min(1180px, 96vw)' : 'min(1180px, 96vw)',
  maxWidth: isAnalysis ? '1180px' : '980px',
})

export const driveVideoPlayerSx = {
  modal: {
    mx: { xs: 1, sm: 0 },
  },

  dialogBase,

  dialogAnalysis: {
    maxWidth: 1100,
    bgcolor: 'neutral.900',
  },

  dialogGeneral: {
    maxWidth: 350,
    bgcolor: 'background.surface',
  },

  title: {
    px: 2,
    pt: 2,
    fontWeight: 600,
    lineHeight: 1.2,
  },

  close: {
    top: 8,
    right: 8,
  },

  videoWrap: {
    px: 2,
    pb: 1,
    display: 'flex',
    justifyContent: 'center',
  },

  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    px: 1.5,
    py: 1.5,
    justifyContent: 'flex-end',
  },

  actionBtn: {
    '--IconButton-size': '32px',
  },

  snackbar: {
    zIndex: 1400,
  },
}
