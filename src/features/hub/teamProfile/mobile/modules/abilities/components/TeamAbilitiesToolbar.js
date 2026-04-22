// teamProfile/mobile/modules/abilities/components/TeamAbilitiesToolbar.js

import React from 'react'
import { Box, Typography, Chip, IconButton, ChipDelete } from '@mui/joy'
import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import { FiltersTrigger } from '../../../../../../../ui/patterns/filters/index.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../sx/toolbar.sx.js'
import { toFixed1, clamp0to5 } from './../../../../sharedLogic'

function StarRow({ label, value }) {
  const numLabel = toFixed1(value)
  const starValue = clamp0to5(value)

  return (
    <Box sx={sx.starItem}>
      <Typography fontSize="13px" level="body-xs" color="neutral">
        {label} ({numLabel})
      </Typography>
      <JoyStarRatingStatic value={starValue} size="xs" />
    </Box>
  )
}

function MetaChip({ label, value, idIcon, color = 'neutral' }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={idIcon ? iconUi({ id: idIcon, sx: { fontSize: 16 } }) : null}
      sx={{ '--Chip-paddingInline': '8px', maxWidth: '100%' }}
    >
      <Typography level="body-xs" noWrap sx={{ minWidth: 0 }}>
        {label}:
        <Typography color="primary" sx={{ display: 'inline', fontWeight: 700, mr: 0.5 }}>
          {value}
        </Typography>
      </Typography>
    </Chip>
  )
}

function IndicatorChip({ item, onClearIndicator }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={item?.color || 'primary'}
      startDecorator={item?.idIcon ? iconUi({ id: item.idIcon }) : null}
      endDecorator={
        onClearIndicator ? (
          <ChipDelete onDelete={() => onClearIndicator(item)} />
        ) : null
      }
      sx={{ maxWidth: '100%' }}
    >
      <Typography level="body-xs" noWrap>
        {item?.label}
      </Typography>
    </Chip>
  )
}

export default function TeamAbilitiesToolbar({
  team,
  total = 0,
  filled = 0,
  formsCount = 0,
  evaluatorsCount = 0,
  onOpenInvite,
  invitePending = false,
  onOpenInsights,
  insightsPending = false,
  indicators = [],
  onClearIndicator,
  shownCount = 0,
  totalDomains = 0,
  hasActiveFilters = false,
  onOpenFilters,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.topRow}>
        <Box sx={sx.starsWrap}>
          <StarRow label="יכולת נוכחית" value={team?.level} />
          <StarRow label="פוטנציאל" value={team?.levelPotential} />
        </Box>

        <Box sx={{ flex: 1 }} />

        <IconButton
          size="sm"
          variant="solid"
          onClick={onOpenInvite}
          loading={invitePending}
          sx={sx.addBtn}
        >
          {iconUi({ id: 'addAbilities' })}
        </IconButton>

        <IconButton
          size="sm"
          variant="solid"
          onClick={onOpenInsights}
          loading={insightsPending}
          sx={sx.insightsBtn}
        >
          {iconUi({ id: 'insights' })}
        </IconButton>

        <Box sx={sx.actionsInline}>
          <FiltersTrigger hasActive={hasActiveFilters} onClick={onOpenFilters} />

          <MetaChip label="" value={`${filled}/${total}`} idIcon="abilities" />

          <MetaChip label="" value={formsCount} idIcon="form" />

          <MetaChip label="" value={evaluatorsCount} idIcon="group" />

          <MetaChip label="" value={`${shownCount}/${totalDomains}`} idIcon="filter" color="warning" />
        </Box>
      </Box>
    </Box>
  )
}
