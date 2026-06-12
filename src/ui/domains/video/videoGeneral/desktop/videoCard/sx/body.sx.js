// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/body.sx.js

export const bodySx = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.6,
    p: 0.85,
    flex: 1,
    minHeight: 0,
  },

  titleRow: {
    minWidth: 0,
    minHeight: 18,
    maxHeight: 18,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },

  titleText: {
    display: 'inline-block',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: '0.82rem',
    lineHeight: 1.1,
    cursor: 'pointer',
  },

  descriptionRow: {
    minWidth: 0,
    minHeight: 18,
    maxHeight: 18,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },

  descriptionText: {
    display: 'inline-block',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'text.secondary',
    fontSize: 11,
    lineHeight: 1.25,
  },

  descriptionPlaceholder: {
    display: 'inline-block',
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1.25,
  },

  divider: {
    my: 0.2,
  },

  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    mt: 'auto',
    minHeight: 24,
    minWidth: 0,
    px: 0.2,
    pl: 0.3
  },

  updatedText: {
    minWidth: 0,
    color: 'text.tertiary',
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },
}
