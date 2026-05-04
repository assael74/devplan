// ui/patterns/insights/InsightsChipsList.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { insightsPatternSx as sx } from './sx/insights.sx.js'

const hasValue = (value) => {
  return value !== undefined && value !== null && value !== ''
}

const resolveItemTitle = (item) => {
  return item?.title || item?.label || ''
}

const resolveItemValue = (item) => {
  if (hasValue(item?.value)) return item.value
  if (hasValue(item?.count)) return item.count
  return ''
}

const resolveItemSubValue = (item) => {
  return item?.subValue || item?.sub || item?.text || ''
}

const resolveItemIcon = (item, iconFallback) => {
  return item?.icon || item?.idIcon || item?.id || iconFallback
}

const shouldUseInsightLayout = (item) => {
  return hasValue(item?.title) || hasValue(item?.value) || hasValue(item?.subValue)
}

function InsightItemChip({ item, iconFallback, chipColor }) {
  const title = resolveItemTitle(item)
  const value = resolveItemValue(item)
  const subValue = resolveItemSubValue(item)

  return (
    <Chip
      key={item.id}
      size="md"
      variant="soft"
      color={item.color || chipColor}
      startDecorator={iconUi({ id: resolveItemIcon(item, iconFallback) })}
      sx={{
        maxWidth: '100%',
        minHeight: 34,
        justifyContent: 'flex-start',
        '& .MuiChip-label': {
          minWidth: 0,
          width: '100%',
        },
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          display: 'grid',
          gap: 0.15,
          textAlign: 'right',
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <Typography
            level="body-sm"
            sx={{
              fontWeight: 700,
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>

          {hasValue(value) ? (
            <Typography
              level="body-sm"
              sx={{
                fontWeight: 700,
                lineHeight: 1.25,
                opacity: 0.9,
              }}
            >
              {value}
            </Typography>
          ) : null}
        </Box>

        {hasValue(subValue) ? (
          <Typography
            level="body-xs"
            sx={{
              opacity: 0.72,
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subValue}
          </Typography>
        ) : null}
      </Box>
    </Chip>
  )
}

function CountItemChip({ item, iconFallback, chipColor }) {
  const title = resolveItemTitle(item)
  const value = resolveItemValue(item)

  return (
    <Chip
      key={item.id}
      size="md"
      variant="soft"
      color={item.color || chipColor}
      startDecorator={iconUi({ id: resolveItemIcon(item, iconFallback) })}
      sx={{ maxWidth: '100%' }}
    >
      {title}
      {hasValue(value) ? ` (${value})` : ''}
    </Chip>
  )
}

export default function InsightsChipsList({
  items = [],
  iconFallback = 'layers',
  chipColor = 'neutral',
  emptyText = 'אין נתונים להצגה',
}) {
  if (!items.length) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Box sx={sx.chipsWrap}>
      {items.map((item) => {
        if (shouldUseInsightLayout(item)) {
          return (
            <InsightItemChip
              key={item.id}
              item={item}
              iconFallback={iconFallback}
              chipColor={chipColor}
            />
          )
        }

        return (
          <CountItemChip
            key={item.id}
            item={item}
            iconFallback={iconFallback}
            chipColor={chipColor}
          />
        )
      })}
    </Box>
  )
}
