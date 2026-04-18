// hub/playerProfile/mobile/modules/videos/sx/sections.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const sectionsSx = {
  mediaRootSx: {
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

  mediaImgSx: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  mediaOverlaySx: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
  },

  mediaFallbackSx: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: 'text.tertiary',
    bgcolor: 'background.level1',
  },

  mediaPlaySx: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    bgcolor: 'rgba(255,255,255,.82)',
    backdropFilter: 'blur(6px)',
    zIndex: 2,
  },

  infoCellSx: {
    minWidth: 0,
    //display: 'grid',
    gap: 0.5,
    //alignContent: 'start',
  },

  titleSx: {
    minWidth: 0,
    fontWeight: 700,
    lineHeight: 1.25,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
  },

  infoMetaRowSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  metaItemSx: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    color: 'text.secondary',
  },

  assignmentCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  assignmentChipSx: {
    maxWidth: '100%',
    fontWeight: 600,
  },

  tagsCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    pt: 0.5
  },

  editOverFlow: {
    justifyContent: 'center',
    borderLeft: '1px solid',
    borderColor: 'divider',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  tagsWrapSx: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    gap: 0.45,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  tagChipSx: {
    maxWidth: '100%',
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },
  },

  extraChipSx: {
    fontWeight: 700,
  },

  emptyTextSx: {
    color: 'text.tertiary',
    fontStyle: 'italic',
  },

  notesCellSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
    alignContent: 'start',
  },

  notesTextSx: (hasNotes) => ({
    minWidth: 0,
    color: hasNotes ? 'text.primary' : 'text.tertiary',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.35,
    wordBreak: 'break-word',
  }),

  moreNotesBtnSx: {
    p: 0,
    m: 0,
    border: 'none',
    outline: 'none',
    bgcolor: 'transparent',
    color: 'primary.500',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    justifySelf: 'start',
  },
}
