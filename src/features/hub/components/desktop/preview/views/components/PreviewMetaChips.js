import React from 'react'
import { Box } from '@mui/joy'

import { buildPreviewMetaChips } from '../logic/previewMetaChips.builders.js'

export default function PreviewMetaChips({
  entityType,
  entity,
  sx,
  context = {},
}) {
  const items = buildPreviewMetaChips({
    entityType,
    entity,
    sx,
    context,
  })

  if (!items.length) return null
  
  return (
    <Box sx={sx?.chipsRow}>
      {items.map((item, index) => (
        <React.Fragment key={item?.key || `${entityType}-${index}`}>
          {item?.node || null}
        </React.Fragment>
      ))}
    </Box>
  )
}
