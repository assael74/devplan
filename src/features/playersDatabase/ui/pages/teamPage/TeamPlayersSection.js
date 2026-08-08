// features/playersDatabase/ui/pages/teamPage/TeamPlayersSection.js

import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

import TeamPlayersTable from './TeamPlayersTable.js'
import { teamPlayersSectionSx as sx } from './sx/teamPlayersSection.sx.js'

export default function TeamPlayersSection({
  players,
  onRoleOpen,
  onPlayerOpen,
  onPlayerUrlEdit,
  onFavoriteToggle,
}) {
  return (
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
        onFavoriteToggle={onFavoriteToggle}
      />
    </Card>
  )
}
