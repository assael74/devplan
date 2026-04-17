// playerProfile/mobile/modules/info/info.module.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('player')

export const infoModuleSx = {
  root: {
    px: 0.25,
    pb: 1.5,
    minWidth: 0,
  },

  stack: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: '1fr',
    alignItems: 'stretch',
    minWidth: 0,
  },

  card: {
    p: 1,
    borderRadius: 'lg',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 0.75,
    minWidth: 0,
  },

  gridIfa: {
    display: 'grid',
    gap: 0.875,
    minWidth: 0,
    gridTemplateColumns: 'minmax(0, .55fr) minmax(0, 1.45fr)',
  },

  formGrid1: {
    display: 'grid',
    gap: 0.875,
    minWidth: 0,
    gridTemplateColumns: '1fr',
  },

  formGrid2: {
    display: 'grid',
    gap: 0.875,
    minWidth: 0,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  gridAff: {
    display: 'grid',
    gap: 0.875,
    minWidth: 0,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  formGrid3: {
    display: 'grid',
    gap: 0.875,
    minWidth: 0,
    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, .9fr) minmax(0, .8fr)',
  },

  confBtn: {
    bgcolor: c?.bg,
    color: c?.text,
    fontWeight: 700,
    boxShadow: 'sm',
    border: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      bgcolor: c?.bg,
      color: c?.text,
      filter: 'brightness(0.97)',
    },
  },
}
