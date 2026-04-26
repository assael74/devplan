// src/ui/domains/video/videoGeneral/desktop/videoCard/sx/card.sx.js

import { alpha, lighten } from '@mui/system'
import { getEntityColors } from '../../../../../../core/theme/Colors.js'

const c = getEntityColors('videoGeneral')

export const videoGeneralDesktopCardSx = {
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '108px minmax(0, 1fr) 34px',
    height: 94,
    minHeight: 94,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'stretch',
    bgcolor: c.bg,
    p: 0,
    '--Card-padding': '0px',
    transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 140ms ease',

    '&:hover': {
      bgcolor: lighten(c.accent, 0.82),
      boxShadow: `0 8px 20px ${alpha(c.accent, 0.14)}`,
    },
  },

  cardBody: {
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: 0.65,
  },

  actionRail: {
    borderInlineStart: '1px solid',
    borderColor: 'divider',
    bgcolor: alpha(c.accent, 0.06),
    display: 'grid',
    placeItems: 'center',
  },

  editButton: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: c.accent,
    fontSize: 10,
    fontWeight: 800,
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    userSelect: 'none',
    transition: 'background-color 120ms ease, color 120ms ease',

    '&:hover': {
      bgcolor: alpha(c.accent, 0.12),
    },
  },
}
