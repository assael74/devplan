// teamProfile/mobile/modules/players/components/playerCard/TeamPlayerCardDetails.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

const getPrimaryPosition = (row = {}) => {
  const positions = Array.isArray(row?.positions) ? row.positions : []
  const primary = row?.primaryPosition || row?.generalPosition?.primaryPosition || ''

  return positions.includes(primary) ? primary : ''
}

function PositionsBlock({ row, onEditPosition }) {
  const positions = Array.isArray(row?.positions) ? row.positions : []
  const primaryPosition = getPrimaryPosition(row)

  const generalPositionLabel = row?.generalPosition?.layerLabel || 'ללא עמדה כללית'
  const generalPositionIcon = row?.generalPosition?.layerKey || 'layers'

  return (
    <Box sx={{ display: 'grid', gap: 0.6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          עמדות
        </Typography>

        <Button
          size="sm"
          variant="plain"
          color="warning"
          startDecorator={iconUi({ id: 'position', size: 'sm' })}
          onClick={() => onEditPosition(row)}
          sx={{ px: 0, minHeight: 'auto', fontWeight: 700 }}
        >
          עריכת עמדות
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {positions.length ? (
          positions.map((pos, idx) => {
            const isPrimary = !!primaryPosition && pos === primaryPosition

            return (
              <Chip
                key={`${row?.id}-${pos}-${idx}`}
                size="md"
                variant={isPrimary ? 'solid' : 'soft'}
                color={isPrimary ? 'primary' : 'neutral'}
                startDecorator={
                  isPrimary
                    ? iconUi({ id: pos, size: 'sm' })
                    : null
                }
                onClick={onEditPosition ? () => onEditPosition(row) : undefined}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isPrimary ? 'primary.300' : 'divider',
                  fontWeight: isPrimary ? 700 : 500,
                }}
              >
                {isPrimary ? `ראשית ${pos}` : pos}
              </Chip>
            )
          })
        ) : (
          <Chip
            size="md"
            variant="soft"
            color="danger"
            startDecorator={iconUi({ id: 'position', size: 'sm' })}
            onClick={onEditPosition ? () => onEditPosition(row) : undefined}
            sx={{ cursor: 'pointer', border: '1px solid', borderColor: 'divider' }}
          >
            ללא עמדה
          </Chip>
        )}

        <Box sx={{ width: 130, flexShrink: 0 }} />

        <Chip
          size="sm"
          variant="plain"
          color={primaryPosition ? 'primary' : 'warning'}
          startDecorator={iconUi({
            id: primaryPosition || generalPositionIcon || 'position',
            size: 'sm',
          })}
          onClick={onEditPosition ? () => onEditPosition(row) : undefined}
          sx={{
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            fontWeight: 700,
          }}
        >
          {primaryPosition
            ? `ראשית ${primaryPosition} · ${generalPositionLabel}`
            : `לא הוגדרה ראשית · ${generalPositionLabel}`}
        </Chip>
      </Box>
    </Box>
  )
}

function PerformChip({
  icon,
  color = 'neutral',
  children,
}) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={iconUi({ id: icon, size: 'sm' })}
      sx={{ border: '1px solid', borderColor: 'divider' }}
    >
      {children}
    </Chip>
  )
}

function PerformBlock({ row }) {
  const gamesStats = row?.playerGamesStats || {}

  const goals = Number(gamesStats?.goals ?? 0)
  const assists = Number(gamesStats?.assists ?? 0)
  const squadLabel = gamesStats?.squadLabel || '0/0'
  const playedLabel = gamesStats?.playedLabel || '0/0'

  return (
    <Box sx={{ display: 'grid', gap: 0.6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          ביצוע
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <PerformChip icon="players">
          סגל {squadLabel}
        </PerformChip>

        <PerformChip icon="games">
          שותף {playedLabel}
        </PerformChip>

        <PerformChip icon="goal" color="success">
          שערים {goals}
        </PerformChip>

        <PerformChip icon="assists" color="primary">
          בישולים {assists}
        </PerformChip>
      </Box>
    </Box>
  )
}

export default function TeamPlayerCardDetails({
  row,
  onEditPlayer,
  onEditPosition,
}) {
  const chip = row?.projectChipMeta || {
    labelH: 'כללי',
    idIcon: 'noneType',
    tone: 'neutral',
    bgColor: '',
    textColor: '',
  }

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <PositionsBlock row={row} onEditPosition={onEditPosition} />

      <Divider />

      <PerformBlock row={row} />

      <Divider />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        <Chip
          size="sm"
          variant="soft"
          color={chip.tone === 'custom' ? 'neutral' : chip.tone}
          startDecorator={iconUi({
            id: chip.idIcon,
            sx: chip.textColor ? { color: chip.textColor } : undefined,
          })}
          sx={
            chip.tone === 'custom'
              ? {
                  bgcolor: chip.bgColor || undefined,
                  color: chip.textColor || undefined,
                }
              : undefined
          }
        >
          {chip.labelH}
        </Chip>

        <Box sx={{ flex: 1 }} />

        <Button
          size="sm"
          variant="plain"
          startDecorator={iconUi({ id: 'edit', size: 'sm' })}
          onClick={() => onEditPlayer(row)}
        >
          עריכת שחקן
        </Button>
      </Box>
    </Box>
  )
}
