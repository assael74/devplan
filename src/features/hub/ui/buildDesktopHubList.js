// src/features/hub/ui/buildDesktopHubList.js

import React from 'react'

import PlayersListPane from '../components/lists/players/PlayersListPane.js'
import TeamsListPane from '../components/lists/teams/TeamsListPane.js'
import PrivatesListPane from '../components/lists/privates/PrivatesListPane.js'
import ClubsListPane from '../components/lists/clubs/ClubsListPane.js'
import HubStaffList from '../components/lists/staff/HubStaffList.js'
import HubScoutingList from '../components/lists/scout/HubScoutingList.js'

export function buildDesktopHubList({
  mode,
  MODE,
  clubs = [],
  teams = [],
  clubPlayers = [],
  privatePlayers = [],
  previewSelection,
  staffRows = [],
  scoutRows = [],
  onSelectClub,
  onSelectTeam,
  onSelectPlayer,
  onSelectStaff,
  onSelectScout,
  onOpenActions,
}) {
  if (mode === MODE.CLUBS) {
    return (
      <ClubsListPane
        clubs={clubs}
        isMobile={false}
        onSelect={onSelectClub}
        selectedId={previewSelection?.type === 'club' ? previewSelection.data?.id : null}
      />
    )
  }

  if (mode === MODE.TEAMS) {
    return (
      <TeamsListPane
        teams={teams}
        isMobile={false}
        onSelect={onSelectTeam}
        selectedId={previewSelection?.type === 'team' ? previewSelection.data?.id : null}
      />
    )
  }

  if (mode === MODE.PLAYERS) {
    return (
      <PlayersListPane
        players={clubPlayers}
        isMobile={false}
        onSelect={onSelectPlayer}
        selectedId={previewSelection?.type === 'player' ? previewSelection.data?.id : null}
        onOpenActions={onOpenActions}
      />
    )
  }

  if (mode === MODE.STAFF) {
    return <HubStaffList rows={staffRows} onSelect={onSelectStaff} isMobile={false} />
  }

  if (mode === MODE.PRIVATES) {
    return (
      <PrivatesListPane
        isMobile={false}
        players={privatePlayers}
        onSelect={onSelectPlayer}
        selectedId={previewSelection?.type === 'player' ? previewSelection.data?.id : null}
        onOpenActions={onOpenActions}
      />
    )
  }

  if (mode === MODE.SCOUTING) {
    return <HubScoutingList rows={scoutRows} onSelect={onSelectScout} isMobile={false} />
  }

  return null
}
