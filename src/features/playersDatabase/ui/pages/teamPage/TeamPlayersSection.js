// features/playersDatabase/ui/pages/teamPage/TeamPlayersSection.js

import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

import TeamActionsPanel from './TeamActionsPanel.js'
import TeamPlayersTable from './TeamPlayersTable.js'
import { teamContentSx as sx } from './sx/teamContent.sx.js'

export default function TeamPlayersSection({
  players,
  selectedSeasonKey,
  seasonOptions,
  hasTeamPlayers,
  profileOnly,
  onSeasonChange,
  onProfileOnlyChange,
  onPlayersImport,
  onStatsImport,
  onRoleOpen,
  onPlayerOpen,
  onPlayerUrlEdit,
}) {
  return (
    <Box sx={sx.contentGrid}>
      <Card sx={sx.playersPanel}>
        <Box sx={sx.playersHeader}>
          <Typography level='title-lg' sx={sx.panelTitle}>
            סגל שנתון
          </Typography>

          <Typography level='body-sm' sx={sx.playersCount}>
            {players.length} שחקנים
          </Typography>
        </Box>

        <TeamPlayersTable
          players={players}
          onRoleOpen={onRoleOpen}
          onPlayerOpen={onPlayerOpen}
          onPlayerUrlEdit={onPlayerUrlEdit}
        />
      </Card>

      <TeamActionsPanel
        selectedSeasonKey={selectedSeasonKey}
        seasonOptions={seasonOptions}
        hasTeamPlayers={hasTeamPlayers}
        profileOnly={profileOnly}
        onSeasonChange={onSeasonChange}
        onProfileOnlyChange={onProfileOnlyChange}
        onPlayersImport={onPlayersImport}
        onStatsImport={onStatsImport}
      />
    </Box>
  )
}
