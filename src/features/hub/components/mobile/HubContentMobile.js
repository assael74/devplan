// src/features/hub/components/mobile/HubContentMobile.js

import React from 'react'
import { Box, Typography, Sheet } from '@mui/joy'

import PlayersListPane from '../lists/players/PlayersListPane.js'
import TeamsListPane from '../lists/teams/TeamsListPane.js'
import ClubsListPane from '../lists/clubs/ClubsListPane.js'
import PrivatesListPane from '../lists/privates/PrivatesListPane.js'
import HubStaffList from '../lists/staff/HubStaffList.js'
import HubScoutingList from '../lists/scout/HubScoutingList.js'

import { hubMobileSx as sx } from './sx/hubMobile.sx'

const EMPTY_BY_MODE = {
  clubs: {
    title: 'מועדונים',
    text: 'רשימת המועדונים למובייל תחובר בשלב הבא.',
  },
  staff: {
    title: 'צוות מקצועי',
    text: 'רשימת אנשי הצוות למובייל תחובר בשלב הבא.',
  },
  privates: {
    title: 'שחקנים פרטיים',
    text: 'רשימת השחקנים הפרטיים למובייל תחובר בשלב הבא.',
  },
  scouting: {
    title: 'שחקנים במעקב',
    text: 'רשימת שחקני המעקב למובייל תחובר בשלב הבא.',
  },
}

function MobileEmptyState({ title, text }) {
  return (
    <Sheet variant="soft" sx={sx.empty}>
      <Typography level="title-md">{title}</Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
        {text}
      </Typography>
    </Sheet>
  )
}

export default function HubContentMobile({ mode, listProps = {} }) {

  if (mode === 'players') {
    return (
      <Box sx={sx.listWraper}>
        <PlayersListPane
          isMobile={true}
          players={listProps.players || []}
          onSelect={listProps.onSelectPlayer}
          selectedId={listProps.selectedPlayerId}
          onOpenRoute={listProps.onOpenPlayerRoute}
          onOpenActions={listProps.onOpenPlayerActions}
        />
      </Box>
    )
  }

  if (mode === 'teams') {
    return (
      <Box sx={sx.listWraper}>
        <TeamsListPane
          isMobile={true}
          teams={listProps.teams || []}
          onSelect={listProps.onSelectTeam}
          selectedId={listProps.selectedTeamId}
          onOpenRoute={listProps.onOpenTeamRoute}
          onOpenActions={listProps.onOpenTeamActions}
        />
      </Box>
    )
  }

  if (mode === 'clubs') {
    return (
      <Box sx={sx.listWraper}>
        <ClubsListPane
          isMobile={true}
          clubs={listProps.clubs || []}
          onSelect={listProps.onSelectClub}
          selectedId={listProps.selectedClubId}
          onOpenRoute={listProps.onOpenClubRoute}
          onOpenActions={listProps.onOpenClubActions}
        />
      </Box>
    )
  }

  if (mode === 'privates') {
    return (
      <Box sx={sx.listWraper}>
        <PrivatesListPane
          isMobile={true}
          players={listProps.players || []}
          onSelect={listProps.onSelectPlayer}
          selectedId={listProps.selectedPlayerId}
          onOpenRoute={listProps.onOpenPlayerRoute}
          onOpenActions={listProps.onOpenPlayerActions}
        />
      </Box>
    )
  }

  if (mode === 'scouting') {
    return (
      <Box sx={sx.listWraper}>
        <HubScoutingList
          rows={listProps.scoutRows || []}
          onSelect={listProps.onSelectScout}
          selectedId={listProps.selectedScoutId}
          onOpenActions={listProps.onOpenScoutActions}
        />
      </Box>
    )
  }

  if (mode === 'staff') {
    return (
      <Box sx={sx.listWraper}>
        <HubStaffList
          rows={listProps.staffRows || []}
          onSelect={listProps.onSelectStaff}
          selectedId={listProps.selectedStaffId}
          onOpenActions={listProps.onOpenStaffActions}
        />
      </Box>
    )
  }

  const vm = EMPTY_BY_MODE[mode] || {
    title: 'מרכז שליטה',
    text: 'תוכן המובייל יתחבר בהמשך.',
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1.25, }} className="dpScrollThin">
      <MobileEmptyState title={vm.title} text={vm.text} />
    </Box>
  )
}
