// playerProfile/desktop/modules/payments/sx/module.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const moduleSx = {
  boxWrap: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 12,
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
  }
}
