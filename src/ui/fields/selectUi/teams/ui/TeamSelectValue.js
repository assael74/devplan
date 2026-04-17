// ui/fields/selectUi/teams/ui/TeamSelectValue.js
import { Box, Typography, Chip, Avatar } from '@mui/joy'
import { formatAff } from '../logic/teamSelect.logic'
import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

export default function TeamSelectValue({ opt, chip }) {
  if (!opt) return null

  const team = opt
  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: team?.club, subline: team?.club?.clubName, })

  const aff = formatAff(opt.clubName, opt.teamYear)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Avatar src={src} alt="" sx={{ width: 18, height: 18, }} />

      <Typography level="body-sm" fontWeight='lg' sx={{ fontSize: 12 }} noWrap>
        {opt.label}
      </Typography>

      {chip && aff && (
        <Chip
          size="sm"
          variant="outlined"
          sx={{ '--Chip-minHeight': '18px', fontSize: 8 }}
        >
          {aff}
        </Chip>
      )}
    </Box>
  )
}
