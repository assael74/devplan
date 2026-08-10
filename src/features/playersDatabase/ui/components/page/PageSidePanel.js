// src/features/playersDatabase/ui/components/page/PageSidePanel.js

import { Stack } from '@mui/joy'

import InfoPanel from './InfoPanel.js'
import { pageSidePanelSx as sx } from './sx/pageSidePanel.sx.js'

export default function PageSidePanel({ children, scrollable = false }) {
  return (
    <InfoPanel sx={sx.panel}>
      <Stack
        spacing={1}
        className={scrollable ? 'dpScrollThin' : undefined}
        sx={scrollable ? sx.scrollableContent : sx.content}
      >
        {children}
      </Stack>
    </InfoPanel>
  )
}
