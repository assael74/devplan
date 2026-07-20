// features/playersDatabase/components/sharedUi/HorizontalScrollRail.js

import React from 'react'
import { Box, IconButton } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { scrollRailSx } from './sx/scroll.sx.js'

export default function HorizontalScrollRail({ children, sx }) {
  const railRef = React.useRef(null)

  const scrollRail = direction => {
    if (!railRef.current) return

    railRef.current.scrollBy({
      left: direction === 'right' ? 240 : -240,
      behavior: 'smooth',
    })
  }

  return (
    <Box
      sx={[scrollRailSx.railRoot, sx]}
    >
      <IconButton
        size="sm"
        sx={scrollRailSx.railButton}
        onClick={() => scrollRail('right')}
      >
        {iconUi({ id: 'forward' })}
      </IconButton>

      <Box
        ref={railRef}
        sx={scrollRailSx.railContent}
      >
        {children}
      </Box>

      <IconButton
        size="sm"
        sx={scrollRailSx.railButton}
        onClick={() => scrollRail('left')}
      >
        {iconUi({ id: 'back' })}
      </IconButton>
    </Box>
  )
}
