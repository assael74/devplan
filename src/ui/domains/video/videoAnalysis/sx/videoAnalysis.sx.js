// src/ui/domains/video/videoAnalysis/videoAnalysis.sx.js
import { getEntityColors } from '../../../../core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab'

const isStr = (v) => typeof v === 'string' && v.trim().length > 0

// from = "hub" | "team" | "videoHub" | "teamDomainModal" | any string path key
export const buildVideoAnalysisSx = (from = 'videoHub') => {
  const entityType = 'videoAnalysis'
  const c = getEntityColors(entityType)

  const isHub = from === 'hub' || from === 'videoHub'
  const isTeamDomain = from === 'teamPreview'
  const isPlayerPreview = from === 'playerPreview'
  const isDomainModal = from === 'domainModal'

  // knobs
  const sizeMap = {
    videoHub: {
      mediaW: 120,
      cardH: 96,
      bodyPad: 0.6,
      tagsMinH: 10,
      titleSize: '0.7rem',
    },
    playerPreview: {
      mediaW: 120,
      cardH: 96,
      bodyPad: 0.6,
      tagsMinH: 10,
      titleSize: '0.7rem',
    },
    teamPreview: {
      mediaW: 120,
      cardH: 96,
      bodyPad: 0.6,
      tagsMinH: 10,
      titleSize: '0.7rem',
    },
    domainModal: {
      mediaW: 100,
      cardH: 80,
      bodyPad: 0.5,
      tagsMinH: 10,
      titleSize: '0.6rem',
    },
  }

  const s = sizeMap[from] || sizeMap.videoHub
  const mediaW = s.mediaW
  const cardH = s.cardH
  const imgScale = 1.18
  const tagsMinH = 26

  return {
    // shared
    empty: { p: 2 },
    emptyTitle: {},
    emptyText: {},

    // grids
    gridWrap: (gridKey) => ({
      display: 'grid',
      gap: isHub ? 1.5 : 1.25,
      width: '100%',
      ...(gridKey === 'videoGeneral'
        ? {
            mx: 0,
            px: 2,
            alignContent: 'start',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
          }
        : {
            maxWidth: isHub ? 1600 : 1400,
            mx: 'auto',
            gridTemplateColumns: isHub
              ? 'repeat(auto-fill, minmax(320px, 1fr))'
              : 'repeat(auto-fill, minmax(280px, 1fr))',
          }),
    }),

    // cards
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

    cardGrid: () => ({
      display: 'grid',
      gridTemplateColumns: `${mediaW}px 1fr`,
      height: cardH,
      minHeight: cardH,
      borderRadius: 14,
      overflow: 'hidden',
      alignItems: 'stretch',
      bgcolor: c?.bg,
      p: 0,
      gap: 0.3,
      '--Card-padding': '0px',
      '&:hover': { bgcolor: c?.accent },
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
        transform: `scale(${imgScale})`,
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
      p: s.bodyPad,
      //border: 1
    },

    linkageZone: {
      minHeight: from === 'videoHub' ? 14 : 14,
      mt: from === 'videoHub' ? 0.35 : 0.15,
      display: 'flex',
      alignItems: 'center',
      //border: 1
    },

    tagsZone: {
      flex: from === 'videoHub' ? 1 : 'unset',
      minHeight: s.tagsMinH,
      maxHeight: from === 'videoHub' ? 25 : 32,
      overflow: 'hidden',
      //border: 1
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
      fontSize: s.titleSize,
      lineHeight: 1.1,
      flex: 1,
    },

    cardYm: {
      display: 'flex',
      gap: 0.35,
      flexShrink: 0,
      alignItems: 'center',
    },

    ymChip: {
      height: 16,
      fontSize: 10,
      px: 0.6,
      borderRadius: 10,
    },

    cardTitleDivider: {
      height: 1.2,
      width: '100%',
      borderRadius: 2,
      bgcolor: 'neutral.400',
      opacity: 0.75,
      my: isHub ? 0.2 : 0.25,
      flexShrink: 0,
    },

    headerTabs: () => ({
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
        bgcolor: c?.bg,
        color: 'rgba(0,0,0,0.85)',
        '&:hover': { bgcolor: c?.hover || c?.bg },
      },
    }),
  }
}
