// teamProfile/mobile/modules/players/components/playerCard/TeamPlayerCardDetails.js

import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import EntityActionsMenu from '../../../../../../sharedProfile/EntityActionsMenu.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

function MetaItem({ icon, value, color = 'neutral' }) {
  return (
    <Box sx={sx.metaItem}>
      <Typography
        level="body-sm"
        color={color}
        startDecorator={iconUi({ id: icon, size: 'sm' })}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}

function PositionsBlock({ row, onEditPosition }) {
  const positions = Array.isArray(row?.positions) ? row.positions : []
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
          startDecorator={iconUi({ id: 'position' })}
          onClick={() => onEditPosition(row)}
          sx={{ px: 0, minHeight: 'auto', fontWeight: 700 }}
        >
          עריכת עמדות
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {positions.length ? (
          positions.map((pos, idx) => (
            <Chip
              key={`${row?.id}-${pos}-${idx}`}
              size="md"
              variant='soft'
              color={idx === 0 ? 'primary' : 'neutral'}
              onClick={onEditPosition ? () => onEditPosition(row) : undefined}
              sx={{ cursor: 'pointer', border: '1px solid', borderColor: 'divider' }}
            >
              {pos}
            </Chip>
          ))
        ) : (
          <Chip
            size="md"
            variant="soft"
            color="danger"
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
          color="warning"
          startDecorator={iconUi({ id: generalPositionIcon })}
          onClick={onEditPosition ? () => onEditPosition(row) : undefined}
          sx={{ cursor: 'pointer', border: '1px solid', borderColor: 'divider' }}
        >
          {generalPositionLabel}
        </Chip>
      </Box>
    </Box>
  )
}

function PerformBlock({ row, onEditPosition }) {
  const goals = Number(row?.playerFullStats?.goals ?? 0)
  const assists = Number(row?.playerFullStats?.assists ?? 0)
  const timeRateLabel = row?.playerFullStats?.timeRateLabel || '0%'

  return (
    <Box sx={{ display: 'grid', gap: 0.6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          ביצוע
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      <Chip
        size="sm"
        variant="soft"
        color="success"
        startDecorator={iconUi({ id: 'goal' })}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        שערים {goals}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="primary"
        startDecorator={iconUi({ id: 'assists' })}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        בישולים {assists}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={iconUi({ id: 'playTimeRate' })}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        דקות {timeRateLabel}
      </Chip>
      </Box>
    </Box>
  )
}

export default function TeamPlayerCardDetails({
  row,
  onEditPlayer,
  onEditPosition,
}) {
  const goals = Number(row?.playerFullStats?.goals ?? 0)
  const assists = Number(row?.playerFullStats?.assists ?? 0)
  const timeRateLabel = row?.playerFullStats?.timeRateLabel || '0%'
  const timeRateColor = row?.playerFullStats?.trColor || 'neutral'
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
          startDecorator={iconUi({id: chip.idIcon, sx: chip.textColor ? { color: chip.textColor } : undefined })}
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
          startDecorator={iconUi({id: 'edit'})}
          onClick={() => onEditPlayer(row)}
        >
          עריכת שחקן
        </Button>
      </Box>
    </Box>
  )
}
