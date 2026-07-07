// features/playersDatabase/components/profilesPage/list/sx/position.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: alpha(devPlanColors.primaryDark, 0.12),
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.62),
  surface: '#ffffff',
  hover: alpha(devPlanColors.primary, 0.04),
}

export const positionSx = {
  positionCube: {
    minWidth: 0,
    minHeight: 46,
    px: 0.55,
    py: 0.45,
    borderRadius: 7,
    border: '1px solid',
    borderColor: palette.line,
    bgcolor: palette.surface,
    display: 'flex',
    alignItems: 'stretch',
    gap: 0.55,
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
    '&:hover': {
      borderColor: alpha(devPlanColors.primary, 0.24),
      bgcolor: palette.hover,
    },
  },

  positionCubeMissing: {
    borderColor: alpha('#ef4444', 0.26),
    bgcolor: alpha('#fee2e2', 0.85),
    '&:hover': {
      borderColor: alpha('#ef4444', 0.34),
      bgcolor: alpha('#fecaca', 0.88),
    },
  },

  positionCubeMain: {
    minWidth: 0,
    flex: '1 1 auto',
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'start',
    gap: 0.15,
  },

  positionCubeSide: {
    minWidth: 38,
    flex: '0 0 auto',
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'end',
    gap: 0.15,
  },

  positionCubeDivider: {
    height: 28,
    alignSelf: 'center',
    bgcolor: palette.line,
  },

  positionCubeLabel: {
    color: palette.muted,
    fontSize: 10.5,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },

  positionCubeValue: {
    maxWidth: '100%',
    minWidth: 0,
    color: palette.ink,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  positionCubeNumber: {
    minWidth: 0,
    color: palette.ink,
    fontSize: 14,
    fontWeight: 750,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
}
