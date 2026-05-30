// teamProfile/sharedModules/games/teamGamesModule.sx.js

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const desktopTeamGamesModuleSx = {
  toolbarWrap: {
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

export const statsLoadingModalSx = {
  dialog: {
    minWidth: 260,
    display: 'grid',
    justifyItems: 'center',
    gap: 1.5,
    textAlign: 'center',
  },
}
