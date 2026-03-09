// ui/fields/selectUi/players/ui/PlayerSelectValue.js
import { Box, Typography, Chip } from '@mui/joy'
import { formatAff } from '../logic/playerSelect.logic'

export default function PlayerSelectValue({ opt }) {
  if (!opt) return null

  const aff = formatAff(opt.teamName, opt.clubName)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Box
        component="img"
        src={opt.avatar}
        alt=""
        sx={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
      />

      <Typography level="body-sm" fontWeight="lg" noWrap>
        {opt.label}
      </Typography>

      {aff && (
        <Chip
          size="sm"
          variant="outlined"
          sx={{ '--Chip-minHeight': '20px', fontSize: 10 }}
        >
          {aff}
        </Chip>
      )}
    </Box>
  )
}
