// ui/domains/video/videoAnalysis/mobile/sharedUi/shared.ui.sx.js

import { getEntityColors } from '../../../../../core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const sharedSx = {
  cardRoot: {
    width: '100%',
    p: 0,
    gap: 0.45,
    borderRadius: 14,
    overflow: 'hidden',
    borderColor: 'rgba(8,145,178,0.22)',
    background: 'linear-gradient(90deg, rgba(8,145,178,0.05), #fff 42%)',
    boxShadow: '0 8px 18px rgba(15, 42, 54, 0.07)',
    position: 'relative',

    '&:before': {
      content: '""',
      position: 'absolute',
      insetBlock: 8,
      insetInlineStart: 0,
      width: 3,
      borderRadius: 999,
      background: '#0891B2',
      zIndex: 1,
    },
  },

  mediaRoot: {
    position: 'relative',
    width: 116,
    minWidth: 116,
    height: 78,
    minHeight: 78,
    borderRadius: 12,
    overflow: 'hidden',
    bgcolor: '#071827',
    border: '1px solid',
    borderColor: 'rgba(8,145,178,0.22)',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
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

  analysisPattern: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(circle at 18% 28%, rgba(20,184,166,0.34) 0 2px, transparent 3px),
      radial-gradient(circle at 72% 38%, rgba(255,255,255,0.18) 0 2px, transparent 3px),
      linear-gradient(135deg, rgba(8,145,178,0.34), transparent 46%),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 18px),
      linear-gradient(145deg, #082033 0%, #0f3b43 54%, #133021 100%)
    `,
  },

  analysisTopRow: {
    position: 'absolute',
    top: 6,
    insetInline: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    zIndex: 2,
  },

  analysisTypeChip: {
    '--Chip-minHeight': '19px',
    '--Chip-paddingInline': '6px',
    maxWidth: 78,
    fontSize: 9,
    fontWeight: 700,
    color: '#E8FFFB',
    bgcolor: 'rgba(2, 44, 52, 0.74)',
    border: '1px solid rgba(125, 255, 239, 0.24)',
    backdropFilter: 'blur(8px)',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& svg': {
      color: '#9EF5EA',
      width: 11,
      height: 11,
    },
  },

  analysisDateChip: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    zIndex: 2,
    '--Chip-minHeight': '17px',
    '--Chip-paddingInline': '5px',
    fontSize: 8.5,
    fontWeight: 700,
    color: '#0B3B3A',
    bgcolor: 'rgba(221, 255, 247, 0.9)',
    border: '1px solid rgba(255,255,255,0.28)',
  },

  analysisCoverTitle: {
    position: 'absolute',
    insetInline: 8,
    top: 14,
    zIndex: 2,
    color: '#fff',
    fontWeight: 700,
    fontSize: 10,
    lineHeight: 1.15,
    textAlign: 'center',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textShadow: '0 2px 8px rgba(0,0,0,0.45)',
  },

  summaryText: {
    color: 'text.secondary',
    fontSize: 11,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
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
    bottom: 6,
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    bgcolor: 'rgba(8,145,178,.86)',
    backdropFilter: 'blur(6px)',
    zIndex: 2,
    border: '1px solid rgba(255,255,255,0.42)',
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
    fontSize: 12.5,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  infoRoot: {
    pt: 0.35,
    display: 'grid',
    gap: 0.45,
    minWidth: 0,
  },

  contextRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },

  summaryRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.25,
  },

  inlineMoreButton: {
    minWidth: 24,
    minHeight: 18,
    '--IconButton-size': '18px',
    px: 0.4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    color: '#0F766E',
  },

  dateText: {
    color: 'text.secondary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  content: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    alignItems: 'center',
    gap: 0.1,
  },

  overflow: {
    width: 28,
    minWidth: 28,
    justifyContent: 'center',
    borderLeft: '1px solid',
    borderColor: 'divider',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    bgcolor: 'background.level1',
  },

  moreButton: {
    minWidth: 24,
    width: 24,
    height: 24,
    borderRadius: 999,
  },

  assignmentChip: {
    '--Chip-minHeight': '18px',
    '--Chip-paddingInline': '6px',
    maxWidth: '100%',
    width: 'fit-content',
    fontSize: 10,
    fontWeight: 700,
    justifySelf: 'start',
    color: '#0F766E',
    bgcolor: 'rgba(15,118,110,0.08)',
    border: '1px solid rgba(15,118,110,0.14)',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
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
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.4,
    pt: 0,
  },

  tagsList: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
    overflow: 'hidden',
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
  },

  allTagsButton: {
    minWidth: 22,
    minHeight: 20,
    '--IconButton-size': '20px',
    borderRadius: 999,
    flex: '0 0 auto',
    fontSize: 10,
    fontWeight: 700,
  },

  modalDialog: {
    width: 'min(340px, calc(100vw - 28px))',
    maxHeight: '70vh',
    borderRadius: 16,
  },

  modalText: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
  },

  tagsModalGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },
}
