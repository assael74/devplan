// src/ui/forms/gameStats/inputs/StatsParameterHelp.js

import React, { useState } from 'react'
import { IconButton, Tooltip } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'

export default function StatsParameterHelp({ label, description }) {
  const [open, setOpen] = useState(false)
  if (!description) return null

  return (
    <Tooltip
      title={description}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      enterTouchDelay={0}
    >
      <IconButton
        size="sm"
        variant="plain"
        color="neutral"
        aria-label={`הסבר על ${label}`}
        onClick={event => {
          event.stopPropagation()
          setOpen(true)
        }}
        onKeyDown={event => event.stopPropagation()}
        sx={{ '--IconButton-size': '26px', minWidth: 26, minHeight: 26, flexShrink: 0, color: 'inherit' }}
      >
        {iconUi({ id: 'infoOutline', sx: { fontSize: 15 } })}
      </IconButton>
    </Tooltip>
  )
}
