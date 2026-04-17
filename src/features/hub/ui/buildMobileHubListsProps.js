// src/features/hub/ui/buildMobileHubListsProps.js

import { buildRoutesByType } from './hub.routes'

export function buildMobileHubListsProps({
  MODE,
  clubs = [],
  teams = [],
  clubPlayers = [],
  privatePlayers = [],
  staffRows = [],
  scoutRows = [],
  previewSelection,
  onSelectClub,
  onSelectTeam,
  onSelectPlayer,
  onSelectStaff,
  onSelectScout,
  onOpenActions,
  onOpenRoute,
}) {
  const openFullRoute = (type, entity) => {
    const routes = buildRoutesByType({ type, data: entity })
    onOpenRoute?.(routes?.full || null)
  }

  return {
    [MODE.CLUBS]: {
      clubs,
      onSelectClub,
      selectedClubId:
        previewSelection?.type === 'club' ? previewSelection.data?.id : null,
      onOpenClubActions: onOpenActions,
      onOpenClubRoute: (club) => openFullRoute('club', club),
    },

    [MODE.TEAMS]: {
      teams,
      onSelectTeam,
      selectedTeamId:
        previewSelection?.type === 'team' ? previewSelection.data?.id : null,
      onOpenTeamActions: onOpenActions,
      onOpenTeamRoute: (team) => openFullRoute('team', team),
    },

    [MODE.PLAYERS]: {
      players: clubPlayers,
      onSelectPlayer,
      selectedPlayerId:
        previewSelection?.type === 'player' ? previewSelection.data?.id : null,
      onOpenPlayerActions: onOpenActions,
      onOpenPlayerRoute: (player) => openFullRoute('player', player),
    },

    [MODE.STAFF]: {
      staffRows,
      onSelectStaff,
      selectedStaffId:
        previewSelection?.type === 'staff' ? previewSelection.data?.id : null,
      onOpenStaffActions: onOpenActions,
    },

    [MODE.PRIVATES]: {
      players: privatePlayers,
      onSelectPlayer,
      selectedPlayerId:
        previewSelection?.type === 'player' ? previewSelection.data?.id : null,
      onOpenPlayerActions: onOpenActions,
      onOpenPlayerRoute: (player) => openFullRoute('player', player),
    },

    [MODE.SCOUTING]: {
      scoutRows,
      onSelectScout,
      selectedScoutId:
        previewSelection?.type === 'scout' ? previewSelection.data?.id : null,
      onOpenScoutActions: onOpenActions,
      onOpenScoutRoute: (scout) => openFullRoute('player', scout),
    },
  }
}
