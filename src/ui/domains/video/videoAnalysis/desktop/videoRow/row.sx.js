// ui/domains/video/videoAnalysis/desktop/videoRow/Row.sx.js

import { getEntityColors } from '../../../../../core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const rowSx = {
  root: {
    width: '100%',
    p: 0,
    overflow: 'hidden',
    borderRadius: 16,
    bgcolor: 'background.surface',
    transition: 'box-shadow .16s ease, border-color .16s ease, transform .16s ease',

    '&:hover': {
      boxShadow: 'sm',
      borderColor: 'neutral.outlinedHoverBorder',
    },
  },

  mainWrap: {
    display: 'grid',
    gridTemplateColumns: '124px minmax(0,1fr)',
    gap: 1,
    alignItems: 'stretch',
    p: 0,
    minWidth: 0,
    flex: 1,
  },

  contentShell: {
    display: 'grid',
    gap: 0.75,
    p: 0.65,
    minWidth: 0,
    alignContent: 'center',
  },

  upperRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(180px,1fr)',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  actionsRail: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderInlineStart: '1px solid',
    borderColor: 'divider',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    bgcolor: c.bg,
    px: 0.25,

    '& .MuiIconButton-root': {
      borderRadius: 0,
    },

    '& .MuiIconButton-root:hover': {
      borderRadius: 0,
    },
  },

  actionsColumn: {
    display: 'grid',
    alignContent: 'space-between',
    gap: 0.25,
    py: 0.35,
  },
}
