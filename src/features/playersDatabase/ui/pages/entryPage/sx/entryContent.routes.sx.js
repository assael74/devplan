// src/features/playersDatabase/ui/pages/entryPage/sx/entryContent.routes.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entryContentRoutesSx = {
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
  }
}
