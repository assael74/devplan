// ui/fields/selectUi/teams/ui/TeamSelectValue.js
import { Box, Typography, Chip } from '@mui/joy'
import { formatAff } from '../logic/teamSelect.logic'

export default function TeamSelectValue({ opt }) {
  if (!opt) return null

  const aff = formatAff(opt.clubName, opt.teamYear)

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
