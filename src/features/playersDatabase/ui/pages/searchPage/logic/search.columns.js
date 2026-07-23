// features/playersDatabase/ui/pages/searchPage/logic/search.columns.js

import { Box, Button } from '@mui/joy'

import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { searchResultsSx as sx } from '../sx/searchResults.sx.js'

export function buildSearchColumns({ onPlayerOpen }) {
  return [
    {
      key: 'avatar',
      label: '',
      sx: sx.avatarColumn,
      render: row => <Box component='img' src={row.avatarUrl || playerImage} alt='' sx={sx.playerAvatar} />,
    },
    { key: 'playerName', label: 'שחקן', sx: sx.playerColumn },
    { key: 'birthYear', label: 'שנתון', sx: sx.yearColumn },
    { key: 'teamName', label: 'קבוצה', sx: sx.teamColumn },
    { key: 'leagueName', label: 'ליגה', sx: sx.leagueColumn },
    { key: 'leagueLevel', label: 'רמה', sx: sx.levelColumn },
    { key: 'minutes', label: 'דקות', sx: sx.numberColumn },
    { key: 'appearances', label: 'הופעות', sx: sx.numberColumn },
    { key: 'starts', label: 'הרכב', sx: sx.numberColumn },
    { key: 'goals', label: 'שערים', sx: sx.numberColumn },
    { key: 'primaryProfile', label: 'פרופיל סקאוט', sx: sx.profileColumn },
    { key: 'score', label: 'התאמה', sx: sx.scoreColumn },
    {
      key: 'actions',
      label: 'פעולות',
      sx: sx.actionsColumn,
      render: row => (
        <Button size='sm' variant='outlined' sx={sx.tableButton} onClick={() => onPlayerOpen(row)}>
          כניסה
        </Button>
      ),
    },
  ]
}
