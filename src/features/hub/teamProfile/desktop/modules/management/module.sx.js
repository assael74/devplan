// teamProfile/desktop/modules/management/module.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const moduleSx = {
  stickyToolbar: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 'md',
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
  },
}
