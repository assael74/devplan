// previewDomainCard/domains/player/payments/components/drawer/editDrawer.sx.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const drawerSx = {
  body: {
    p: 0.25,
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1,
  },

  sectionCard: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: c.accent,
    display: 'grid',
    gap: 0.85,
  },

  sectionTitle: {
    fontWeight: 700,
    color: 'text.secondary',
    fontSize: 12,
  },
}
