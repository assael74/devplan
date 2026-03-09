// src/features/players/playerProfile/modules/performance/components/PerformanceGameChips.js
import { Box, Chip, Typography, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'

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

function difficultyMeta(difficulty) {
  const d = String(difficulty || '').toLowerCase()
  if (d === 'easy') return { label: 'קלה', iconId: 'easy' }
  if (d === 'equal') return { label: 'שווה', iconId: 'equal' }
  if (d === 'hard') return { label: 'קשה', iconId: 'hard' }
  return null
}

export default function PerformanceGameChips({ e, type, onOpenVideo }) {
  const minutes = e?.minutes != null ? `${e.minutes} דק׳` : null
  const position = e?.position ? `עמדה ${e.position}` : null
  const diff = difficultyMeta(e?.difficulty)

  return (
    <Box sx={{ mt: 0.6, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* --- סוג משחק --- */}
      {type && <InfoChip iconId={type.iconId} label={type.label} color={type.color || 'neutral'} />}

      {/* --- רמת משחק --- */}
      {diff && <InfoChip iconId={diff.iconId} label={diff.label} />}

      {/* --- סגל / הרכב --- */}
      {e?.isSelected && <InfoChip iconId="squad" label="סגל" color="primary" />}
      {e?.isStarting && <InfoChip iconId="starting" label="הרכב" color="success" />}

      {/* --- דקות / עמדה --- */}
      <InfoChip iconId="time" label={minutes} />
      <InfoChip iconId="position" label={position} />

      {/* --- וידאו --- */}
      {e?.hasVideo && (
        <Tooltip title="פתח וידאו" placement="top" variant="solid">
          <Chip
            size="sm"
            variant="soft"
            color="warning"
            startDecorator={iconUi({ id: 'video', sx: { fontSize: 16 } })}
            onClick={() => onOpenVideo(e)}
            sx={{ borderRadius: '999px', cursor: 'pointer' }}
          >
            <Typography level="body-xs" sx={{ fontWeight: 700 }}>
              וידאו
            </Typography>
          </Chip>
        </Tooltip>
      )}
    </Box>
  )
}
