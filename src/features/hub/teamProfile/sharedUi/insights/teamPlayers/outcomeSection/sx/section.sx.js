// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/sx/section.sx.js

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const sectionSx = {
  subSection: {
    display: 'grid',
    alignSelf: 'start',
    minHeight: 140,
    gap: 1,
    p: {
      xs: 1,
      md: 1.15,
    },
    borderRadius: 'lg',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
  },
}
