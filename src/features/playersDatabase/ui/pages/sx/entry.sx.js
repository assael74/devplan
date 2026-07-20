// features/playersDatabase/ui/pages/sx/entry.sx.js

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const entrySx = {
  page: {
    width: '100%',
    maxWidth: 1560,
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    mx: 'auto',
    px: {
      xs: 2,
      md: 2.5,
    },
    py: {
      xs: 1.5,
      md: 1.5,
    },
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr)',
    gap: 2,
    overflow: 'hidden',
  },

  header: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: '520px minmax(0, 1fr)',
    },
    gridTemplateAreas: {
      xs: `
        "content"
        "visual"
      `,
      lg: '"content visual"',
    },
    gap: 2,
    alignItems: 'center',
  },

  headerContent: {
    gridArea: 'content',
    width: '100%',
    minWidth: 0,
    alignItems: 'flex-start',
    justifySelf: 'stretch',
    textAlign: 'left',
  },

  headerVisual: {
    gridArea: 'visual',
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  pageTitle: {
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 40,
      md: 54,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  pageDescription: {
    maxWidth: 680,
    color: devPlanColors.secondary,
    lineHeight: 1.55,
    textAlign: 'left',
  },

  previewGraphic: {
    position: 'relative',
    width: 390,
    height: 170,
    minWidth: 0,
    minHeight: 0,
    flexShrink: 0,
    display: {
      xs: 'none',
      md: 'block',
    },
  },

  previewCircle: {
    position: 'absolute',
    left: 76,
    top: 0,
    width: 170,
    height: 170,
    borderRadius: '50%',
    border: '1px solid #d9e6f8',
    background: `
      radial-gradient(
        circle at 50% 50%,
        rgba(36, 108, 214, 0.14),
        rgba(255, 255, 255, 0) 68%
      )
    `,
  },

  previewChartCard: {
    position: 'absolute',
    left: 230,
    top: 12,
    width: 126,
    height: 72,
    p: 1.25,
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  previewLineCard: {
    position: 'absolute',
    left: 212,
    top: 96,
    width: 144,
    height: 62,
    p: 1.25,
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  previewPlayerCard: {
    position: 'absolute',
    left: 0,
    top: 54,
    width: 196,
    height: 74,
    p: 1.25,
    display: 'grid',
    gridTemplateColumns: '42px minmax(0, 1fr)',
    gap: 1,
    alignItems: 'center',
    borderRadius: 8,
    bgcolor: '#fff',
    border: '1px solid #dbe5f4',
    boxShadow: '0 10px 22px rgba(11, 31, 77, 0.08)',
  },

  previewChartBars: {
    height: 42,
    display: 'flex',
    gap: 0.7,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  previewChartBar: {
    width: 10,
    borderRadius: 2,
    bgcolor: '#8fb4ea',
  },

  previewLine: {
    height: 32,
    borderRadius: 8,
    borderBottom: '3px solid #6aa5ef',
  },

  previewPlayerAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    bgcolor: '#dce8f7',
  },

  previewPlayerContent: {
    minWidth: 0,
  },

  previewPlayerTitle: {
    width: 88,
    maxWidth: '100%',
    height: 8,
    borderRadius: 4,
    bgcolor: '#d7e2f1',
  },

  previewPlayerText: {
    width: 124,
    maxWidth: '100%',
    height: 8,
    borderRadius: 4,
    bgcolor: '#e7edf6',
  },

  previewPlayerScore: {
    color: '#0c7a43',
    fontWeight: 700,
  },

  actionsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 2,
  },

  actionCard: {
    position: 'relative',
    minWidth: 0,
    minHeight: 174,
    p: 2.25,
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    columnGap: 2,
    overflow: 'hidden',
    color: '#fff',
    borderRadius: 8,
    border: '1px solid #dbe5f4',
    bgcolor: '#062b68',
    background: `
      linear-gradient(
        145deg,
        #062b68 0%,
        #073776 58%,
        #05265b 100%
      )
    `,
    boxShadow: '0 10px 28px rgba(11, 31, 77, 0.06)',

    '&:before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      opacity: 0.55,
      background: `
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0) 46%
        ),
        repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.055) 0 1px,
          transparent 1px 24px
        )
      `,
    },
  },

  actionContent: {
    position: 'relative',
    zIndex: 1,
    gridColumn: 2,
    gridRow: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    textAlign: 'right',
  },

  actionTitle: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#fff',
    fontSize: {
      xs: 28,
      md: 32,
    },
    fontWeight: 700,
  },

  actionText: {
    maxWidth: 480,
    color: '#dce8ff',
    lineHeight: 1.45,
    textAlign: 'right',
  },

  actionButton: {
    position: 'relative',
    zIndex: 2,
    gridColumn: 2,
    gridRow: 2,
    justifySelf: 'end',
    minWidth: 130,
    minHeight: 36,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,

    '&:hover': {
      bgcolor: '#edf4ff',
    },
  },

  routeVisual: {
    position: 'relative',
    zIndex: 1,
    gridColumn: 1,
    gridRow: '1 / span 2',
    alignSelf: 'center',
    justifySelf: 'center',
    width: 126,
    height: 126,
    opacity: 0.95,
  },

  searchCircle: {
    position: 'absolute',
    inset: 10,
    borderRadius: '50%',
    border: '8px solid rgba(255, 255, 255, 0.7)',
  },

  searchHandle: {
    position: 'absolute',
    left: 76,
    top: 86,
    width: 54,
    height: 11,
    borderRadius: 999,
    bgcolor: 'rgba(255, 255, 255, 0.76)',
    transform: 'rotate(-42deg)',
    transformOrigin: 'left center',
  },

  searchHead: {
    position: 'absolute',
    left: 46,
    top: 42,
    width: 28,
    height: 28,
    borderRadius: '50%',
    bgcolor: '#38a7ff',
  },

  searchBody: {
    position: 'absolute',
    left: 34,
    top: 74,
    width: 54,
    height: 28,
    borderRadius: '28px 28px 10px 10px',
    border: '6px solid #38a7ff',
    borderBottom: 0,
  },

  leagueVisual: {
    position: 'relative',
    zIndex: 1,
    gridColumn: 1,
    gridRow: '1 / span 2',
    alignSelf: 'center',
    justifySelf: 'center',
    width: 138,
    height: 126,
    overflow: 'visible',
    transform: 'translateY(2px)',
  },

  leagueMainNode: {
    position: 'absolute',
    left: 38,
    top: 32,
    width: 72,
    height: 72,
    zIndex: 2,
    display: 'grid',
    placeContent: 'center',
    textAlign: 'center',
    borderRadius: '50%',
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primaryDark,
    border: '5px solid #38a7ff',
    boxShadow: '0 0 0 8px rgba(56, 167, 255, 0.14)',
  },

  leagueMainValue: {
    color: devPlanColors.primaryDark,
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
  },

  leagueMainLabel: {
    mt: 0.35,
    color: devPlanColors.secondary,
    lineHeight: 1,
  },

  leagueNodeTop: {
    position: 'absolute',
    left: 64,
    top: 2,
    width: 14,
    height: 14,
    zIndex: 2,
    borderRadius: '50%',
    bgcolor: '#38a7ff',
    border: '3px solid rgba(255, 255, 255, 0.85)',
  },

  leagueNodeLeft: {
    position: 'absolute',
    left: 12,
    bottom: 6,
    width: 14,
    height: 14,
    zIndex: 2,
    borderRadius: '50%',
    bgcolor: '#8fb4ea',
    border: '3px solid rgba(255, 255, 255, 0.85)',
  },

  leagueNodeRight: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    width: 14,
    height: 14,
    zIndex: 2,
    borderRadius: '50%',
    bgcolor: '#8fb4ea',
    border: '3px solid rgba(255, 255, 255, 0.85)',
  },

  leagueLineTop: {
    position: 'absolute',
    left: 70,
    top: 15,
    width: 2,
    height: 24,
    opacity: 0.7,
    bgcolor: 'rgba(255, 255, 255, 0.62)',
  },

  leagueLineLeft: {
    position: 'absolute',
    left: 31,
    top: 87,
    width: 42,
    height: 2,
    opacity: 0.7,
    bgcolor: 'rgba(255, 255, 255, 0.62)',
    transform: 'rotate(-38deg)',
    transformOrigin: 'left center',
  },

  leagueLineRight: {
    position: 'absolute',
    right: 27,
    top: 87,
    width: 42,
    height: 2,
    opacity: 0.7,
    bgcolor: 'rgba(255, 255, 255, 0.62)',
    transform: 'rotate(38deg)',
    transformOrigin: 'right center',
  },

  infoGrid: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 360px',
    },
    gap: 2,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
      height: '100%',
    },
  },

  capabilities: {
    height: 100,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    color: devPlanColors.secondary,
    pr: 0.75,

    '& p': {
      lineHeight: 1.55,
    },
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1.25,

    '& > *': {
      minWidth: 0,
      minHeight: 98,
      maxHeight: 108,
      p: 1.25,
    },

    '& h2': {
      fontSize: 27,
      lineHeight: 1,
    },

    '& [class*="MuiTypography-body-sm"]': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 13,
    },

    '& [class*="MuiTypography-body-xs"]': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 11,
    },
  },
}
