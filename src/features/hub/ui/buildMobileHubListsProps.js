// src/features/hub/ui/buildMobileHubListsProps.js

import { buildRoutesByType } from './hub.routes'

export function buildMobileHubListsProps({
  MODE,
  clubs = [],
  teams = [],
  clubPlayers = [],
  privatePlayers = [],
  scoutRows = [],
  controlSelection,
  onSelectClub,
  onSelectTeam,
  onSelectPlayer,
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
        controlSelection?.type === 'club' ? controlSelection.data?.id : null,
      onOpenClubActions: onOpenActions,
      onOpenClubRoute: (club) => openFullRoute('club', club),
    },

    [MODE.TEAMS]: {
      teams,
      onSelectTeam,
      selectedTeamId:
        controlSelection?.type === 'team' ? controlSelection.data?.id : null,
      onOpenTeamActions: onOpenActions,
      onOpenTeamRoute: (team) => openFullRoute('team', team),
    },

    [MODE.PLAYERS]: {
      players: clubPlayers,
      onSelectPlayer,
      selectedPlayerId:
        controlSelection?.type === 'player' ? controlSelection.data?.id : null,
      onOpenPlayerActions: onOpenActions,
      onOpenPlayerRoute: (player) => openFullRoute('player', player),
    },

    [MODE.PRIVATES]: {
      players: privatePlayers,
      onSelectPlayer,
      selectedPlayerId:
        controlSelection?.type === 'player' ? controlSelection.data?.id : null,
      onOpenPlayerActions: onOpenActions,
      onOpenPlayerRoute: (player) => openFullRoute('player', player),
    },

    [MODE.SCOUTING]: {
      scoutRows,
      onSelectScout,
      selectedScoutId:
        controlSelection?.type === 'scout' ? controlSelection.data?.id : null,
      onOpenScoutActions: onOpenActions,
      onOpenScoutRoute: (scout) => openFullRoute('player', scout),
    },
  }
}
