// sC:\projects\devplan\src\ui\patterns\listVideosToolbar\ListVideosToolbarRow.js
import React from 'react'
import { Box, Typography, Input, Select, Option, IconButton } from '@mui/joy'
import { listToolbarRowSx as sx } from './listToolbarRow.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function ListVideosToolbarRow({
  title,
  query,
  onQuery,
  sortId,
  sortOptions,
  onSort,
  filtersLeft,
  actionsRight,
  dense = true,
  placeholder = 'חיפוש...',
}) {
  const opts = Array.isArray(sortOptions) ? sortOptions : []

  return (
    <Box sx={sx.root(dense)}>
      <Box sx={sx.left}>
        <Input
          size={dense ? 'sm' : 'md'}
          value={query || ''}
          onChange={(e) => onQuery && onQuery(e.target.value)}
          placeholder={placeholder}
          startDecorator={iconUi({ id: 'search' })}
          sx={sx.search}
        />

        {!!filtersLeft && <Box sx={sx.filters}>{filtersLeft}</Box>}
      </Box>

      <Box sx={sx.right}>
        {!!opts.length && (
          <Select
            size={dense ? 'sm' : 'md'}
            value={sortId || opts?.[0]?.id || ''}
            onChange={(e, v) => onSort && onSort(v)}
            startDecorator={iconUi({ id: 'sort' })}
            sx={sx.sort}
          >
            {opts.map((o) => (
              <Option key={String(o.id)} value={o.id}>
                {o.label}
              </Option>
            ))}
          </Select>
        )}

        {!!actionsRight && <Box sx={sx.actions}>{actionsRight}</Box>}

        {/* optional: clear query */}
        {!!onQuery && (
          <IconButton
            size={dense ? 'sm' : 'md'}
            variant="soft"
            onClick={() => onQuery('')}
            disabled={!query}
            sx={sx.clearBtn}
          >
            {iconUi({ id: 'x' })}
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
