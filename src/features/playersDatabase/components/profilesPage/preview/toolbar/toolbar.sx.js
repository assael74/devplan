// features/playersDatabase/components/profilesPage/preview/toolbar/toolbar.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: '#d8e0e7',
  muted: '#64717f',
}

export const previewToolbarSx = {
  root: {
    px: 1,
    pb: 0.75,
    pt: 0.45,
    border: `1px solid ${palette.line}`,
    borderTop: `3px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderRight: `1px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    bgcolor: '#f4f8fb',
    display: 'grid',
    gap: 0.75,
    //minHeight: 90,
    //maxHeight: 90,
    //height: 90,
    boxShadow: '0 12px 26px rgba(12, 24, 36, 0.16)',
  },

  textBlock: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.35,
    overflow: 'hidden',
    height: '100%',
  },

  previewTitle: {
    minWidth: 0,
    color: '#17202a',
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  primaryContent: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
    overflow: 'hidden',
  },

  stageTitle: {
    minWidth: 0,
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.15,
    color: '#17202a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  subtitle: {
    color: palette.muted,
    fontWeight: 600,
    fontSize: 12,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 'auto',
  },

  subtitleInitial: {
    color: '#c62828',
    fontWeight: 700,
    fontSize: 12,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 'auto',
  },

  playerRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.75,
    padding: '0.15rem 0.1rem 0',
    marginTop: 'auto',
    overflow: 'hidden',
  },

  playerText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.08,
    overflow: 'hidden',
    paddingTop: '0.02rem',
  },

  playerName: {
    minWidth: 0,
    color: '#17202a',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  playerSubline: {
    minWidth: 0,
    color: palette.muted,
    fontSize: 11.5,
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  playerAvatar: {
    width: 34,
    height: 34,
    border: '1px solid rgba(23, 32, 42, 0.12)',
    flex: '0 0 auto',
  },
}
