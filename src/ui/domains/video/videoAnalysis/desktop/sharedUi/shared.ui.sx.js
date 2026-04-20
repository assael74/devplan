// ui/domains/video/videoAnalysis/desktop/sharedUi/shared.ui.sx.js

import { getEntityColors } from '../../../../../core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const sharedSx = {
  mediaRoot: {
    position: 'relative',
    width: 124,
    minWidth: 124,
    height: 86,
    minHeight: 86,
    borderRadius: 12,
    overflow: 'hidden',
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'divider',
    cursor: 'pointer',
    flexShrink: 0,
  },

  mediaImg: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  mediaOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,.24) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
  },

  mediaFallback: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: 'text.tertiary',
    bgcolor: 'background.level1',
  },

  mediaPlay: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 18,
    height: 18,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    bgcolor: 'rgba(255,255,255,.86)',
    backdropFilter: 'blur(6px)',
    zIndex: 2,
  },

  titleWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.45,
    alignContent: 'start',
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: 15,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  subtitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  metaWrap: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.45,
  },

  boxWrap: (hasNotes) => ({
    display: 'flex',
    justifyContent: hasNotes ? 'flex-start' : 'flex-end',
    minWidth: 0,
    gap: 1
  }),

  notesText: {
    color: 'text.secondary',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.35,
    minWidth: 0,
    maxWidth: 280,
    fontSize: 12,
  },

  tagsCell: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    pt: 0.75,
  },

  tagsWrap: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  tagChip: {
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: c.bg,
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      maxWidth: 140,
    },
  },

  emptyText: {
    color: 'text.tertiary',
    fontStyle: 'italic',
    fontSize: 12,
  },
}
