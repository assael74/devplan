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
    p: 1.25,
    mb: 1.5,
    display: 'grid',
    gap: 1,
  },

  formControl: {
    ...entitySeasonUrlDrawerSx.formControl,
    gap: 0.5,
  },

  input: {
    ...entitySeasonUrlDrawerSx.input,
    minHeight: 32,
  },

  hint: {
    color: 'text.secondary',
  },

  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1,
  },
}
