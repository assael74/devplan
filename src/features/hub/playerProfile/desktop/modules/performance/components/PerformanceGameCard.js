import { Sheet, Box, Typography, Chip, Avatar } from '@mui/joy'
import { timelineSx } from '../Performance.sx'
import { resultChip, typeMeta } from './performance.helpers'
import PerformanceGameMeta from './PerformanceGameMeta'
import PerformanceGameChips from './PerformanceGameChips'

export default function PerformanceGameCard({ e, variant, isMobile, clubAvatarSrc, onOpenVideo }) {
  const res = resultChip(e?.result)
  const type = typeMeta(e?.type)

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
  const r = String(e?.result || '').toLowerCase()
  const hoverBg = hoverBgByResult[r] || 'background.level1'
  const accent = accentByResult[r] || 'transparent'


  return (
    <Sheet variant="outlined" sx={timelineSx.card(accent, hoverBg)}>
      <Box sx={timelineSx.header}>
        <Avatar size="sm" src={clubAvatarSrc} />
        <Typography level="title-sm" noWrap sx={{ flex: 1 }}>
          {e?.title}
        </Typography>
        {e?.score && <Chip size="sm" variant="soft" color={res.color}>{e.score}</Chip>}
      </Box>

      <PerformanceGameMeta e={e} variant={variant} isMobile={isMobile} />

      <PerformanceGameChips
        e={e}
        variant={variant}
        type={type}
        onOpenVideo={onOpenVideo}
      />
    </Sheet>
  )
}
