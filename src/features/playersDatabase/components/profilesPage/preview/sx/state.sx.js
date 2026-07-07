// features/playersDatabase/components/profilesPage/preview/sx/state.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  muted: alpha(devPlanColors.primaryDark, 0.68),
  strong: '#17202a',
}

export const stateSx = {
  primaryState: {
    minHeight: 0,
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0.5,
    px: 1,
    py: 1.25,
    textAlign: 'center',
  },

  primaryTitle: {
    fontWeight: 700,
    fontSize: 22,
    lineHeight: 1.15,
    color: palette.strong,
  },

  primarySubtitle: {
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.45,
    color: palette.muted,
  },

  initialState: {
    minHeight: 0,
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0.5,
    px: 1,
    py: 1.25,
    textAlign: 'center',
  },

  initialText: {
    maxWidth: 320,
    color: '#c62828',
    lineHeight: 1.55,
    fontWeight: 600,
    whiteSpace: 'pre-line',
  },
}
