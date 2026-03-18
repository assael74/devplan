// hub/teamProfile/modules/videos/sx/teamVideos.list.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

export const teamVideosListSx = {
  emptyState: {
    display: 'grid',
    gap: 0.5,
    justifyItems: 'center',
    p: 2.5,
    borderRadius: 16,
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },
}
