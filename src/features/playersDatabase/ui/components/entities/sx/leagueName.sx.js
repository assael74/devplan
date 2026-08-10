// src/features/playersDatabase/ui/components/entities/sx/leagueName.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueNameSx = {
  root: {
    minWidth: 0,
    maxWidth: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
  },

  name: fontSize => ({
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize,
    fontWeight: 650,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),

  level: ({ fontSize, levelFontSize }) => {
    const resolvedFontSize = Number(levelFontSize) > 0
      ? Number(levelFontSize)
      : Math.max(fontSize - 4, 8)

    return {
      minWidth: resolvedFontSize + 11,
      height: resolvedFontSize + 8,
      px: 0.45,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: 5,
      bgcolor: '#F4F6FF',
      color: '#4F46E5',
      fontSize: resolvedFontSize,
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: 0,
    }
  },
}
