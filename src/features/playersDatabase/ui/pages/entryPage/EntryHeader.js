// features/playersDatabase/ui/pages/entryPage/EntryHeader.js

import {
  Box,
  Stack,
} from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import DataOpsQuickAccessButton from '../../components/page/DataOpsQuickAccessButton.js'
import scoutIqTextImage from '../../../../../ui/core/images/scoutIQ&text.png'
import { DataPreviewGraphic } from './EntryVisuals.js'
import { entryHeaderSx as sx } from './sx/entryHeader.sx.js'

export default function EntryHeader({ breadcrumbs, onNavigateToDataOps }) {
  return (
    <Box sx={sx.header}>
      <Box sx={sx.headerVisual}>
        <DataPreviewGraphic onOpenDataOps={onNavigateToDataOps} />
      </Box>

      <Stack spacing={1.25} sx={sx.headerContent}>
        <Breadcrumbs items={breadcrumbs} />

        <DataOpsQuickAccessButton />

        <Box
          component='img'
          src={scoutIqTextImage}
          alt='ScoutIQ'
          sx={sx.scoutIqImage}
        />
      </Stack>
    </Box>
  )
}
