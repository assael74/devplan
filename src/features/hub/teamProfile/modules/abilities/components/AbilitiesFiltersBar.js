// teamProfile/modules/abilities/components/AbilitiesFiltersBar.js
import React from 'react'
import { Box, Chip, Input, Option, Select, Sheet } from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'

export default function AbilitiesFiltersBar(props) {
  const {
    sx,
    q,
    setQ,
    layerMode,
    setLayerMode,
    posMode,
    setPosMode,
    onlyUsable,
    setOnlyUsable,
    presentLayers,
    presentCodes,
    layerOrder,
    layerLabels,
    codeToLabel,
  } = props

  return (
    <Sheet variant="soft" sx={sx.filtersSheet}>
      <Box sx={sx.filtersRow}>
        <SearchRounded fontSize="small" />
        <Input
          size="sm"
          placeholder="חיפוש יכולת..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
        />

        <Select size="sm" value={layerMode} onChange={(e, v) => setLayerMode(v || 'all')}>
          <Option value="all">כל קווי המערך</Option>
          {layerOrder
            .filter((k) => presentLayers.has(k))
            .map((k) => (
              <Option key={k} value={`layer:${k}`}>
                {layerLabels[k] || k}
              </Option>
            ))}
        </Select>

        <Select size="sm" value={posMode} onChange={(e, v) => setPosMode(v || 'all')}>
          <Option value="all">כל העמדות</Option>
          {[...presentCodes].map((c) => (
            <Option key={c} value={`pos:${c}`}>
              {codeToLabel[c] || c} ({c})
            </Option>
          ))}
        </Select>

        <Chip size="sm" variant={onlyUsable ? 'solid' : 'soft'} onClick={() => setOnlyUsable((p) => !p)}>
          {onlyUsable ? 'רק עם נתונים' : 'כולל ללא נתונים'}
        </Chip>
      </Box>
    </Sheet>
  )
}
