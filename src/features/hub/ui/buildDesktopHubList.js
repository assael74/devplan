// src/features/hub/ui/buildDesktopHubList.js

import React from 'react'

import PlayersListPane from '../components/lists/players/PlayersListPane.js'
import TeamsListPane from '../components/lists/teams/TeamsListPane.js'
import PrivatesListPane from '../components/lists/privates/PrivatesListPane.js'
import ClubsListPane from '../components/lists/clubs/ClubsListPane.js'
import HubScoutingList from '../components/lists/scout/HubScoutingList.js'

export function buildDesktopHubList({
  mode,
  MODE,
  clubs = [],
  teams = [],
  clubPlayers = [],
  privatePlayers = [],
  controlSelection,
  scoutRows = [],
  onSelectClub,
  onSelectTeam,
  onSelectPlayer,
  onSelectScout,
  onOpenActions,
}) {
  if (mode === MODE.CLUBS) {
    return (
      <ClubsListPane
        clubs={clubs}
        isMobile={false}
        onSelect={onSelectClub}
        selectedId={controlSelection?.type === 'club' ? controlSelection.data?.id : null}
      />
    )
  }

  if (mode === MODE.TEAMS) {
    return (
      <TeamsListPane
        teams={teams}
        isMobile={false}
        onSelect={onSelectTeam}
        selectedId={controlSelection?.type === 'team' ? controlSelection.data?.id : null}
      />
    )
  }

  if (mode === MODE.PLAYERS) {
    return (
      <PlayersListPane
        players={clubPlayers}
        isMobile={false}
        onSelect={onSelectPlayer}
        selectedId={controlSelection?.type === 'player' ? controlSelection.data?.id : null}
        onOpenActions={onOpenActions}
      />
    )
  }

  if (mode === MODE.PRIVATES) {
    return (
      <PrivatesListPane
        isMobile={false}
        players={privatePlayers}
        onSelect={onSelectPlayer}
        selectedId={controlSelection?.type === 'player' ? controlSelection.data?.id : null}
        onOpenActions={onOpenActions}
      />
    )
  }

  if (mode === MODE.SCOUTING) {
    return <HubScoutingList rows={scoutRows} onSelect={onSelectScout} isMobile={false} />
  }

  return null
}
