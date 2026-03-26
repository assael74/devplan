// src/features/videoHub/components/drawer/EditDrawer.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors'

const c = getEntityColors('videoGeneral')

export const editDrawerSx = {
  drawerSx: {
    bgcolor: 'transparent',
    p: { md: 3, sm: 0 },
    boxShadow: 'none',
  },

  drawerSheet: {
    borderRadius: 'md',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'auto',
    bgcolor: 'background.body',
  },

  footer: {
    mt: 'auto',
    p: 1.25,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  btnSave: {
    bgcolor: c.bg,

    '&:hover': {
      bgcolor: `color-mix(in srgb, ${c.bg} 85%, black)`
    },

    '&:active': {
      bgcolor: `color-mix(in srgb, ${c.bg} 75%, black)`
    }
  }
}
