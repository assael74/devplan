// src/ui/core/icons/iconUi.js

import * as React from 'react'
import { appIconMap } from './registry'

export function iconUi({ id, size = 'md', style = {}, sx = {} }) {
  const icon = appIconMap[id]
  if (!icon) return null

  return React.cloneElement(icon, {
    fontSize: size,
    style: {
      ...(icon.props?.style || {}),
      ...style,
    },
    sx: {
      ...(icon.props?.sx || {}),
      ...sx,
    },
  })
}
