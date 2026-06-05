// ui/fields/selectUi/players/ui/PlayerOptionRow.js

import { Box, Typography, ListItemDecorator } from '@mui/joy'
import { formatAff } from '../logic/playerSelect.logic'

export default function PlayerOptionRow({ opt }) {
  const sub = formatAff(opt.teamName, opt.clubName)
  const disabled = opt?.disabled === true

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        opacity: disabled ? 0.45 : 1,
        filter: disabled ? 'grayscale(1)' : 'none',
      }}
    >
      <ListItemDecorator sx={{ minInlineSize: 38 }}>
        <Box
          component="img"
          src={opt.avatar}
          alt=""
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </ListItemDecorator>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          level="body-sm"
          fontWeight="lg"
          noWrap
          sx={{
            color: disabled ? 'text.tertiary' : 'text.primary',
          }}
        >
          {opt.label}
        </Typography>

        <Typography
          level="body-xs"
          noWrap
          sx={{
            fontSize: 10,
            opacity: disabled ? 0.65 : 0.7,
            color: disabled ? 'text.tertiary' : 'text.secondary',
          }}
        >
          {disabled ? 'כבר שויך לשורה אחרת' : sub || 'ללא שיוך'}
        </Typography>
      </Box>
    </Box>
  )
}
