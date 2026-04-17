// preview/previewDomainCard/domains/scouting/ScoutPositionsButton.js
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Divider, Button, Tooltip, Sheet, Typography } from '@mui/joy'

import { scoutPreviewSx } from './scoutPreview.sx.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function ScoutPositionsButton({ label, value = [], onOpen, disabled }) {
  const positions = Array.isArray(value) ? value.filter(Boolean) : []
  const summary = positions.length ? positions.join(' • ') : 'בחר עמדות'

  return (
    <Button
      size="sm"
      variant="outlined"
      onClick={onOpen}
      disabled={disabled}
      startDecorator={iconUi({id: 'positions'})}
      sx={{
        borderRadius: 12,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
        <Typography level="body-xs" >
          {label}:
        </Typography>
        <Typography level="body-xs" sx={{ opacity: positions.length ? 0.9 : 0.55 }}>
          {summary}
        </Typography>
      </Box>
    </Button>
  )
}
