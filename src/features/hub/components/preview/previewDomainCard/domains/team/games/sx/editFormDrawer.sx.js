// previewDomainCard/domains/team/games/sx/editFormDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const drawerFormrSx = {
  bodySx: {
    p: 0.25,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1,
  },

  sectionCardSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: c.accent,
    display: 'grid',
    gap: 0.85,
  },

  sectionTitleSx: {
    fontWeight: 700,
    color: 'text.secondary',
    fontSize: 12,
  },
}
