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

  emptyState: {
    minHeight: 260,
    p: 2,
    borderRadius: 'md',
    border: '1px dashed',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    gap: 0.85,
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
  },

  emptyTitle: {
    fontWeight: 700,
  },

  emptyText: {
    color: 'text.tertiary',
    maxWidth: 460,
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
