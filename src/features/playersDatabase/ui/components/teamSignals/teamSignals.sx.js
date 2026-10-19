// src/features/playersDatabase/ui/components/teamSignals/teamSignals.sx.js

import { COLORS } from '../../../../../ui/core/theme/Colors.js'

export const teamSignalsSx = {
  summary: { display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.4, minWidth: 0 },

  chip: { fontSize: 10, whiteSpace: 'normal', textDecoration: 'none' },

  levelBadge: level => {
    const colors = level === 2 ? COLORS.status.warning
      : level === 1 ? COLORS.status.info : COLORS.status.neutral

    return {
      maxWidth: '100%',
      minHeight: 22,
      px: 0.65,
      py: 0.25,
      fontSize: 10,
      fontWeight: level === 2 ? 700 : 600,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      bgcolor: level === 0 ? 'neutral.100' : colors.softBg,
      color: colors.text,
      border: '1px solid',
      borderColor: colors.solid,
    }
  },

  missingData: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    color: 'text.secondary',
    lineHeight: 1.2,
    '& svg': { flexShrink: 0 },
  },

  details: { display: 'grid', gap: 0.75, mb: 1.5 },

  signal: { border: '1px solid', borderColor: 'divider', borderRadius: 'sm', p: 1, minWidth: 0 },

  signalHeading: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, cursor: 'pointer' },

  subSignals: { display: 'grid', gap: 0.5, mt: 0.75, pl: 1 },
}
