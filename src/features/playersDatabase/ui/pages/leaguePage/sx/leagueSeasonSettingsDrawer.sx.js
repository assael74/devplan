// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueSeasonSettingsDrawer.sx.js

import { entitySeasonUrlDrawerSx } from '../../../components/drawers/sx/entitySeasonUrlDrawer.sx.js'

export const leagueSeasonSettingsDrawerSx = {
  shell: {
    ...entitySeasonUrlDrawerSx.shell,
    root: { '--Drawer-horizontalSize': '480px' },
  },

  header: entitySeasonUrlDrawerSx.header,

  section: {
    ...entitySeasonUrlDrawerSx.fieldCard,
    mb: 2,
    display: 'grid',
    gap: 1.5,
  },

  formControl: entitySeasonUrlDrawerSx.formControl,

  input: entitySeasonUrlDrawerSx.input,

  hint: {
    color: 'text.secondary',
  },

  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1.5,
  },
}
