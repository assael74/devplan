// src/features/playersDatabase/ui/components/page/PageContentPanel.js

import {
  Box,
  Card,
} from '@mui/joy'

import PageSectionHeader from './PageSectionHeader.js'
import { pageContentPanelSx as sx } from './sx/pageContentPanel.sx.js'

export default function PageContentPanel({
  title,
  subtitle = '',
  meta = '',
  headerTone = 'default',
  headerActions = null,
  children,
  panelSx,
  contentSx,
}) {
  return (
    <Card sx={[sx.panel, panelSx]}>
      <PageSectionHeader
        title={title}
        subtitle={subtitle}
        meta={meta}
        tone={headerTone}
        actions={headerActions}
      />

      <Box sx={[sx.content, contentSx]}>
        {children}
      </Box>
    </Card>
  )
}
