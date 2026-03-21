// ui/fields/selectUi/team/ui/TeamOptionRow.js

import { Box, Typography, ListItemDecorator, Avatar } from '@mui/joy'
import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

import { formatAff } from '../logic/teamSelect.logic'

export default function TeamOptionRow({ opt }) {
  const sub = formatAff(opt.clubName, opt.teamYear)
  const team = opt
  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: team?.club, subline: team?.club?.clubName, })

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemDecorator sx={{ minInlineSize: 38 }}>
        <Avatar src={src} alt="" sx={{ width: 22, height: 22, }} />
      </ListItemDecorator>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="body-sm" fontWeight="lg" noWrap>
          {opt.label}
        </Typography>

        <Typography level="body-xs" sx={{ fontSize: 10, opacity: 0.7 }} noWrap>
          {sub || 'ללא שיוך'}
        </Typography>
      </Box>
    </Box>
  )
}
