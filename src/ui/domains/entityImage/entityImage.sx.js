// src/ui/entityImage/entityImage.sx.js

export const sx = {
  dialog: {
    width: { xs: '92vw', sm: 520 },
    maxWidth: '92vw',
    borderRadius: 16,
    p: 1.5,
  },

  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1,
  },

  headerCenter: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    display: 'grid',
    gap: 0.15,
  },

  headerTitle: {
    fontWeight: 900,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  headerSub: {
    opacity: 0.75,
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  closeBtn: { flexShrink: 0 },

  body: {
    display: 'grid',
    gap: 1.25,
  },

  imageCenterWrap: {
    display: 'grid',
    placeItems: 'center',
    py: 0.5,
  },

  heroAvatar: {
    width: 140,
    height: 140,
    borderRadius: 22,
    flexShrink: 0,
  },

  hint: {
    opacity: 0.8,
    fontSize: 12,
    lineHeight: 1.2,
    textAlign: 'center',
  },

  progressWrap: {
    mt: 0.25,
  },

  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1,
    alignItems: 'center',
    flexWrap: 'wrap',
    mt: 2,
    pt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  footerLeft: {
    display: 'flex',
    gap: 1,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  footerRight: {
    display: 'flex',
    gap: 1,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  pickWrap: {
    display: 'grid',
    placeItems: 'center',
    mt: 0.25,
  },

  pickBtn: {
    minWidth: 200,
    borderRadius: 12,
    mt: 2
  },
}
