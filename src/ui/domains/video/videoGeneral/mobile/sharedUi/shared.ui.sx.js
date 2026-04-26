// ui/domains/video/videoAnalysis/mobile/sharedUi/shared.ui.sx.js

import { getEntityColors } from '../../../../../core/theme/Colors.js'

const c = getEntityColors('videoGeneral')

export const sharedSx = {
  mediaRoot: {
    position: 'relative',
    width: 108,
    minWidth: 108,
    height: 76,
    minHeight: 76,
    borderRadius: 12,
    overflow: 'hidden',
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'divider',
    cursor: 'pointer',
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
    background: 'linear-gradient(to top, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 70%)',
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
    bgcolor: 'rgba(255,255,255,.82)',
    backdropFilter: 'blur(6px)',
    zIndex: 2,
  },

  bodyWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.65,
    alignContent: 'start',
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: 11,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  content: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    alignItems: 'start',
  },

  overflow: {
    width: 36,
    minWidth: 36,
    justifyContent: 'center',
    borderLeft: '1px solid',
    borderColor: 'divider',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    bgcolor: 'background.level1',
  },

  assignmentChip: {
    maxWidth: '100%',
    fontWeight: 600,
    justifySelf: 'start',
  },

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    color: 'text.secondary',
  },

  tagsCell: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    pt: 0.35,
  },

  tagsWrap: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    gap: 0.45,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  tagChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '6px',
    maxWidth: '100%',
    fontSize: 10,
    fontWeight: 600,
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      px: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },

    '& .MuiChip-startDecorator svg': {
      width: 11,
      height: 11,
      fontSize: 11,
    },
  }
}
