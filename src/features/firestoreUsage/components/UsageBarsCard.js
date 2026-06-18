// src/features/firestoreUsage/components/UsageBarsCard.js

import React from 'react'
import {
  Box,
  Card,
  LinearProgress,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { cardSx as sx } from './sx/card.sx.js'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const resolveValue = (row, metric) =>
  Number(row?.[metric] || 0)

const resolveProgress = (value, maxValue) => {
  if (!maxValue || value <= 0) return 0

  return Math.min(
    100,
    Math.max(4, (value / maxValue) * 100)
  )
}

const formatMetric = (value, metric, maxValue) => {
  const valueText = (
    metric === 'estimatedReadKb' ||
    metric === 'estimatedWriteKb' ||
    metric === 'totalEstimatedKb'
  )
    ? `${numberFormatter.format(value)} KB`
    : numberFormatter.format(value)

  if (!maxValue) return valueText

  const percent = Math.round((value / maxValue) * 100)
  return `${valueText} · ${percent}%`
}

export default function UsageBarsCard({
  title,
  note,
  rows = [],
  metric = 'reads',
  limit = 6,
  limitOptions = [5, 10, 'all'],
  onLimitChange,
  onRowClick,
  emptyLabel = 'אין עדיין נתונים להצגה',
}) {
  const resolvedLimit = limit === 'all'
    ? rows.length
    : Number(limit || 6)

  const visibleRows = rows.slice(0, resolvedLimit)

  const maxValue = Math.max(
    0,
    ...visibleRows.map(row =>
      resolveValue(row, metric)
    )
  )

  return (
    <Card variant="outlined" sx={sx.card}>
      <Box sx={sx.boxWrap}>
        <Box>
          <Typography level="title-lg">
            {title}
          </Typography>

          {note ? (
            <Typography level="body-xs" textColor="text.tertiary">
              {note}
            </Typography>
          ) : null}
        </Box>

        {onLimitChange ? (
          <Select
            size="sm"
            variant="soft"
            value={limit}
            onChange={(_, value) => onLimitChange(value)}
            sx={{ minWidth: 96 }}
          >
            {limitOptions.map(option => (
              <Option key={option} value={option}>
                {option === 'all' ? 'הכל' : `Top ${option}`}
              </Option>
            ))}
          </Select>
        ) : null}
      </Box>

      {visibleRows.length === 0 ? (
        <Box sx={sx.boxRows}>
          <Typography level="body-sm" textColor="text.tertiary">
            {emptyLabel}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {visibleRows.map(row => {
            const value = resolveValue(row, metric)

            return (
              <Box
                key={row.key || row.name}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                sx={sx.boxGrid(Boolean(onRowClick))}
                onClick={() => onRowClick?.(row)}
                onKeyDown={event => {
                  if (!onRowClick) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onRowClick(row)
                  }
                }}
              >
                <Typography
                  level="body-sm"
                  fontWeight="lg"
                  noWrap
                  title={row.name}
                >
                  {row.name}
                </Typography>

                <LinearProgress
                  determinate
                  value={resolveProgress(value, maxValue)}
                  size="sm"
                  color={
                    metric.includes('Write')
                      ? 'success'
                      : metric.includes('Kb')
                        ? 'warning'
                        : 'primary'
                  }
                  sx={{
                    '--LinearProgress-radius': '999px',
                    '--LinearProgress-thickness': '10px',
                  }}
                />

                <Typography level="body-xs" textColor="text.tertiary" sx={sx.typo}>
                  {formatMetric(value, metric, maxValue)}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}
    </Card>
  )
}
