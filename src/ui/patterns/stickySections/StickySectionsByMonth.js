// src/ui/patterns/stickySections/StickySectionsByMonth.js
import React, { useMemo } from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { stickySectionsByMonthSx as sx } from './stickySectionsByMonth.sx.js'

const asArr = (v) => (Array.isArray(v) ? v : [])

export default function StickySectionsByMonth({
  items,
  getMonthKey,
  getMonthLabel,
  renderItem,
  headerTop = 44,
  gridSx,
}) {
  const list = asArr(items)

  const groups = useMemo(() => {
    const map = new Map()
    list.forEach((it) => {
      const k = (getMonthKey && getMonthKey(it)) || 'unknown'
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(it)
    })

    // sort descending by key if key is YYYY-MM
    const keys = Array.from(map.keys()).sort((a, b) => String(b).localeCompare(String(a)))
    return keys.map((k) => ({ key: k, items: map.get(k) || [] }))
  }, [list, getMonthKey])

  return (
    <Box sx={sx.root}>
      {groups.map((g, gi) => {
        const label = (getMonthLabel && getMonthLabel(g.key)) || g.key
        const isFirst = gi === 0

        return (
          <Box key={String(g.key)} sx={sx.section(isFirst)}>
            <Box sx={sx.header(headerTop, isFirst)}>
              <Typography
                level="title-sm"
                sx={sx.headerTitle}
                noWrap
                endDecorator={
                  <Chip size="sm" variant="outlined">
                    {g.items.length}
                  </Chip>
                }
              >
                {label}
              </Typography>
            </Box>

            <Box sx={[sx.grid, gridSx]}>
              {g.items.map((it, idx) => (
                <Box key={String(it?.id || idx)} sx={sx.cell}>
                  {renderItem ? renderItem(it) : null}
                </Box>
              ))}
            </Box>
          </Box>
        )
       })}
    </Box>
  )
}
