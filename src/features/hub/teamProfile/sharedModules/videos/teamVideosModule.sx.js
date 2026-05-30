// teamProfile/sharedModules/videos/teamVideosModule.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const teamVideosModuleSx = {
  desktopToolbarWrap: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 12,
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
  },
}
