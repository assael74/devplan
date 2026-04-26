// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/header.sx.js

export const videoGeneralDesktopHeaderSx = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    minWidth: 0,
  },

  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    minWidth: 0,
    pt: 0.8,
  },

  cardTitle: {
    fontWeight: 800,
    minWidth: 0,
    fontSize: '0.8rem',
    lineHeight: 1.1,
    flex: 1,
  },

  ym: {
    flexShrink: 0,
    color: 'text.tertiary',
    fontWeight: 700,
    maxWidth: 72,
  },
}
