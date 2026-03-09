// src/features/videoHub/components/components.sx.js
import { getEntityColors } from '../../../ui/core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab';

export const videoComponentsSx = {
  // shared
  empty: { p: 2 },
  emptyTitle: {},
  emptyText: {},

  // grids
  gridWrap: (entityType) => ({
    display: 'grid',
    gap: 1.25,
    width: '100%',
    ...(entityType === 'videoGeneral'
    ? {
        mx: 0,
        px: 2,
        alignContent: 'start',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
      }
    : {
        maxWidth: 1400,
        mx: 'auto',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }),
  }),

  // cards (shared for analysis/general)
  menuBox: {
    position: 'absolute',
    top: 3,
    left: 2,
    display: 'flex',
    gap: 0.5,
    alignItems: 'center',
    p: 0.5,
    bgcolor: 'rgba(0,0,0,0.1)',
    backdropFilter: 'blur(6px)',
    '@media (hover:hover)': {
      opacity: 0.9,
      transition: 'opacity 120ms ease',
      '&:hover': { opacity: 1 },
    },
  },

  menuButtonSlot: {
    root: {
      size: 'sm',
      variant: 'soft',
      sx: { mt: -0.2, minWidth: 22, minHeight: 22, '--IconButton-size': '22' },
    },
  },

  cardGrid: (entityType) => ({
    display: 'grid',
    gridTemplateColumns: '108px 1fr',
    height: 94,
    minHeight: 94,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'stretch',
    bgcolor: getEntityColors(entityType).bg,
    p: 0,
    '--Card-padding': '0px',
    '&:hover': { bgcolor: getEntityColors(entityType).accent },
  }),

  cardMedia: {
    position: 'relative',
    bgcolor: 'neutral.900',
    aspectRatio: '16 / 9',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRight: '2px solid',
    borderColor: '#fff',
    cursor: 'pointer',
    '&:hover .video-img': {
      transform: 'scale(1.55)',
    },
    '&:hover .video-overlay': {
      opacity: 1,
    },
  },

  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    objectPosition: 'center',
    transition: 'transform 300ms ease',
  },

  boxOverLay: {
    position: 'absolute',
    inset: 0,
    bgcolor: 'rgba(0,0,0,0.15)',
    opacity: 0,
    transition: 'opacity 350ms ease',
  },

  cardMediaFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.tertiary',
    fontSize: 22,
  },

  cardBody: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: 0.6,
  },

  tagsZone: {
    flex: 1,
    minHeight: 36,
    mt: 0,
    overflow: 'auto',
    overflowX: 'hidden',
    pt: 1
  },

  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    minWidth: 0,
  },

  cardTitle: {
    fontWeight: 700,
    minWidth: 0,
    fontSize: '0.8rem',
    lineHeight: 1.1,
    flex: 1,
  },

  cardYm: {
    display: 'flex',
    gap: 0.35,
    flexShrink: 0,
    alignItems: 'center',
  },

  cardYm: {
    display: 'flex',
    gap: 0.35,
    flexShrink: 0,
    alignItems: 'center',
  },

  cardTitleDivider: {
    height: 1.2,
    width: '100%',
    borderRadius: 2,
    bgcolor: 'neutral.400',
    opacity: 0.75,
    my: 0.35,
    flexShrink: 0,
  },

  cardAttachLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 18,
    mt: 0.45,
  },

  attachChip: {
    height: 18,
    fontSize: 10,
    borderRadius: 10,
    maxWidth: '100%',
    '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  },

  attachEmpty: {
    color: 'text.tertiary',
    fontSize: 11,
  },

  cardStatusChip: {
    flexShrink: 0,
    height: 18,
    fontSize: '0.65rem',
    px: 0.6,
  },

  cardActions: (entityType) => ({
    display: 'flex',
    width: '100%',
    gap: 1,
    alignItems: 'center',
    bgcolor: getEntityColors(entityType).bg,
    px: 0.4,
    py: 0.1,
    borderRadius: 10,
    justifyContent: 'flex-end',
    '&:hover': { bgcolor: getEntityColors(entityType).accent },
  }),

  iconActions: {
    borderRadius: 8,
    bgcolor: 'rgba(0,0,0,0.08)',
    p: 0.4,
    minHeight: 15,
    minWidth: 15,
    '&:hover': { bgcolor: 'rgba(0,0,0,0.14)' }
  },

  // VideoTabsHeader
  headerSheet: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    px: 2,
    py: 0.75,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  },

  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },

  headerTabsRoot: {
    bgcolor: 'transparent',
  },

  headerTabs: (entityType) => {
    const c = getEntityColors(entityType)

    return {
      p: 0.5,
      gap: 0.5,
      borderRadius: 'sm',
      bgcolor: 'background.level1',
      [`& .${tabClasses.root}`]: {
        py: 0.5,
        borderRadius: 'sm',
        minHeight: 32,
        color: 'text.secondary',
        transition: 'background-color 140ms ease, box-shadow 160ms ease, transform 140ms ease',
        '&:hover': {
          bgcolor: 'neutral.softHoverBg',
          color: 'text.primary',
          transform: 'translateY(-1px)',
        },
      },
      [`& .${tabClasses.root}[aria-selected="true"]`]: {
        boxShadow: 'sm',
        bgcolor: c.bg,
        color: 'rgba(0,0,0,0.85)',
        '&:hover': {
          bgcolor: c.hover || c.bg,
        },
      },
    }
  },

  // VideoFiltersBar
  filtersWrap: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filtersInput: { width: 260, maxWidth: '100%' },
  filtersSelect: { width: 180, maxWidth: '100%' },

  // VideoCreateModal
  createGrid: { display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } },
  createFull: { gridColumn: { sm: '1 / -1' } },

  // VideoShareModal
  shareRow: { display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } },
}
