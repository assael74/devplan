// ui/games/GameCard.js
import { Sheet, Box, Typography, Chip, Avatar, IconButton, Tooltip } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'

import GameMeta from './GameMeta.js'
import GameChips from './GameChips.js'
import { gamesUiSx as sx } from './games.sx.js'

const safe = (v) => (v == null ? '' : String(v))

const resultColor = (r) => {
  const x = safe(r).toLowerCase()
  if (x === 'win') return 'success'
  if (x === 'draw') return 'warning'
  if (x === 'loss') return 'danger'
  return 'neutral'
}

export default function GameCard({ e, variant, clubAvatarSrc, onEdit }) {
  const r = safe(e?.result).toLowerCase()

  const hoverBgByResult = {
    win: 'success.softBg',
    draw: 'warning.softBg',
    loss: 'danger.softBg',
  }
  const accentByResult = {
    win: 'success.400',
    draw: 'warning.400',
    loss: 'danger.400',
  }

  const hoverBg = hoverBgByResult[r] || 'background.level1'
  const accent = accentByResult[r] || 'transparent'

  const title = e?.rival ? `${e.isHome ? 'נגד' : 'מול'} ${e.rival}` : (e?.title || 'משחק')

  return (
    <Sheet variant="outlined" sx={sx.gameCard(accent, hoverBg)}>
      <Box sx={sx.gameHeader}>
        <Avatar size="sm" src={clubAvatarSrc} />
        <Typography level="title-sm" noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>

        {e?.score && (
          <Chip size="sm" variant="soft" color={resultColor(e?.result)}>
            {e.score}
          </Chip>
        )}

        <Tooltip title="עריכה" placement="top" variant="solid">
          <IconButton size="sm" variant="soft" onClick={() => onEdit && onEdit(e)}>
            <EditRounded />
          </IconButton>
        </Tooltip>
      </Box>

      <GameMeta e={e} variant={variant} />
      <GameChips e={e} />
    </Sheet>
  )
}
