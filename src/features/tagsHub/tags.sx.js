// src/features/tagsHub/tags.sx.js

export const tagSx = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: 'calc(100dvh - 92px)',
    maxHeight: 'calc(100dvh - 92px)',
    overflow: 'hidden',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    px: 2,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  content: {
    minHeight: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    px: 2,
    py: 1.5,
    overflow: 'hidden',
  },

  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    mb: 1.5,
    flexShrink: 0,
  },

  listScroll: {
    minHeight: 0,
    flex: '1 1 auto',
    overflowY: 'auto',
    overflowX: 'hidden',
    pr: 0.5,
    scrollbarGutter: 'stable',
    overscrollBehavior: 'contain',
  },

  section:{
    borderRadius: 16,
    p: 1.5,
    mb: 1.5,
    border: '1px solid',
    borderColor: 'neutral.200',
    bgcolor: 'neutral.50',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1,
  },

  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0
  },

  groupRow: (inactive) => ({
    borderRadius: 12,
    px: 1,
    py: 0.75,
    border: '1px solid',
    borderColor: inactive ? 'neutral.200' : 'neutral.300',
    bgcolor: inactive ? 'background.level1' : 'background.level1',
    opacity: inactive ? 0.75 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  }),

  childrenWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    mt: 0.75,
    mb: 1,
    alignContent: 'start',
  },

  tagChip: (color, inactiveChild) => ({
    height: 38,
    px: 0.6,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    userSelect: 'none',
    overflow: 'hidden',
    bgcolor: color,
    boxShadow: 'sm',
    cursor: 'pointer',
    opacity: inactiveChild ? 0.7 : 1,
    '&:hover': { filter: 'brightness(0.92)' },
    '&:hover .tagActions': { opacity: 1 },
  }),

  groupChip: (color) => ({
    height: 40,
    px: 0.8,
    borderRadius: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.6,
    color: '#0b0d12',
    fontWeight: 700,
    bgcolor: color,
    boxShadow: 'sm',
    userSelect: 'none',
    cursor: 'pointer',
    borderColor: 'neutral.300',
    '&:hover': { filter: 'brightness(0.92)' },
  }),

  childChip: (color, inactiveChild) => ({
    height: 28,
    px: 0.7,
    borderRadius: 10,
    bgcolor: 'background.surface',
    color,
    border: '1px solid',
    borderColor: color,
    boxShadow: 'xs',
    opacity: inactiveChild ? 0.7 : 1,
    '&:hover': { filter: 'brightness(0.97)' },
  }),

  empty: {
    p: 2,
    borderRadius: 12,
    border: '1px dashed',
    borderColor: 'neutral.300',
    textAlign: 'center',
    color: 'neutral.600',
  },

  renderBox: (typeColor) => ({
    width: 18,
    height: 18,
    borderRadius: 9,
    bgcolor: typeColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  }),

  videoTagsPage: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    minHeight: 0,
    pb: 2,
  },

  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },

  statChip: {
    fontWeight: 700,
  },

  videoTagsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },

  videoCategoryChip: color => ({
    '--Chip-minHeight': '28px',
    fontWeight: 700,
    color,
    bgcolor: `${color}14`,
    border: '1px solid',
    borderColor: `${color}33`,
  }),

  videoTypeSection: color => ({
    borderRadius: 14,
    p: 1.25,
    border: '1px solid',
    borderColor: `${color}33`,
    bgcolor: 'background.surface',
    boxShadow: 'xs',
  }),

  videoTypeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1,
  },

  videoTypeTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  seedTagChip: (color, issue) => ({
    fontWeight: 700,
    color: issue ? 'warning.700' : color,
    bgcolor: issue ? 'warning.50' : `${color}12`,
    border: '1px solid',
    borderColor: issue ? 'warning.300' : `${color}2f`,
  }),

  issueSection: {
    borderRadius: 14,
    p: 1.25,
    border: '1px solid',
    borderColor: 'danger.300',
    bgcolor: 'danger.50',
    display: 'grid',
    gap: 1,
  },

  emptyInline: {
    borderRadius: 10,
    border: '1px dashed',
    borderColor: 'neutral.300',
    color: 'text.tertiary',
    px: 1,
    py: 0.75,
  },

  tooltipInfo: {
    display: 'grid',
    gap: 0.25,
    maxWidth: 260,
  },
}
