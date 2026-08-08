// features/playersDatabase/ui/pages/entryPage/sx/EntryVisuals.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entryVisualsSx = {
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
}
