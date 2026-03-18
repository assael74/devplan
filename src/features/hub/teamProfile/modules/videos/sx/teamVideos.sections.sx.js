// hub/teamProfile/modules/videos/sx/teamVideos.sections.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const teamVideosSectionsSx = {
  mediaCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 'lg',
  },

  infoCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 0.65,
    px: 1,
  },

  titleSx: {
    minWidth: 0,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.25,
  },

  infoMetaRowSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  metaItemSx: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    color: 'text.secondary',
  },

  assignmentCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: 0.55,
    px: 1,
    textAlign: 'center',
  },

  assignmentIconWrapSx: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: c.accent,
  },

  tagsCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    px: 1,
  },

  tagsWrapSx: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    maxHeight: 56,
    overflow: 'hidden',
  },

  tagChipSx: {
    maxWidth: 132,
    bgcolor: c.bg,
    color: c.text,
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },
  },

  notesCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'center',
    gap: 0.35,
    px: 1,
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
    color: c.accent,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    justifySelf: 'start',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
}
