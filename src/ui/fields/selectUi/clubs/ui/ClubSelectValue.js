// ui/fields/selectUi/clubs/ui/ClubSelectValue.js

import { Box, Typography, Chip } from '@mui/joy'

export default function ClubSelectValue({ opt }) {
  if (!opt) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Box
        component="img"
        src={opt.avatar}
        alt=""
        sx={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
      />

      <Typography level="body-sm" fontWeight="lg" noWrap>
        {opt.clubName}
      </Typography>
    </Box>
  )
}
