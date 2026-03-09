// ui/fields/selectUi/team/ui/TeamOptionRow.js
import { Box, Typography, ListItemDecorator } from '@mui/joy'
import { formatAff } from '../logic/teamSelect.logic'

export default function TeamOptionRow({ opt }) {
  const sub = formatAff(opt.clubName, opt.teamYear)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemDecorator sx={{ minInlineSize: 38 }}>
        <Box
          component="img"
          src={opt.avatar}
          alt=""
          sx={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
        />
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
