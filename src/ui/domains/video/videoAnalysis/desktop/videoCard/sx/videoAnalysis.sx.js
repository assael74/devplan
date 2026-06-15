// src/ui/domains/video/videoAnalysis/videoCard/sx/videoAnalysis.sx.js

import { getEntityColors } from '../../../../../../core/theme/Colors'
import { tabClasses } from '@mui/joy/Tab'

// from = "hub" | "team" | "videoHub" | "teamDomainModal" | any string path key
export const buildVideoAnalysisSx = (from = 'videoHub') => {
  const entityType = 'videoAnalysis'
  const c = getEntityColors(entityType)

  const isHub = from === 'hub' || from === 'videoHub'

  // knobs
  const sizeMap = {
    videoHub: {
      mediaW: 214,
      cardH: 238,
      bodyPad: 0.85,
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
    videoHubMini: {
      mediaW: 164,
      cardH: 168,
      bodyPad: 0.55,
      tagsMinH: 26,
      titleSize: '0.65rem',
    },
  }

  const s = sizeMap[from] || sizeMap.videoHub
  const mediaW = s.mediaW
  const cardH = s.cardH

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
      bottom: 8,
      left: 8,
      zIndex: 20,
      pointerEvents: 'auto',
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
      display: 'flex',
      flexDirection: 'column',
      width: mediaW,
      minHeight: cardH,
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'stretch',
      bgcolor: 'background.surface',
      p: 0,
      '--Card-padding': '0px',
      boxShadow: 'sm',
      transition: 'transform 140ms ease, box-shadow 160ms ease, border-color 160ms ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: 'md',
        borderColor: c?.accent || 'primary.300',
      },
    }),

    miniCard: () => ({
      width: s.mediaW,
      minHeight: s.cardH,
      borderRadius: 8,
      overflow: 'hidden',
      p: 0,
      '--Card-padding': '0px',
      bgcolor: 'background.surface',
      boxShadow: 'sm',
      transition: 'transform 140ms ease, box-shadow 160ms ease, border-color 160ms ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: 'md',
        borderColor: c?.accent || 'primary.300',
      },
    }),

    miniMedia: {
      position: 'relative',
      minHeight: 104,
      bgcolor: '#136f74',
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },

    cardMedia: {
      position: 'relative',
      bgcolor: '#136f74',
      minHeight: 126,
      width: '100%',
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },

    analysisCoverPattern: {
      position: 'absolute',
      inset: 0,
      opacity: 0.5,
      backgroundImage: `
        linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.54))
      `,
      backgroundSize: '24px 24px, 24px 24px, auto',
    },

    analysisCoverTop: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 0.75,
      p: 0.75,
    },

    analysisTypeChip: tone => ({
      minHeight: 22,
      maxWidth: 132,
      fontSize: 11,
      fontWeight: 700,
      borderRadius: 999,
      color: tone === 'meeting' ? '#7a4b08' : '#075f5b',
      bgcolor: tone === 'meeting' ? '#fff1d9' : '#d8fffa',
      border: '1px solid',
      borderColor: tone === 'meeting' ? 'rgba(138, 90, 23, 0.28)' : 'rgba(6, 97, 93, 0.26)',
      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }),

    analysisDateChip: {
      minHeight: 22,
      fontSize: 11,
      fontWeight: 700,
      borderRadius: 999,
      color: '#17313b',
      bgcolor: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.38)',
      flexShrink: 0,
    },

    analysisMiniTypeChip: tone => ({
      minHeight: 20,
      maxWidth: 88,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 999,
      color: tone === 'meeting' ? '#7a4b08' : '#075f5b',
      bgcolor: tone === 'meeting' ? '#fff1d9' : '#d8fffa',
      border: '1px solid',
      borderColor: tone === 'meeting' ? 'rgba(138, 90, 23, 0.28)' : 'rgba(6, 97, 93, 0.26)',
      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }),

    analysisMiniDateChip: {
      minHeight: 20,
      maxWidth: 58,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 999,
      color: '#17313b',
      bgcolor: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.38)',
      flexShrink: 0,
      '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    analysisCoverTitle: {
      position: 'relative',
      zIndex: 1,
      mx: 1,
      mb: 2.4,
      minHeight: 52,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textAlign: 'center',
      color: '#fff',
      fontSize: 24,
      lineHeight: 1.12,
      fontWeight: 700,
      textShadow: '0 2px 8px rgba(0,0,0,0.48)',
      outline: 0,
    },

    analysisMiniTitle: {
      position: 'relative',
      zIndex: 1,
      mx: 0.85,
      mb: 1.5,
      minHeight: 36,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textAlign: 'center',
      color: '#fff',
      fontSize: 16,
      lineHeight: 1.14,
      fontWeight: 700,
      textShadow: '0 2px 8px rgba(0,0,0,0.48)',
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
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      p: s.bodyPad,
      gap: 0.75,
      //border: 1
    },

    analysisSummaryRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      minHeight: 34,
    },

    analysisSummary: {
      minWidth: 0,
      color: 'text.tertiary',
      fontWeight: 500,
      fontSize: 12,
      lineHeight: 1.25,
    },

    analysisAvatar: tone => ({
      width: 32,
      height: 32,
      fontSize: 13,
      fontWeight: 700,
      bgcolor:
        tone === 'team'
          ? '#2364aa'
          : tone === 'none'
            ? 'neutral.500'
            : '#1f8f4d',
      boxShadow: '0 0 0 2px #fff, 0 0 0 3px rgba(23,33,43,0.12)',
      flexShrink: 0,
    }),

    analysisMiniAvatar: tone => ({
      width: 24,
      height: 24,
      fontSize: 10,
      fontWeight: 700,
      bgcolor:
        tone === 'team'
          ? '#2364aa'
          : tone === 'none'
            ? 'neutral.500'
            : '#1f8f4d',
      boxShadow: '0 0 0 1px #fff, 0 0 0 2px rgba(23,33,43,0.12)',
      flexShrink: 0,
    }),

    miniBody: {
      p: s.bodyPad,
    },

    miniMetaRow: {
      minHeight: 30,
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
    },

    miniTags: {
      minWidth: 0,
      flex: 1,
      overflow: 'hidden',
      '& .MuiChip-root': {
        height: 20,
        maxWidth: 70,
        fontSize: 10,
      },
    },

    miniEditButton: {
      minWidth: 24,
      minHeight: 24,
      '--IconButton-size': '24px',
      flexShrink: 0,
    },

    linkageZone: {
      minHeight: from === 'videoHub' ? 14 : 14,
      mt: from === 'videoHub' ? 0.35 : 0.15,
      display: 'flex',
      alignItems: 'center',
      //border: 1
    },

    tagsZone: {
      flex: from === 'videoHub' ? 'unset' : 'unset',
      minHeight: s.tagsMinH,
      maxHeight: from === 'videoHub' ? 38 : 32,
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
