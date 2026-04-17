// playerProfile/desktop/modules/games/components/insightsDrawer/InsightsRows.js

import React from 'react'
import { Box, Sheet, Typography, Chip, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { insightsRowsSx as sx } from './sx/playerGames.insightsRows.sx.js'

function InsightIcon({ icon = 'insights', color = '' }) {
  return (
    <Box sx={sx.iconWrap(color)}>
      {iconUi({ id: icon, size: 'sm' })}
    </Box>
  )
}

function InsightHeader({ title, icon, color }) {
  if (!title) return null

  return (
    <Tooltip title={title} arrow>
      <Box sx={sx.cardHeader}>
        <InsightIcon icon={icon} color={color} />

        <Typography level="body-xs" sx={sx.title}>
          {title}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function InsightChips({ chips = [], compact = false }) {
  if (!Array.isArray(chips) || !chips.length) return null

  return (
    <Box sx={compact ? sx.chipsRowCompact : sx.chipsRow}>
      {chips.map((chip) => (
        <Chip
          key={chip?.id || chip?.label}
          size="sm"
          variant="soft"
          color={chip?.color || 'neutral'}
          startDecorator={
            chip?.icon
              ? iconUi({ id: chip.icon, size: 'sm', sx: { fontSize: 10 } })
              : null
          }
          sx={compact ? sx.chipCompact : sx.chip}
        >
          {chip?.label}
        </Chip>
      ))}
    </Box>
  )
}

function InsightValue({ value, valueMode = 'text', chips = [] }) {
  if (valueMode === 'chips') {
    return <InsightChips chips={chips} compact />
  }

  return (
    <Typography level="title-md" sx={sx.value}>
      {value || '—'}
    </Typography>
  )
}

function InsightBody({
  value,
  subValue,
  chips = [],
  valueMode = 'text',
}) {
  return (
    <Box sx={sx.cardBody}>
      <InsightValue value={value} valueMode={valueMode} chips={chips} />

      {subValue ? (
        <Tooltip title={subValue} arrow>
          <Typography level="body-xs" sx={sx.subValue}>
            {subValue}
          </Typography>
        </Tooltip>
      ) : null}

    </Box>
  )
}

export function InsightCard({
  title = '',
  value = '—',
  subValue = '',
  icon = 'insights',
  color = '',
  chips = [],
  hideHeader = false,
  valueMode = 'text',
}) {
  return (
    <Sheet variant="plain" sx={sx.card(color)}>
      <Box sx={sx.accentBar(color)} />

      {!hideHeader ? (
        <InsightHeader title={title} icon={icon} color={color} />
      ) : null}

      <InsightBody
        value={value}
        subValue={subValue}
        chips={chips}
        valueMode={valueMode}
      />
    </Sheet>
  )
}

const resolveColumns = (count) => {
  if (count <= 1) return 1
  if (count === 2) return 2
  return 3
}

export function InsightRowsList({
  items = [],
  emptyText = 'אין נתונים להצגה',
  hideHeader = false,
}) {
  if (!Array.isArray(items) || !items.length) {
    return (
      <Typography level="body-sm" sx={sx.emptyText}>
        {emptyText}
      </Typography>
    )
  }

  const columns = resolveColumns(items.length)

  return (
    <Box sx={sx.grid(columns)}>
      {items.map((item, index) => (
        <InsightCard
          key={item?.id || `${item?.title || 'insight'}-${index}`}
          title={item?.title || ''}
          value={item?.value || '—'}
          subValue={item?.subValue || ''}
          icon={item?.icon || 'insights'}
          color={item?.color || ''}
          chips={item?.chips || []}
          hideHeader={hideHeader}
          valueMode={item?.valueMode || 'text'}
        />
      ))}
    </Box>
  )
}
