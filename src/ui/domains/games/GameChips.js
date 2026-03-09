// ui/games/GameChips.js
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

const safe = (v) => (v == null ? '' : String(v))

function InfoChip({ iconId, label, color = 'neutral', variant = 'soft' }) {
  if (!label) return null
  return (
    <Chip
      size="sm"
      color={color}
      variant={variant}
      startDecorator={iconId ? iconUi({ id: iconId, sx: { fontSize: 16 } }) : null}
      sx={{ borderRadius: '999px' }}
    >
      <Typography level="body-xs" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Chip>
  )
}

const difficultyMeta = (difficulty) => {
  const d = safe(difficulty).toLowerCase()
  if (d === 'easy') return { label: 'קלה', iconId: 'easy' }
  if (d === 'equal') return { label: 'שווה', iconId: 'equal' }
  if (d === 'hard') return { label: 'קשה', iconId: 'hard' }
  return null
}

export default function GameChips({ e }) {
  const diff = difficultyMeta(e?.difficulty || e?.game?.difficulty)
  const type = safe(e?.typeH || e?.type).trim()
  const points = e?.points != null ? `${e.points} נק׳` : null
  const home = e?.isHome ? 'בית' : 'חוץ'

  return (
    <Box sx={{ mt: 0.6, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
      <InfoChip iconId={safe(e?.type)} label={type} />
      {diff ? <InfoChip iconId={diff.iconId} label={diff.label} /> : null}
      <InfoChip iconId="home" label={home} color={e?.isHome ? 'success' : 'danger'} />
      <InfoChip iconId="points" label={points} />
    </Box>
  )
}
